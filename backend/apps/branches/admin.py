from django.contrib import admin
from .models import Company, Branch
from apps.products.models import ProductStock


class BranchProductStockInline(admin.TabularInline):
    model = ProductStock
    extra = 0
    can_delete = False
    readonly_fields = ('product', 'stock', 'updated_at')

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'active', 'created_at')
    search_fields = ('name', 'owner__user', 'owner__name')
    list_filter = ('active',)
    ordering = ('-created_at',)


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'school', 'active', 'created_at')
    search_fields = ('name', 'company__name')
    list_filter = ('active', 'company')
    ordering = ('-created_at',)
    inlines = [BranchProductStockInline]
