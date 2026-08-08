from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BranchViewSet, BranchPublicViewSet, CompanyViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'public', BranchPublicViewSet, basename='branch-public')
router.register(r'', BranchViewSet, basename='branch')

urlpatterns = [
    path('', include(router.urls)),
]
