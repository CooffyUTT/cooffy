from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.contrib.auth.hashers import make_password


class UserManager(BaseUserManager):
    """Manager personalizado para User que usa 'user' como identificador único."""

    def _create_user(self, user, password, **extra_fields):
        if not user:
            raise ValueError("El campo 'user' es obligatorio")
        user_obj = self.model(user=user, **extra_fields)
        user_obj.password = make_password(password)
        user_obj.save(using=self._db)
        return user_obj

    def create_user(self, user, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(user, password, **extra_fields)

    def create_superuser(self, user, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser debe tener is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser debe tener is_superuser=True.")

        return self._create_user(user, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    user = models.CharField(max_length=254, unique=True)  # email o username
    name = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100, blank=True, null=True)
    school_id = models.BigIntegerField(blank=True, null=True)
    branch_id = models.BigIntegerField(blank=True, null=True)
    active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    # is_superuser, groups, user_permissions los aporta PermissionsMixin
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'user'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.user

    @property
    def is_active(self):
        return self.active