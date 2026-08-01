from rest_framework import generics, viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductMenuListSerializer,
    ProductMenuDetailSerializer,
)


class CategoryListView(generics.ListAPIView):
    """GET /api/menu/categories/"""
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class ProductMenuView(viewsets.ReadOnlyModelViewSet):
    """Endpoint /api/menu/products/"""
    permission_classes = [IsAuthenticated]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        qs = Product.objects.filter(active=True).select_related('category')
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductMenuListSerializer
        if self.action == 'retrieve':
            return ProductMenuDetailSerializer
        return super().get_serializer_class()
