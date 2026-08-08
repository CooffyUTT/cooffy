from rest_framework import permissions


class IsKitchenStaffPermission(permissions.BasePermission):
    """Permiso personalizado: solo usuarios de los grupos 'empleado' o 'gerente'."""

    def has_permission(self, request, view):
        return request.user.groups.filter(name__in=['empleado', 'gerente']).exists()
