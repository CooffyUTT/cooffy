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
            'domain_address',
            'active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        # Normaliza antes de las validaciones (incluida la de unicidad),
        # para que "UTT.EDU.MX" y "utt.edu.mx" se traten como el mismo dominio.
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if data.get('domain_address'):
            data['domain_address'] = data['domain_address'].strip().lower()
        return super().to_internal_value(data)