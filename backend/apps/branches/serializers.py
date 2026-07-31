from rest_framework import serializers
from .models import Branch
from apps.schools.models import School


class BranchSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    school_name = serializers.SerializerMethodField()

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
        school = School.objects.filter(pk=obj.school_id).first()
        return school.short_name if school else None
