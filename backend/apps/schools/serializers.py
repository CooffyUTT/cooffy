from rest_framework import serializers
from .models import School


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = [
            'id',
            'admin',
            'full_name',
            'short_name',
            'address',
            'active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']