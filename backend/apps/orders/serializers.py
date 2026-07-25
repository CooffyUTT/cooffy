from decimal import Decimal
from django.db import transaction
from rest_framework import serializers
from .models import Order, OrderProduct

class OrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProduct
        fields = ['id', 'item_id', 'quantity', 'price', 'excluded_modifiers']

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
            'order_number',
            'date',
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

    @transaction.atomic
    def create(self, validated_data):
        products_data = validated_data.pop('order_products')
        order = Order.objects.create(**validated_data)
        for p in products_data:
            OrderProduct.objects.create(order=order, **p)
        return order