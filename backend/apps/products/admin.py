from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'image', 'active', 'created_at', 'updated_at')
    list_filter = ('active',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')