from django.contrib import admin
from .models import Company, Branch


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'active', 'created_at')
    search_fields = ('name', 'owner__user', 'owner__name')
    list_filter = ('active',)
    ordering = ('-created_at',)


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'school_id', 'active', 'created_at')
    search_fields = ('name', 'company__name')
    list_filter = ('active', 'company')
    ordering = ('-created_at',)
