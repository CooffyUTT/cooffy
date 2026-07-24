# backend/apps/products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductMenuView

router = DefaultRouter()
router.register(r'products', ProductMenuView, basename='product-menu')

urlpatterns = [
    path('', include(router.urls)),
]
