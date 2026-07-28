from rest_framework import viewsets, status, permissions
from rest_framework.response import Response

from .models import Company, Branch
from .serializers import BranchSerializer


class IsManagerPermission(permissions.BasePermission):
    """Permiso personalizado: solo usuarios del grupo 'gerente'."""

    def has_permission(self, request, view):
        return request.user.groups.filter(name='gerente').exists()


class BranchViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consultar sucursales de una empresa.
    
    Requiere el query param ?company_id=<id>.
    Solo los gerentes pueden consultar las sucursales de sus propias empresas.
    """
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerPermission]

    def get_queryset(self):
        return Branch.objects.filter(
            company__owner=self.request.user,
            active=True,
        ).select_related('company')

    def list(self, request, *args, **kwargs):
        company_id = request.query_params.get('company_id')

        if not company_id:
            return Response(
                {"error": "El parámetro 'company_id' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not str(company_id).isdigit():
            return Response(
                {"error": "El parámetro 'company_id' debe ser un número entero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            Company.objects.get(id=company_id, owner=request.user)
        except Company.DoesNotExist:
            return Response(
                {"error": "No existe una empresa con ese ID asignada a este gerente."},
                status=status.HTTP_404_NOT_FOUND,
            )

        queryset = self.get_queryset().filter(company_id=company_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
