from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Company, Branch
from .serializers import BranchSerializer


class BranchByCompanyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company_id = request.query_params.get('company_id')

        if not company_id:
            return Response(
                {"error": "El parámetro 'company_id' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not str(company_id).isdigit():
            return Response(
                {"error": "El parámetro 'company_id' debe ser un número entero."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.groups.filter(name='gerente').exists():
            return Response(
                {"error": "Solo un gerente puede consultar sucursales."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            company = Company.objects.get(id=company_id, owner=request.user)
        except Company.DoesNotExist:
            return Response(
                {"error": "No existe una empresa con ese ID asignada a este gerente."},
                status=status.HTTP_404_NOT_FOUND
            )

        branches = Branch.objects.filter(company=company, active=True)
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
