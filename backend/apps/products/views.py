from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Product
from .permissions import IsManagerOrSupervisor
from .serializers import (
    ProductMenuListSerializer,
    ProductMenuDetailSerializer,
    ProductManageSerializer,
)

class ProductMenuView(viewsets.ReadOnlyModelViewSet):
    """Endpoint /api/menu/products/"""
    queryset = Product.objects.filter(active=True)        # solo activos
    permission_classes = [IsAuthenticated]

    # Search and ordering configuration for Django
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']

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

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Habilita o deshabilita un producto"""
        product = self.get_object()
        product.active = not product.active
        product.save(update_fields=['active', 'updated_at'])
        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
