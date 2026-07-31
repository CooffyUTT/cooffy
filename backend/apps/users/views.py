from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
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


class UserListView(APIView):
    """
    Endpoint para consultar información de usuarios.
    Permite filtrar por los roles permitidos: 'gerente' y 'cliente'.
    
    Ejemplos:
      GET /api/users/           -> Devuelve usuarios con rol gerente o cliente.
      GET /api/users/?role=gerente -> Devuelve solo usuarios con rol gerente.
      GET /api/users/?role=cliente -> Devuelve solo usuarios con rol cliente.
    """
    # Cambia a IsAuthenticated si requieres que el usuario esté logueado
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        role_param = request.query_params.get('role', None)
        allowed_roles = ['gerente', 'cliente', 'empleado']

        # 1. Base QuerySet: Solo usuarios que pertenezcan a los grupos gerente o cliente
        queryset = User.objects.filter(groups__name__in=allowed_roles).distinct()

        # 2. Si enviaron un rol específico y es uno de los permitidos, filtramos
        if role_param:
            role_param = role_param.lower()
            if role_param in allowed_roles:
                queryset = queryset.filter(groups__name=role_param)
            else:
                return Response(
                    {"error": f"Rol no válido. Los roles permitidos son: {', '.join(allowed_roles)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 3. Serializar y responder
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    """
    Endpoint para consultar, editar o dar de baja a un usuario especifico.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response(
                {"error": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def put(self, request, pk):
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

    def delete(self, request, pk):
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


class CreateClientView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):

        serializer = CreateClientSerializer(
            data=request.data
        )

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
