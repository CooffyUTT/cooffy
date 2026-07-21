from django.db import models

#Models

class User(models.Model):
    user = models.CharField(max_length=254, unique=True)  # email o username
    password_hash = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100, blank=True, null=True)
    school_id = models.BigIntegerField(blank=True, null=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.user