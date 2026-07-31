from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'active', 'created_at')
    list_filter = ('active',)
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'active', 'created_at', 'updated_at')
    list_filter = ('active', 'category')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')