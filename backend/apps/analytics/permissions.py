from rest_framework import permissions


MANAGER_OR_SUPERVISOR_GROUPS = {'gerente', 'supervisor'}


class IsManagerOrSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Contrato RF-04-01: el superuser accede a todas las métricas.
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(
            name__in=MANAGER_OR_SUPERVISOR_GROUPS
        ).exists()
