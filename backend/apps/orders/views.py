from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Order, OrderProduct
from .serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    OrderCreateSerializer,
)
from apps.products.models import Product


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["order_number", "state", "payment_status"]
    ordering_fields = ["created_at", "date", "order_number"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return OrderListSerializer
        if self.action in ("retrieve", "update", "partial_update"):
            return OrderDetailSerializer
        if self.action == "create":
            return OrderCreateSerializer
        return OrderDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)
        client_id = self.request.query_params.get("client_id")

        if client_id is not None:
            qs = qs.filter(client_id=client_id)

        if user and not getattr(user, "is_staff", False):
            qs = qs.filter(client_id=getattr(user, "id", None))

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        order = self.get_object()

        if "state" in request.data:
            order.state = request.data.get("state", order.state)
        if "payment_status" in request.data:
            order.payment_status = request.data.get("payment_status", order.payment_status)
        if "payment_method" in request.data:
            order.payment_method = request.data.get("payment_method", order.payment_method)
        if "comment" in request.data:
            order.comment = request.data.get("comment", order.comment)
        if "total" in request.data:
            order.total = Decimal(str(request.data.get("total")))
        else:
            order.total = order.order_products.aggregate(total=Sum("price"))["total"] or Decimal("0.00")

        order.save()
        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="add-product")
    @transaction.atomic
    def add_product(self, request, pk=None):
        order = self.get_object()

        quantity = int(request.data.get("quantity", 1))
        item_id = request.data.get("item_id")

        if request.data.get("price") is not None:
            unit_price = Decimal(str(request.data.get("price")))
        else:
            product = get_object_or_404(Product, pk=item_id)
            unit_price = product.price

        line_total = unit_price * quantity

        OrderProduct.objects.create(
            order=order,
            item_id=item_id,
            quantity=quantity,
            price=line_total,
            excluded_modifiers=request.data.get("excluded_modifiers", []),
        )

        order.total = order.order_products.aggregate(total=Sum("price"))["total"] or Decimal("0.00")
        order.save(update_fields=["total"])

        order.refresh_from_db()
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)