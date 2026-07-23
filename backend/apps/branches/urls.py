from django.urls import path
from .views import BranchListView

urlpatterns = [
    path('school/<int:school_id>/', BranchListView.as_view(), name='branch-list'),
]
