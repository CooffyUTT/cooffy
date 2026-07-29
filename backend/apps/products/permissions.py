from rest_framework import permissions


class IsManagerOrSupervisor(permissions.BasePermission):

    allowed_groups = ('gerente', 'supervisor')

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name__in=self.allowed_groups).exists()
        )
