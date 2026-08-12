from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('user', 'name', 'lastname', 'active', 'is_staff', 'is_superuser', 'created_at')
    search_fields = ('user', 'name', 'lastname')
    ordering = ('-created_at',)
    list_filter = ('active', 'is_staff', 'is_superuser', 'groups')

    fieldsets = (
        (None, {'fields': ('user', 'password')}),
        ('Personal info', {'fields': ('name', 'lastname', 'school', 'branch')}),
        ('Permissions', {'fields': ('active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('user', 'name', 'lastname', 'password1', 'password2'),
        }),
    )
