from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User
from .serializers import (
    LoginSerializer,
    UserSerializer,
    CreateClientSerializer,
    UpdateUserSerializer,
) # serializadores del CRUD de usuarios


# Create your views here.
class LoginView(APIView):
    """Endpoint para autenticar usuarios"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user_obj']

            # Generar JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Login exitoso',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class UserViewSet(viewsets.ViewSet):
    """
    Endpoint para consultar, editar, dar de baja o registrar usuarios.
    Permite filtrar por los roles permitidos: 'gerente', 'cliente' y 'empleado'.

    Ejemplos:
      GET /api/auth/                -> Devuelve usuarios con rol gerente, cliente o empleado.
      GET /api/auth/?role=gerente   -> Devuelve solo usuarios con rol gerente.
      GET /api/auth/?role=cliente   -> Devuelve solo usuarios con rol cliente.
      POST /api/auth/register/      -> Registra un nuevo cliente.
      GET /api/auth/<pk>/           -> Detalle de un usuario.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk=None):
        try:
            return User.objects.get(pk=pk)
        except (User.DoesNotExist, ValueError):
            return None

    def list(self, request):
        role_param = request.query_params.get('role', None)
        allowed_roles = ['gerente', 'cliente', 'empleado']

        # Base QuerySet: Solo usuarios que pertenezcan a los grupos permitidos
        queryset = User.objects.filter(groups__name__in=allowed_roles).distinct()

        if role_param:
            role_param = role_param.lower()
            if role_param in allowed_roles:
                queryset = queryset.filter(groups__name=role_param)
            else:
                return Response(
                    {"error": f"Rol no válido. Los roles permitidos son: {', '.join(allowed_roles)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        user = self.get_object(pk)
        if user is None:
            return Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        return self._update(request, pk, partial=True)

    def update(self, request, pk=None):
        return self._update(request, pk, partial=False)

    def _update(self, request, pk, partial):
        user = self.get_object(pk)
        if user is None:
            return Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UpdateUserSerializer(user, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        """desactiva al usuario"""
        user = self.get_object(pk)
        if user is None:
            return Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.active = False
        user.save(update_fields=["active", "updated_at"])
        return Response(
            {"message": "Usuario dado de baja correctamente."},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=['post'],
        url_path='register',
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def register(self, request):
        serializer = CreateClientSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Usuario registrado correctamente.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )
