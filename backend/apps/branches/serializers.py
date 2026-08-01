from rest_framework import serializers
from .models import Branch


class BranchSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    school_name = serializers.SerializerMethodField()
    school_id = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = [
            'id',
            'name',
            'company',
            'company_name',
            'school_id',
            'school_name',
            'location',
            'schedule',
            'image',
            'active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_school_name(self, obj):
        return obj.school.short_name if obj.school_id else None

    def get_school_id(self, obj):
        return obj.school_id


class BranchUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['name', 'location', 'schedule', 'image', 'active']
