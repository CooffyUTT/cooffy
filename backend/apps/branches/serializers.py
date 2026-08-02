from rest_framework import serializers
from .models import Branch, Company


class CompanySerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'owner',
            'owner_name',
            'active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'owner_name', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        owner = obj.owner
        if not owner:
            return None
        return f'{owner.name} {owner.lastname or ""}'.strip()


class CompanyLinkSerializer(serializers.Serializer):
    company = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.filter(active=True),
    )

    def validate_company(self, company):
        school = self.context.get('school')
        if school is None:
            raise serializers.ValidationError(
                'El administrador no tiene una escuela activa asignada.'
            )
        if company.school_links.filter(school=school, active=True).exists():
            raise serializers.ValidationError(
                'La compañía ya está vinculada a esta escuela.'
            )
        return company


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


class BranchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['name', 'company', 'location', 'schedule', 'image']

    def validate_company(self, company):
        if not company.active:
            raise serializers.ValidationError(
                'La compañía seleccionada está inactiva.'
            )

        school = self.context.get('school')
        if school is None or not company.school_links.filter(
            school=school,
            active=True,
        ).exists():
            raise serializers.ValidationError(
                'La compañía no está vinculada a la escuela administrada.'
            )
        return company


class BranchUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['name', 'location', 'schedule', 'image', 'active']
