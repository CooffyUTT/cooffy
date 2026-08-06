from rest_framework import permissions

from apps.schools.models import School


class IsManagerPermission(permissions.BasePermission):
    """Solo usuarios del grupo 'gerente'."""

    message = 'Solo los gerentes pueden realizar esta acción.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.groups.filter(name='gerente').exists()
            )
        )


class IsSchoolAdminPermission(permissions.BasePermission):
    """Solo usuarios del grupo 'admin_escolar'."""

    message = 'Solo los administradores escolares pueden realizar esta acción.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.groups.filter(name='admin_escolar').exists()
            )
        )


def get_admin_school(user):
    """Devuelve la escuela administrada por el usuario o None."""
    if user is None or not getattr(user, 'is_authenticated', False):
        return None
    return School.objects.filter(admin_id=user.id, active=True).first()
