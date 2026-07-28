from django.urls import path
from .views import SchoolView, SchoolDetailView

urlpatterns = [
    path('', SchoolView.as_view(), name='school-list'), #todas las escuelas
    path('<int:pk>/', SchoolDetailView.as_view(), name='school-detail'), #una escuela
]