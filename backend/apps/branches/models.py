from django.db import models

# Create your models here.

class Branch(models.Model):
    name = models.CharField(max_length=150)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    school_id = models.BigIntegerField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'branches'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
