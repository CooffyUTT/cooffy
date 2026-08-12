from django.db import models


class PaymentMethod(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_digital = models.BooleanField()
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "payment_methods"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Order(models.Model):
    class State(models.TextChoices):
        PENDING = "pending", "En espera"
        PREPARING = "preparing", "En preparación"
        READY = "ready", "Listo para entregar"
        PICKED_UP = "picked_up", "Entregado"
        REJECTED = "rejected", "Rechazado"
        CANCELLED = "cancelled", "Cancelado"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PAID = "paid", "Pagado"

    order_number = models.BigIntegerField()
    date = models.DateField()
    branch_id = models.BigIntegerField(default=1)
    client_id = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    prepared_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    scheduled_pickup_at = models.DateTimeField(null=True, blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    state = models.CharField(
        max_length=20, choices=State.choices, default=State.PENDING
    )
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    comment = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["order_number", "date", "branch_id"],
                name="unique_order_number_per_branch_date",
            )
        ]

    def __str__(self):
        return f"Order {self.order_number}"


class OrderProduct(models.Model):
    order = models.ForeignKey(Order, related_name="order_products", on_delete=models.CASCADE)
    item_id = models.BigIntegerField()
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    excluded_modifiers = models.JSONField(default=list, blank=True, null=True)

    class Meta:
        db_table = "order_products"
        ordering = ["id"]

    def __str__(self):
        return f"OrderProduct {self.id}"