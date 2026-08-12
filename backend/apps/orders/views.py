from decimal import Decimal
from datetime import datetime, timedelta
from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Order, OrderProduct
from .serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    OrderCreateSerializer,
    OrderProductCreateSerializer,
)
from .services import get_unavailable_products, PRE_ORDER_KITCHEN_LEAD_MINUTES, pre_order_release_cutoff
from .state_machine import can_transition
from apps.branches.models import Branch
from apps.products.models import Product


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["order_number", "state", "payment_status"]
    ordering_fields = ["created_at", "date", "order_number"]
    ordering = ["-created_at"]
    pagination_class = None

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
        state = self.request.query_params.get("state")
        branch_id = self.request.query_params.get("branch_id")
        date = self.request.query_params.get("date")  # FIX: Captura de la variable 'date'
        upcoming = self.request.query_params.get("upcoming")

        if client_id is not None:
            qs = qs.filter(client_id=client_id)

        is_kitchen_staff = user and user.groups.filter(
            name__in=["empleado", "gerente"]
        ).exists()

        if is_kitchen_staff and getattr(user, "branch_id", None):
            qs = qs.filter(branch_id=user.branch_id)
        elif user and not getattr(user, "is_staff", False) and not is_kitchen_staff:
            qs = qs.filter(client_id=getattr(user, "id", None))

        if upcoming is not None and upcoming.lower() in ("true", "1", "yes", "on"):
            # RN-31: pestaña de pedidos anticipados. Solo personal de cocina.
            if not is_kitchen_staff:
                self.permission_denied(
                    self.request,
                    message=(
                        "Solo el personal de cocina puede consultar los "
                        "pedidos anticipados."
                    ),
                )
            cutoff = pre_order_release_cutoff()
            return qs.filter(
                scheduled_pickup_at__gt=cutoff,
                state__in=[
                    Order.State.PENDING,
                    Order.State.PREPARING,
                    Order.State.READY,
                ],
            ).order_by("scheduled_pickup_at")

        if state is not None:
            qs = qs.filter(state=state)

        if date:
            try:
                datetime.strptime(date, "%Y-%m-%d")
            except ValueError:
                raise ValidationError({"date": "Formato de fecha inválido. Use YYYY-MM-DD."})
            # RN-29: un pre-order creado ayer con recogida hoy se ve en la cola de hoy.
            if is_kitchen_staff:
                qs = qs.filter(Q(date=date) | Q(scheduled_pickup_at__date=date))
            else:
                qs = qs.filter(date=date)

        # RN-29: los pre-orders aún no liberados no entran a la cola pending.
        if is_kitchen_staff and state == "pending":
            qs = qs.exclude(scheduled_pickup_at__gt=pre_order_release_cutoff())

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED
        )

    def _is_kitchen_staff(self, user):
        return user.groups.filter(name__in=["empleado", "gerente"]).exists()

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        order = self.get_object()

        new_state = request.data.get("state")

        if new_state and new_state != order.state:
            if not self._is_kitchen_staff(request.user):
                return Response(
                    {"detail": "Solo el personal de cocina puede cambiar el estado de un pedido."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if not can_transition(order.state, new_state):
                return Response(
                    {"detail": f"No se puede cambiar de '{order.state}' a '{new_state}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            order.state = new_state

            if new_state == Order.State.PREPARING:
                order.prepared_at = timezone.now()
            elif new_state == Order.State.PICKED_UP:
                order.picked_up_at = timezone.now()

        allowed_fields = {"payment_method", "comment"}
        for field in allowed_fields:
            if field in request.data:
                setattr(order, field, request.data[field])

        if "payment_status" in request.data:
            new_payment_status = request.data["payment_status"]
            if not self._is_kitchen_staff(request.user):
                return Response(
                    {"detail": "Solo el personal de caja puede cambiar el estado de pago."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if not (order.payment_status == Order.PaymentStatus.PENDING and
                    new_payment_status == Order.PaymentStatus.PAID):
                return Response(
                    {"detail": "El pago únicamente puede confirmarse de 'pending' a 'paid'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if order.payment_method_id != 1:
                return Response(
                    {"detail": "Solo los pedidos en efectivo requieren confirmación de pago."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            order.payment_status = new_payment_status

        order.save()

        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="add-product")
    @transaction.atomic
    def add_product(self, request, pk=None):
        order = self.get_object()

        if str(order.client_id) != str(request.user.id):
            return Response(
                {"detail": "No tienes permiso para modificar este pedido."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if order.state != Order.State.PENDING:
            return Response(
                {"detail": "No se pueden agregar productos a un pedido que ya no está en espera."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        quantity = int(request.data.get("quantity", 1))
        item_id = request.data.get("item_id")

        product = get_object_or_404(Product, pk=item_id, active=True)

        if product.max_per_order and quantity > product.max_per_order:
            return Response(
                {
                    "detail": (
                        f"'{product.name}' tiene un límite de "
                        f"{product.max_per_order} unidades por pedido."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        unavailable = get_unavailable_products(
            order.branch_id, [{"item_id": item_id}]
        )
        if unavailable:
            return Response(
                {
                    "detail": (
                        f"'{unavailable[0].product_name}' no está disponible "
                        "en la sucursal del pedido."
                    ),
                    "unavailable": [
                        {
                            "item_id": u.product_id,
                            "name": u.product_name,
                            "reason": u.reason,
                            "message": u.message,
                        }
                        for u in unavailable
                    ],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Crear o actualizar el producto dentro del pedido
        existing = order.order_products.filter(item_id=item_id).first()
        if existing:
            existing.quantity += quantity
            existing.price = product.price * existing.quantity
            existing.save(update_fields=["quantity", "price"])
        else:
            line_total = product.price * quantity
            OrderProduct.objects.create(
                order=order,
                item_id=item_id,
                quantity=quantity,
                price=line_total,
                excluded_modifiers=request.data.get("excluded_modifiers", []),
            )

        # 2. Recalcular el subtotal y total de la orden
        subtotal = (
            order.order_products.aggregate(total=Sum("price"))["total"]
            or Decimal("0.00")
        )
        
        order.total = subtotal
        order.save(update_fields=["total"])

        order.refresh_from_db()
        return Response(
            OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        """RN-30: un cliente cancela su pedido anticipado dentro de la ventana."""
        order = get_object_or_404(Order, pk=pk)

        if order.client_id != request.user.id:
            return Response(
                {"detail": "No tienes permiso para cancelar este pedido."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if order.scheduled_pickup_at is None:
            return Response(
                {"detail": "Este pedido no es un pedido anticipado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.state != Order.State.PENDING:
            return Response(
                {
                    "detail": (
                        "Solo puedes cancelar un pedido anticipado que aún esté en espera."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        branch = Branch.objects.filter(pk=order.branch_id).first()
        if branch is not None:
            now = timezone.now()
            min_anticipation = timedelta(
                minutes=branch.min_anticipation_minutes
            )
            if order.scheduled_pickup_at - now < min_anticipation:
                return Response(
                    {"detail": "El pedido ya está fuera de la ventana de cancelación."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        order.state = Order.State.CANCELLED
        order.save(update_fields=["state", "updated_at"])

        return Response(OrderDetailSerializer(order).data)

    @action(detail=False, methods=["get"], url_path="my-orders")
    def my_orders(self, request):
        qs = self.get_queryset()
        serializer = OrderListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)
