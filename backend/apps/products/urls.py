# backend/apps/products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryListView, ProductMenuView

router = DefaultRouter()
router.register(r'products', ProductMenuView, basename='product-menu')

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', include(router.urls)),
]
