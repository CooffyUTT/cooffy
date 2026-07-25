from decimal import Decimal

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order, OrderProduct
from apps.orders.serializers import serialize_order
from apps.products.models import Product


class OrderListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        orders = Order.objects.all()
        client_id = request.query_params.get("client_id")
        if client_id is not None:
            orders = orders.filter(client_id=client_id)
        return Response([serialize_order(order) for order in orders.order_by("-created_at")])

    def post(self, request):
        try:
            order = Order.objects.create(
                order_number=request.data.get("order_number"),
                date=request.data.get("date"),
                branch_id=request.data.get("branch_id", 1),
                client_id=request.data.get("client_id"),
                payment_method=request.data.get("payment_method"),
                comment=request.data.get("comment", ""),
            )
            return Response(serialize_order(order), status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class OrderProductCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            order = get_object_or_404(Order, pk=request.data.get("order_id"))

            quantity = int(request.data.get("quantity", 1))
            item_id = request.data.get("item_id")

            if request.data.get("price") is not None:
                unit_price = Decimal(str(request.data.get("price")))
            else:
                product = Product.objects.get(pk=item_id)
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

            return Response(serialize_order(order), status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        return Response(serialize_order(order))

    def put(self, request, pk):
        try:
            order = get_object_or_404(Order, pk=pk)

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

            return Response(serialize_order(order))
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)