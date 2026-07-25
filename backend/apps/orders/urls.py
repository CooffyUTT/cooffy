from django.urls import path

from apps.orders.views import OrderDetailView, OrderListCreateView, OrderProductCreateView

urlpatterns = [
    path("", OrderListCreateView.as_view(), name="orders-list-create"),
    path("product/", OrderProductCreateView.as_view(), name="order-product-create"),
    path("<int:pk>/", OrderDetailView.as_view(), name="orders-detail"),
]