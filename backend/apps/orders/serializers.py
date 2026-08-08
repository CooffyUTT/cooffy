from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Max
from rest_framework import serializers
from .models import Order, OrderProduct, PaymentMethod
from apps.branches.models import Branch
from apps.products.models import Product
from apps.users.models import User


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'is_digital', 'active']
        read_only_fields = ('id',)


class OrderProductSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderProduct
        fields = ['id', 'item_id', 'name', 'category_name', 'quantity', 'price', 'excluded_modifiers']
        read_only_fields = ('id',)

    def get_name(self, obj):
        product = Product.objects.filter(pk=obj.item_id).only('name').first()
        return product.name if product else 'Producto no disponible'

    def get_category_name(self, obj):
        product = Product.objects.filter(pk=obj.item_id).select_related('category').first()
        return product.category.name if product and product.category else None


class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'date',
            'branch_id',
            'client_id',
            'total',
            'state',
            'payment_status',
            'created_at',
            'updated_at',
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'date',
            'branch_id',
            'client_id',
            'created_at',
            'updated_at',
            'prepared_at',
            'picked_up_at',
            'scheduled_pickup_at',
            'total',
            'state',
            'payment_method',
            'payment_status',
            'comment',
            'order_products',
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'branch_id',
            'client_id',
            'scheduled_pickup_at',
            'total',
            'state',
            'payment_method',
            'payment_status',
            'comment',
            'order_products',
        ]

    def validate_order_products(self, value):
        if not value:
            raise serializers.ValidationError("El pedido debe tener al menos un producto.")
        return value

    def validate_branch_id(self, value):
        branch = Branch.objects.filter(pk=value).first()
        if branch is None:
            raise serializers.ValidationError("La sucursal indicada no existe.")
        if not branch.accepting_orders:
            raise serializers.ValidationError(
                "Esta sucursal no está aceptando pedidos en este momento."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        products_data = validated_data.pop('order_products')

        max_num = Order.objects.aggregate(max_num=Max('order_number'))['max_num'] or 0
        order_number = max_num + 1

        date = timezone.now().date()

        order = Order.objects.create(
            order_number=order_number,
            date=date,
            **validated_data
        )

        for p in products_data:
            OrderProduct.objects.create(order=order, **p)

        order.total = order.order_products.aggregate(total=Sum('price'))['total'] or Decimal('0.00')
        order.save(update_fields=['total'])

        return order


class KitchenOrderSerializer(serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True, read_only=True)
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'client_name',
            'state',
            'payment_status',
            'comment',
            'created_at',
            'order_products',
        ]

    def get_client_name(self, obj):
        client = User.objects.filter(pk=obj.client_id).only('name', 'lastname').first()
        if not client:
            return 'Cliente'
        return f"{client.name} {client.lastname}".strip() if client.lastname else client.name