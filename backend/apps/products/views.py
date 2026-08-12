
from django.shortcuts import render
from rest_framework import viewsets, filters, status, generics
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.branches.models import Branch

from .models import Product, Category, ProductStock
from .permissions import IsManagerOrSupervisor
from .serializers import (
    CategorySerializer,
    ProductMenuListSerializer,
    ProductMenuDetailSerializer,
    ProductManageSerializer,
    ProductStockAssignSerializer,
)


class CategoryListView(generics.ListAPIView):
    """GET /api/menu/categories/"""
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class ProductMenuView(viewsets.ReadOnlyModelViewSet):
    """Endpoint /api/menu/products/"""
    permission_classes = [IsAuthenticated]
    # Search and ordering configuration for Django
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        qs = (
            Product.objects.filter(active=True)
            .select_related('category')
            .prefetch_related('branch_stocks')
        )
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        branch = self.request.query_params.get('branch')
        if branch is not None:
            if not branch.isdigit():
                raise ValidationError({'branch': 'El parámetro "branch" debe ser un número entero.'})
            qs = qs.filter(branch_stocks__branch_id=int(branch))
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        branch = self.request.query_params.get('branch')
        if branch is not None and branch.isdigit():
            context['branch_id'] = int(branch)
        return context

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductMenuListSerializer
        if self.action == 'retrieve':
            return ProductMenuDetailSerializer
        return super().get_serializer_class()


class ProductManageViewSet(viewsets.ModelViewSet):
    """
    Endpoint /api/menu/manage/products/
    """
    queryset = Product.objects.all()
    serializer_class = ProductManageSerializer
    permission_classes = [IsAuthenticated, IsManagerOrSupervisor]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().prefetch_related('branch_stocks')

    def _get_authorized_branch(self, user, branch_id):
        """Sucursal activa de una empresa del gerente (RN-23); 404 si no."""
        queryset = Branch.objects.filter(id=branch_id)
        if not user.is_superuser:
            queryset = queryset.filter(active=True, company__owner=user)
        branch = queryset.first()
        if branch is None:
            raise NotFound('No existe una sucursal activa de tu empresa con ese ID.')
        return branch

    @action(detail=True, methods=['post', 'delete'], url_path='stocks')
    def stocks(self, request, pk=None):
        """Gestiona la relación ProductStock por sucursal (RF-06).

        POST   {branch_id, stock?} -> asigna o actualiza (upsert).
        DELETE ?branch_id=X        -> desasigna la sucursal.
        Solo gerentes (o superusuarios) sobre sucursales activas propias.
        """
        user = request.user
        if not (user.is_superuser or user.groups.filter(name='gerente').exists()):
            raise PermissionDenied('Solo los gerentes pueden gestionar los stocks por sucursal.')

        product = self.get_object()

        if request.method == 'DELETE':
            raw = request.query_params.get('branch_id')
            if raw is None or not str(raw).isdigit():
                raise ValidationError({'branch_id': 'El parámetro "branch_id" debe ser un número entero.'})
            branch = self._get_authorized_branch(user, int(raw))
            deleted, _ = ProductStock.objects.filter(branch=branch, product=product).delete()
            if not deleted:
                raise NotFound('El producto no está asignado a esa sucursal.')
            return Response(status=status.HTTP_204_NO_CONTENT)

        body = ProductStockAssignSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        branch = self._get_authorized_branch(user, body.validated_data['branch_id'])
        stock = body.validated_data.get('stock', ProductStock.StockState.NOT_TRACKED)
        ProductStock.objects.update_or_create(
            branch=branch,
            product=product,
            defaults={'stock': stock},
        )
        product.refresh_from_db()
        return Response(self.get_serializer(product).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Habilita o deshabilita un producto"""
        product = self.get_object()
        product.active = not product.active
        product.save(update_fields=['active', 'updated_at'])
        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
