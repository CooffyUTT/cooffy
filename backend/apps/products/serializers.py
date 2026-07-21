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
            'description', 
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