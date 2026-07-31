from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductMenuListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'image',
            'category',
        ]


class ProductMenuDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

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
        ]
