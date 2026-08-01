from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import School
from .serializers import SchoolSerializer


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["full_name", "short_name", "address"]
    ordering_fields = ["created_at", "full_name", "short_name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)

        if self.action == "list":
            qs = qs.filter(active=True)

        # Un Admin Escolar (no staff) solo ve/administra sus propias escuelas
        if user and not getattr(user, "is_staff", False):
            qs = qs.filter(admin_id=getattr(user, "id", None))

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        school = serializer.save()
        return Response(SchoolSerializer(school).data, status=status.HTTP_201_CREATED)