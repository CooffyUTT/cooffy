from rest_framework import serializers
from .models import Branch


class BranchSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Branch
        fields = [
            'id',
            'name',
            'company',
            'company_name',
            'school_id',
            'location',
            'active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
