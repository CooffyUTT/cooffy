from django.db import models


class Order(models.Model):
    order_number = models.BigIntegerField()
    date = models.DateField()
    branch_id = models.BigIntegerField(default=1)
    client_id = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    prepared_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    scheduled_pickup_at = models.DateTimeField(null=True, blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    state = models.CharField(max_length=20, default="pending")
    payment_method = models.IntegerField()
    payment_status = models.CharField(max_length=20, default="pending")
    comment = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order {self.order_number}"


class OrderProduct(models.Model):
    order = models.ForeignKey(Order, related_name="order_products", on_delete=models.CASCADE)
    item_id = models.BigIntegerField()
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    excluded_modifiers = models.JSONField(default=list, blank=True, null=True)

    class Meta:
        db_table = "order_products"
        ordering = ["id"]

    def __str__(self):
        return f"OrderProduct {self.id}"