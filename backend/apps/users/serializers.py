from rest_framework import serializers
from .models import User


class LoginSerializer(serializers.Serializer):
    user = serializers.CharField(max_length=254)
    password = serializers.CharField(max_length=255, write_only=True)

    def validate(self, data):
        """Valida las credenciales contra la BD"""
        user_input = data.get('user')
        password_input = data.get('password')

        try:
            user = User.objects.get(user=user_input)
        except User.DoesNotExist:
            raise serializers.ValidationError("Credenciales inválidas")

        # Validar contraseña usando Django auth
        if not user.check_password(password_input):
            raise serializers.ValidationError("Credenciales inválidas")

        data['user_obj'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'user',
            'name',
            'lastname',
            'school_id',
            'active',
            'groups',
        ]

    def get_groups(self, obj):
        return list(obj.groups.values_list('name', flat=True))