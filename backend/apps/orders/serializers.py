from decimal import Decimal

from django.db import transaction
from django.db.models import Max, Q
from django.utils import timezone
from rest_framework import serializers

from apps.products.models import Product

from .models import Order, OrderProduct


class OrderProductSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderProduct
        fields = ["id", "item_id", "quantity", "price", "excluded_modifiers", "product_name"]
        read_only_fields = ("id", "price")

    def get_product_name(self, obj):
        try:
            product = Product.objects.get(pk=obj.item_id)
            return product.name
        except Product.DoesNotExist:
            return f"Producto #{obj.item_id}"


class OrderListSerializer(serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "date",
            "branch_id",
            "client_id",
            "total",
            "state",
            "payment_status",
            "created_at",
            "order_products",
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "date",
            "branch_id",
            "client_id",
            "created_at",
            "prepared_at",
            "picked_up_at",
            "scheduled_pickup_at",
            "total",
            "state",
            "payment_method",
            "payment_status",
            "comment",
            "order_products",
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "branch_id",
            "scheduled_pickup_at",
            "payment_method",
            "comment",
            "order_products",
        ]

    def validate_branch_id(self, value):
        from apps.branches.models import Branch

        if not Branch.objects.filter(pk=value, active=True).exists():
            raise serializers.ValidationError("La sucursal no existe o está inactiva.")
        return value

    def validate_order_products(self, value):
        if not value:
            raise serializers.ValidationError(
                "El pedido debe tener al menos un producto."
            )
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        branch_id = attrs.get("branch_id")
        products_data = attrs.get("order_products", [])

        active_order_exists = Order.objects.filter(
            client_id=user.id,
            branch_id=branch_id,
            state__in=[Order.State.PENDING, Order.State.PREPARING],
        ).exists()
        if active_order_exists:
            raise serializers.ValidationError(
                "Ya tienes un pedido activo en esta sucursal."
            )

        product_ids = [p["item_id"] for p in products_data]
        products = Product.objects.filter(pk__in=product_ids, active=True)
        products_map = {p.pk: p for p in products}

        missing_ids = [pid for pid in product_ids if pid not in products_map]
        if missing_ids:
            raise serializers.ValidationError(
                f"Productos no disponibles o inactivos: {missing_ids}"
            )

        for p in products_data:
            product = products_map[p["item_id"]]
            quantity = p["quantity"]
            if product.max_per_order and quantity > product.max_per_order:
                raise serializers.ValidationError(
                    f"'{product.name}' tiene un límite de {product.max_per_order} "
                    f"unidades por pedido. Intentaste agregar {quantity}."
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        products_data = validated_data.pop("order_products")
        user = self.context["request"].user

        product_ids = [p["item_id"] for p in products_data]
        products = Product.objects.filter(pk__in=product_ids)
        products_map = {p.pk: p for p in products}

        last_order = (
            Order.objects.filter(
                branch_id=validated_data["branch_id"],
                date=timezone.now().date(),
            )
            .aggregate(max_num=Max("order_number"))
            .get("max_num")
        )
        order_number = (last_order or 0) + 1

        order = Order.objects.create(
            order_number=order_number,
            date=timezone.now().date(),
            client_id=user.id,
            **validated_data,
        )

        total = Decimal("0.00")
        for p in products_data:
            product = products_map[p["item_id"]]
            line_total = product.price * p["quantity"]
            OrderProduct.objects.create(
                order=order,
                item_id=p["item_id"],
                quantity=p["quantity"],
                price=line_total,
                excluded_modifiers=p.get("excluded_modifiers", []),
            )
            total += line_total

        order.total = total
        order.save(update_fields=["total"])

        return order
