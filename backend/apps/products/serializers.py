from rest_framework import serializers
from .models import Category, Product, ProductStock


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductMenuListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    available_in_branches = serializers.SerializerMethodField()
    branch_id = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'image',
            'category',
            'available_in_branches',
            'branch_id',
        ]

    def get_available_in_branches(self, obj):
        return [
            stock.branch_id
            for stock in obj.branch_stocks.all()
            if stock.stock != ProductStock.StockState.OUT_OF_STOCK
        ]

    def get_branch_id(self, obj):
        return self.context.get('branch_id')


class ProductMenuDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    available_in_branches = serializers.SerializerMethodField()
    branch_id = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'image',
            'description',
            'modifiers',
            'category',
            'available_in_branches',
            'branch_id',
        ]

    def get_available_in_branches(self, obj):
        return [
            stock.branch_id
            for stock in obj.branch_stocks.all()
            if stock.stock != ProductStock.StockState.OUT_OF_STOCK
        ]

    def get_branch_id(self, obj):
        return self.context.get('branch_id')


class ProductManageSerializer(serializers.ModelSerializer):
    """Serializer para el CRUD de productos del panel de Gerente/Supervisor"""

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'category',
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
