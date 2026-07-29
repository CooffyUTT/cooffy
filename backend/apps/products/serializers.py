from rest_framework import serializers
from .models import Product

class ProductMenuListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 
            'name', 
            'price',
            'image',
        ]

class ProductMenuDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'image',
            'description',
            'modifiers'
        ]


class ProductManageSerializer(serializers.ModelSerializer):
    """Serializer para el CRUD de productos del panel de Gerente/Supervisor"""

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'active',
            'max_per_order',
            'image',
            'description',
            'modifiers',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre del producto es obligatorio.")
        return value.strip()

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0.")
        return value

    def validate_max_per_order(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("El límite por pedido debe ser mayor a 0.")
        return value
