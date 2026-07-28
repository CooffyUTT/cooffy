from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import School
from .serializers import SchoolSerializer
from django.shortcuts import get_object_or_404

# Create your views here.
class SchoolListView(APIView):
    """
    Endpoint para listar todas las escuelas activas.
    """
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        queryset = School.objects.filter(active=True)
        serializer = SchoolSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

class CreateSchoolView(APIView):
    """
    Endpoint para crear una nueva escuela.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SchoolSerializer(data=request.data)
 
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
        school = serializer.save()
 
        return Response(
            SchoolSerializer(school).data,
            status=status.HTTP_201_CREATED
        )

 