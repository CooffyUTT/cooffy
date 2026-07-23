from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import Q, CheckConstraint


class Product(models.Model):
    name = models.CharField(max_length=120)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    active = models.BooleanField(default=True)
    max_per_order = models.IntegerField(null=True, blank=True)
    image = models.ImageField(upload_to='products/', max_length=2048, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    modifiers = ArrayField(models.CharField(max_length=50), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        constraints = [
            CheckConstraint(condition=Q(price__gt=0), name='price_gt_0'),
            CheckConstraint(
                condition=Q(max_per_order__gt=0) | Q(max_per_order__isnull=True),
                name='max_per_order_gt_0_or_null',
            ),
        ]

    def __str__(self):
        return self.name