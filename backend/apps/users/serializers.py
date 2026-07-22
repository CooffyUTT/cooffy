from rest_framework import serializers
from .models import User
import re

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

class CreateClientSerializer(serializers.Serializer):
    user = serializers.EmailField(max_length=254)
    name = serializers.CharField(max_length=100)
    password = serializers.CharField(
        max_length=255,
        min_length=8,
        write_only=True
    )
    school_id = serializers.IntegerField()

    def validate(self, data):
        user = data.get('user')

        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.mx$" ## para validar que sea un correo institucional válido
        if not re.match(pattern, user):
            raise serializers.ValidationError("Debe utilizar un correo institucional.")

        if User.objects.filter(user=user).exists():
            raise serializers.ValidationError("El correo ya se encuentra registrado.")

        return data
    
    def create(self, validated_data):
        """Crear el usuario a partir del UserManager"""

        return User.objects.create_user(
            user=validated_data["user"],
            password=validated_data["password"],
            name=validated_data["name"],
            school_id=validated_data["school_id"],
        )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user', 'name', 'lastname', 'school_id', 'active']