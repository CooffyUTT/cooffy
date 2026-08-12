from django.contrib import admin
from .models import School

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('id', 'short_name', 'full_name', 'domain_address', 'admin', 'active', 'created_at', 'updated_at')
    list_filter = ('active',)
    search_fields = ('short_name', 'full_name', 'address', 'domain_address', 'admin__username', 'admin__email')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('admin',)