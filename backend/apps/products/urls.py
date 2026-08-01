# backend/apps/products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductMenuView, ProductManageViewSet, CategoryListView

router = DefaultRouter()
router.register(r'products', ProductMenuView, basename='product-menu')
router.register(r'manage/products', ProductManageViewSet, basename='product-manage')

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', include(router.urls)),
]
