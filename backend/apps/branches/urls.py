from django.urls import path
from .views import BranchByCompanyView

urlpatterns = [
    path('', BranchByCompanyView.as_view(), name='branch-list'),
]
