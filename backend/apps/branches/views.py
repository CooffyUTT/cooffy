from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Branch
from .serializers import BranchSerializer

# Create your views here.
class BranchListView(APIView):
    """Endpoint para listar las sucursales de una empresa"""

    def get(self, request, school_id):
        branches = Branch.objects.filter(school_id=school_id, active=True)

        if not branches.exists():
            return Response({'message': 'No se encontraron sucursales'}, status=status.HTTP_404_NOT_FOUND)

        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
