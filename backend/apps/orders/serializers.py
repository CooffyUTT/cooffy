from django.db import transaction
from django.utils import timezone
from django.db.models import Max
from rest_framework import serializers
from .models import Order, OrderProduct
from apps.products.models import Product


class OrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProduct
        fields = ['id', 'item_id', 'quantity', 'price', 'excluded_modifiers']
        read_only_fields = ('id',)


class OrderProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProduct
        fields = ['item_id', 'quantity', 'excluded_modifiers']

    def validate_item_id(self, value):
        if not Product.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El producto no existe.")
        return value

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1.")
        return value


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
    order_products = OrderProductCreateSerializer(many=True)

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
        read_only_fields = ('total',)

    def validate_order_products(self, value):
        if not value:
            raise serializers.ValidationError("El pedido debe tener al menos un producto.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        products_data = validated_data.pop('order_products')

        item_ids = [p['item_id'] for p in products_data]
        products = Product.objects.in_bulk(item_ids)

        max_num = Order.objects.aggregate(max_num=Max('order_number'))['max_num'] or 0
        order_number = max_num + 1

        order = Order.objects.create(
            order_number=order_number,
            date=timezone.now().date(),
            **validated_data,
        )

        order_products = []
        for p in products_data:
            product = products[p['item_id']]
            order_products.append(
                OrderProduct(
                    order=order,
                    price=product.price * p['quantity'],
                    **p,
                )
            )
        OrderProduct.objects.bulk_create(order_products)

        order.total = sum(op.price for op in order_products)
        order.save(update_fields=['total'])

        return order
