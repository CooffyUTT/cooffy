from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BranchViewSet, CompanyViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'', BranchViewSet, basename='branch')

urlpatterns = [
    path('', include(router.urls)),
]
