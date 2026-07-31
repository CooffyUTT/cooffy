from io import BytesIO
import uuid

from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import models
from PIL import Image


class Company(models.Model):
    """Empresa propietaria de una o más sucursales"""

    name = models.CharField(max_length=150)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='companies',
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
        ordering = ['-created_at']
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name


class Branch(models.Model):
    """Sucursal operada por una empresa dentro de una escuela."""

    name = models.CharField(max_length=100)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='branches',
    )
    school_id = models.BigIntegerField()
    location = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='branches/', max_length=2048, null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'branches'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company']),
            models.Index(fields=['school_id', 'active']),
        ]
        verbose_name_plural = 'Branches'

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
