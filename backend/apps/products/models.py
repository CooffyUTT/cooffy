from io import BytesIO
import uuid

from django.contrib.postgres.fields import ArrayField
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import models
from django.db.models import Q, CheckConstraint
from PIL import Image


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

    """ Convert image to webp, resize and change name on save """
    def save(self, *args, **kwargs):
        if self.image and self.image.name:
            img = Image.open(self.image)

            img.thumbnail((800, 800), Image.Resampling.LANCZOS)

            output = BytesIO()
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            img.save(output, format='WEBP', quality=85)
            output.seek(0)

            new_filename = f"{uuid.uuid4()}.webp"

            self.image = InMemoryUploadedFile(
                output,
                'ImageField',
                new_filename,
                'image/webp',
                output.getbuffer().nbytes,
                None
            )

        super().save(*args, **kwargs)


    def __str__(self):
        return self.name