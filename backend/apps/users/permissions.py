from django.db import models
from rest_framework import permissions

from apps.branches.models import Branch, Company
from apps.schools.models import School
from apps.users.models import User


class IsUserManagerPermission(permissions.BasePermission):
    """Solo gerente, admin_escolar y superuser pueden administrar usuarios."""

    message = 'Solo gerentes, administradores escolares y superusuarios pueden realizar esta acción.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name__in=['gerente', 'admin_escolar']).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return _user_belongs_to_scope(request.user, obj)


def get_users_in_scope(user):
    """Devuelve un queryset de usuarios visibles para el usuario dado."""
    if user.is_superuser:
        return User.objects.all()

    if user.groups.filter(name='gerente').exists():
        company_ids = Company.objects.filter(owner=user, active=True).values_list('id', flat=True)
        branch_ids = Branch.objects.filter(company_id__in=company_ids).values_list('id', flat=True)
        return User.objects.filter(
            models.Q(branch_id__in=branch_ids) | models.Q(branch_id__isnull=True)
        )

    if user.groups.filter(name='admin_escolar').exists():
        school = School.objects.filter(admin_id=user.id, active=True).first()
        if school:
            return User.objects.filter(school_id=school.id)
        return User.objects.none()

    return User.objects.none()


def _user_belongs_to_scope(actor, target_user):
    """Retorna True si target_user está dentro del ámbito de actor."""
    if actor.is_superuser:
        return True

    if actor.groups.filter(name='gerente').exists():
        if target_user.branch_id is None:
            return True
        company_ids = Company.objects.filter(owner=actor, active=True).values_list('id', flat=True)
        branch_ids = set(Branch.objects.filter(company_id__in=company_ids).values_list('id', flat=True))
        return target_user.branch_id in branch_ids

    if actor.groups.filter(name='admin_escolar').exists():
        school = School.objects.filter(admin_id=actor.id, active=True).first()
        if school and target_user.school_id == school.id:
            return True
        return False

    return False
