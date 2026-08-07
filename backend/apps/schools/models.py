import re

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

DOMAIN_ADDRESS_REGEX = (
    r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$"
)

domain_address_validator = RegexValidator(
    regex=DOMAIN_ADDRESS_REGEX,
    flags=re.IGNORECASE,
    message=(
        "Ingresa un dominio institucional válido (ej. ut-tijuana.edu.mx). "
        "Sin @, sin espacios y con al menos un punto."
    ),
    code="invalid_domain_address",
)


class SchoolDomainField(models.CharField):
    """CharField que normaliza el dominio (minúsculas y sin espacios) antes de guardar."""

    def pre_save(self, model_instance, add):
        value = getattr(model_instance, self.attname)
        if value:
            value = value.strip().lower()
            setattr(model_instance, self.attname, value)
        return super().pre_save(model_instance, add)


# Create your models here.
class School(models.Model):
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT, # no eliminar usuario si tiene escuelas asociadas
        related_name='admin_schools',
        null=True,
        blank=True,
    )
    full_name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50)
    address = models.TextField(blank=True, null=True)
    domain_address = SchoolDomainField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
        db_index=True,
        validators=[domain_address_validator],
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'schools'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['domain_address'], name='schools_domain_address_idx'),
        ]

    def __str__(self):
        return self.short_name
