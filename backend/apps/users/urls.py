from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView
from .views import CreateClientView 

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("register/",CreateClientView.as_view(),name="create-client"),
]