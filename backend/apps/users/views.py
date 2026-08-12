from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from apps.users.models import User
from .permissions import IsUserManagerPermission, _user_belongs_to_scope, get_users_in_scope
from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    UserSerializer,
    CreateClientSerializer,
    UpdateUserSerializer,
)


class LoginView(APIView):
    """Endpoint para autenticar usuarios"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user_obj']

            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Login exitoso',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """Endpoint para cerrar sesión y blacklist-ear el refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            RefreshToken(serializer.validated_data['refresh']).blacklist()
        except TokenError:
            return Response(
                {"error": "Token inválido o expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "Sesión cerrada correctamente."},
            status=status.HTTP_200_OK,
        )


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
    permission_classes = [IsAuthenticated, IsUserManagerPermission]

    def get_object(self, pk=None):
        try:
            return User.objects.get(pk=pk)
        except (User.DoesNotExist, ValueError):
            return None

    def _get_object_in_scope(self, pk):
        user = self.get_object(pk)
        if user is None:
            return None, Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if self.request.user.is_superuser:
            return user, None
        if not _user_belongs_to_scope(self.request.user, user):
            return None, Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return user, None

    def list(self, request):
        role_param = request.query_params.get('role', None)
        allowed_roles = ['gerente', 'cliente', 'empleado']

        queryset = get_users_in_scope(request.user)
        queryset = queryset.filter(groups__name__in=allowed_roles).distinct()

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
        user, error = self._get_object_in_scope(pk)
        if error:
            return error
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        return self._update(request, pk, partial=True)

    def update(self, request, pk=None):
        return self._update(request, pk, partial=False)

    def _update(self, request, pk, partial):
        user, error = self._get_object_in_scope(pk)
        if error:
            return error

        serializer = UpdateUserSerializer(user, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        user, error = self._get_object_in_scope(pk)
        if error:
            return error

        if request.user.is_superuser:
            pass
        elif request.user.groups.filter(name='gerente').exists():
            pass
        else:
            return Response(
                {"error": "Solo los gerentes pueden dar de baja usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not request.user.is_superuser:
            if user.id == request.user.id:
                return Response(
                    {"error": "No puedes darte de baja a ti mismo."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if user.is_superuser or user.groups.filter(name__in=['gerente', 'admin_escolar']).exists():
                return Response(
                    {"error": "No puedes dar de baja a este usuario."},
                    status=status.HTTP_403_FORBIDDEN,
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
