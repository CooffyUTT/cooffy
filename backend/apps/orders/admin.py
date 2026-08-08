from django.contrib import admin
from .models import Order, OrderProduct, PaymentMethod

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_digital', 'active')
    list_filter = ('is_digital', 'active')
    search_fields = ('name',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'client_id', 'branch_id', 'date', 'total', 'state', 'payment_status', 'created_at', 'updated_at',)
    list_filter = ('state', 'payment_status', 'branch_id', 'payment_method')
    search_fields = ('order_number', 'client_id')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(OrderProduct)
class OrderProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'item_id', 'quantity', 'price')
    list_filter = ('item_id',)
    search_fields = ('order__order_number', 'item_id')