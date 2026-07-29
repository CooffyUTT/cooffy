from django.db import models
from django.conf import settings

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
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'schools'
        ordering = ['-created_at']
 
    def __str__(self):
        return self.short_name