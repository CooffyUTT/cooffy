from decimal import Decimal

from django.db import transaction
from django.db.models import Max
from django.utils import timezone
from rest_framework import serializers

from apps.products.models import Product
from apps.users.models import User
from .models import Order, OrderProduct
from .services import get_unavailable_products


class OrderProductSerializer(serializers.ModelSerializer):
    """
    Serializer unificado para OrderProduct que incluye soporte para
    los nombres de productos e imágenes en la respuesta JSON.
    """
    product_name = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()
    item_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderProduct
        fields = [
            "id",
            "item_id",
            "quantity",
            "price",
            "excluded_modifiers",
            "product_name",
            "item_name",
            "item_image",
        ]
        read_only_fields = ("id", "price")

    def _get_product(self, item_id):
        context = self.context or {}
        products = context.setdefault("_products", {})
        if item_id not in products:
            products[item_id] = Product.objects.filter(pk=item_id).first()
        return products[item_id]

    def get_product_name(self, obj):
        products_map = self.context.get("products_map", {})
        if obj.item_id in products_map:
            return products_map[obj.item_id].name
        product = self._get_product(obj.item_id)
        return product.name if product else f"Producto #{obj.item_id}"

    def get_item_name(self, obj):
        return self.get_product_name(obj)

    def get_item_image(self, obj):
        product = self._get_product(obj.item_id)
        if not product or not product.image:
            return None
        request = self.context.get("request") if self.context else None
        if request is not None:
            return request.build_absolute_uri(product.image.url)
        return product.image.url


class OrderProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProduct
        fields = ["item_id", "quantity", "excluded_modifiers"]

    def validate_item_id(self, value):
        if not Product.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El producto no existe.")
        return value

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1.")
        return value


class OrderClientNameMixin:
    def _get_client(self, client_id):
        context = self.context or {}
        clients = context.setdefault("_clients", {})
        if client_id not in clients:
            clients[client_id] = User.objects.filter(pk=client_id).only("name", "lastname").first()
        return clients[client_id]

    def get_client_name(self, obj):
        user = self._get_client(obj.client_id)
        if not user:
            return None
        full_name = f"{user.name} {user.lastname}".strip()
        return full_name or user.name


class OrderListSerializer(OrderClientNameMixin, serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True, read_only=True)
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "date",
            "branch_id",
            "client_id",
            "client_name",
            "total",
            "state",
            "payment_method",
            "payment_status",
            "created_at",
            "comment",
            "order_products",
        ]


class OrderDetailSerializer(OrderClientNameMixin, serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True, read_only=True)
    client_name = serializers.SerializerMethodField()
    iva = serializers.SerializerMethodField()
    estimated_completion_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "date",
            "branch_id",
            "client_id",
            "client_name",
            "created_at",
            "prepared_at",
            "picked_up_at",
            "scheduled_pickup_at",
            "total",
            "iva",
            "state",
            "payment_method",
            "payment_status",
            "comment",
            "updated_at",
            "order_products",
            "estimated_completion_minutes",
        ]

    def get_estimated_completion_minutes(self, obj):
        estimates = {
            Order.State.PENDING: 15,
            Order.State.PREPARING: 10,
            Order.State.READY: 0,
            Order.State.PICKED_UP: 0,
            Order.State.REJECTED: 0,
        }
        return estimates.get(obj.state, 0)

    def get_iva(self, obj):
        subtotal = sum(op.price for op in obj.order_products.all())
        # Prices already include IVA; expose only the tax portion of the total.
        iva = subtotal - (subtotal / Decimal("1.08"))
        return str(iva.quantize(Decimal("0.01")))

    def to_representation(self, instance):
        data = super().to_representation(instance)
        item_ids = {op["item_id"] for op in data.get("order_products", [])}
        if item_ids:
            products = Product.objects.filter(pk__in=item_ids)
            products_map = {p.pk: p for p in products}
        else:
            products_map = {}
        for op in data.get("order_products", []):
            product = products_map.get(op["item_id"])
            op["product_name"] = product.name if product else f"Producto #{op['item_id']}"
        return data


class OrderCreateSerializer(serializers.ModelSerializer):
    order_products = OrderProductCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "branch_id",
            "scheduled_pickup_at",
            "payment_method",
            "comment",
            "order_products",
        ]
        read_only_fields = ("total",)

    def validate_branch_id(self, value):
        from apps.branches.models import Branch

        branch = Branch.objects.filter(pk=value, active=True).first()
        if not branch:
            raise serializers.ValidationError("La sucursal no existe o está inactiva.")
        if not branch.accepting_orders:
            raise serializers.ValidationError("Esta sucursal no está aceptando pedidos en este momento.")
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
            missing_products = Product.objects.filter(pk__in=missing_ids)
            missing_names = {
                p.pk: p.name
                for p in missing_products.only("pk", "name")
            }
            missing_details = [
                f"'{missing_names.get(pid, f'Producto #{pid}')}' (ID: {pid})"
                for pid in missing_ids
            ]
            raise serializers.ValidationError(
                f"Los siguientes productos están inactivos o no existen: "
                + "; ".join(missing_details)
            )

        for p in products_data:
            product = products_map[p["item_id"]]
            quantity = p["quantity"]
            if product.max_per_order and quantity > product.max_per_order:
                raise serializers.ValidationError(
                    f"'{product.name}' tiene un límite de {product.max_per_order} "
                    f"unidades por pedido. Intentaste agregar {quantity}."
                )

        unavailable = get_unavailable_products(branch_id, products_data)
        if unavailable:
            reason_labels = {
                "not_offered": "No disponible en esta sucursal",
                "out_of_stock": "Sin stock en esta sucursal",
            }
            raise serializers.ValidationError({
                "order_products": [
                    {
                        "item_id": u.product_id,
                        "name": u.product_name,
                        "reason": reason_labels.get(u.reason, u.reason),
                    }
                    for u in unavailable
                ]
            })

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
