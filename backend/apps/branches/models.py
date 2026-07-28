from django.conf import settings
from django.db import models


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

    def __str__(self):
        return self.name
