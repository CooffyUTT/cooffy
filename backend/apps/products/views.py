from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Product
from .serializers import (
    ProductMenuListSerializer,
    ProductMenuDetailSerializer,
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
