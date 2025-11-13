from rest_framework.permissions import BasePermission
from .models import UserRole


class HasPermission(BasePermission):
    """Check if user has specific permission for a resource"""

    def __init__(self, resource, action):
        self.resource = resource
        self.action = action

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers bypass permission checks
        if request.user.is_superuser:
            return True

        # Get user's roles
        user_roles = UserRole.objects.filter(user=request.user).select_related('role')

        # Check if any role grants the required permission
        for user_role in user_roles:
            permissions = user_role.role.permissions or user_role.role.default_permissions
            resource_perms = permissions.get(self.resource, [])

            if self.action in resource_perms:
                return True

        return False


def require_permission(resource, action):
    """Decorator factory for permission checking"""
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            permission = HasPermission(resource, action)
            if not permission.has_permission(request, None):
                from rest_framework.response import Response
                from rest_framework import status
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def get_user_permissions(user):
    """Get all permissions for a user"""
    if user.is_superuser:
        return {
            'connections': ['create', 'read', 'update', 'delete'],
            'queries': ['create', 'read', 'update', 'delete', 'execute'],
            'dashboards': ['create', 'read', 'update', 'delete', 'share'],
            'visualizations': ['create', 'read', 'update', 'delete'],
            'users': ['create', 'read', 'update', 'delete'],
        }

    user_roles = UserRole.objects.filter(user=user).select_related('role')
    merged_permissions = {}

    for user_role in user_roles:
        permissions = user_role.role.permissions or user_role.role.default_permissions
        for resource, actions in permissions.items():
            if resource not in merged_permissions:
                merged_permissions[resource] = set()
            merged_permissions[resource].update(actions)

    # Convert sets back to lists
    return {k: list(v) for k, v in merged_permissions.items()}


def can_user_perform(user, resource, action):
    """Check if user can perform action on resource"""
    if user.is_superuser:
        return True

    permissions = get_user_permissions(user)
    return action in permissions.get(resource, [])
