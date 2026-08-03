from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Company, CompanySchool, Branch
from .permissions import (
    IsManagerPermission,
    IsSchoolAdminPermission,
    get_admin_school,
)
from .serializers import (
    BranchSerializer,
    BranchCreateSerializer,
    BranchUpdateSerializer,
    CompanyLinkSerializer,
    CompanySerializer,
)


class BranchViewSet(viewsets.ModelViewSet):
    """Consulta de sucursales para gerentes y administradores escolares.

    Query params opcionales:
      ?company_id=<id>  – filtra sucursales de una empresa específica.
      Sin company_id    – devuelve las sucursales del actor autenticado.

    - Gerente: solo sucursales activas de sus propias empresas.
    - Admin escolar: sucursales de su escuela (activas e inactivas).
    """
    serializer_class = BranchSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsManagerPermission | IsSchoolAdminPermission,
    ]

    def get_school(self):
        school = getattr(self, '_school', None)
        if school is None:
            self._school = get_admin_school(self.request.user)
        return self._school

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(name='admin_escolar').exists():
            school = self.get_school()
            queryset = Branch.objects.select_related('company', 'school')
            if school is not None:
                queryset = queryset.filter(school=school)
            else:
                queryset = queryset.none()
            return queryset

        return Branch.objects.filter(
            company__owner=user,
            active=True,
        ).select_related('company', 'school')

    def list(self, request, *args, **kwargs):
        company_id = request.query_params.get('company_id')
        if company_id is None:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if not str(company_id).isdigit():
            return Response(
                {"error": "El parámetro 'company_id' debe ser un número entero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_school_admin = request.user.groups.filter(name='admin_escolar').exists()
        company = Company.objects.filter(id=company_id).first()
        if company is None:
            return Response(
                {"error": "No existe una empresa con ese ID."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if is_school_admin:
            school = self.get_school()
            if school is None or not company.schools.filter(id=school.id).exists():
                return Response(
                    {"error": "No existe una empresa vinculada a tu escuela con ese ID."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            queryset = self.get_queryset().filter(company_id=company_id)
        else:
            if company.owner_id != request.user.id:
                return Response(
                    {"error": "No existe una empresa con ese ID asignada a este gerente."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            queryset = self.get_queryset().filter(company_id=company_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        if not request.user.groups.filter(name='admin_escolar').exists():
            return Response(
                {'detail': 'Solo los administradores escolares pueden crear sucursales.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        school = self.get_school()
        serializer = BranchCreateSerializer(
            data=request.data,
            context={'request': request, 'school': school},
        )
        serializer.is_valid(raise_exception=True)
        branch = serializer.save(school=school)
        return Response(
            BranchSerializer(branch, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        branch = self.get_object()
        serializer = BranchUpdateSerializer(
            branch,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            BranchSerializer(branch, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        branch = self.get_object()
        if not branch.active:
            return Response(
                {'detail': 'La sucursal ya está dada de baja.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        branch.active = False
        branch.save(update_fields=['active', 'updated_at'])
        return Response(
            BranchSerializer(branch, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['delete'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        return self.destroy(request, pk=pk)

    @action(detail=True, methods=["put"], url_path="update")
    def update_branch(self, request, pk=None):
        """Actualiza solo los campos name, location, schedule, image y active."""
        branch = self.get_object()
        serializer = BranchUpdateSerializer(
            branch,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            BranchSerializer(branch, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )


class BranchPublicViewSet(viewsets.ReadOnlyModelViewSet):
    """Sucursales activas para clientes autenticados."""

    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Branch.objects.filter(active=True).select_related("company", "school")


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    """Compañías vinculadas a la escuela del administrador escolar."""

    serializer_class = CompanySerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsSchoolAdminPermission,
    ]

    def get_queryset(self):
        school = get_admin_school(self.request.user)
        if school is None:
            return Company.objects.none()
        queryset = Company.objects.filter(active=True).select_related('owner')
        if self.action == 'available':
            return queryset.exclude(
                Q(school_links__school=school, school_links__active=True),
            ).distinct()
        return queryset.filter(
            school_links__school=school,
            school_links__active=True,
        ).distinct()

    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='link')
    def link(self, request):
        school = get_admin_school(request.user)
        serializer = CompanyLinkSerializer(
            data=request.data,
            context={'request': request, 'school': school},
        )
        serializer.is_valid(raise_exception=True)
        company = serializer.validated_data['company']

        with transaction.atomic():
            _, created = CompanySchool.objects.update_or_create(
                company=company,
                school=school,
                defaults={'active': True},
            )

        return Response(
            CompanySerializer(company, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
