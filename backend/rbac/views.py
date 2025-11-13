from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Role, UserRole
from .serializers import RoleSerializer, UserRoleSerializer, UserWithRolesSerializer
from .permissions import get_user_permissions, can_user_perform


class RoleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing roles"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only admins can view all roles
        if self.request.user.is_superuser or can_user_perform(self.request.user, 'users', 'read'):
            return Role.objects.all()
        # Others can only see their own roles
        return Role.objects.filter(user_assignments__user=self.request.user)

    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        """Get permissions for a specific role"""
        role = self.get_object()
        permissions = role.permissions or role.default_permissions
        return Response({
            'role': role.name,
            'permissions': permissions
        })


class UserRoleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user role assignments"""
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins see all assignments
        if self.request.user.is_superuser or can_user_perform(self.request.user, 'users', 'read'):
            return UserRole.objects.all().select_related('user', 'role', 'assigned_by')
        # Others see only their own
        return UserRole.objects.filter(user=self.request.user).select_related('role')

    def perform_create(self, serializer):
        # Check if user has permission to assign roles
        if not (self.request.user.is_superuser or can_user_perform(self.request.user, 'users', 'update')):
            raise PermissionError('You do not have permission to assign roles')
        serializer.save(assigned_by=self.request.user)

    def perform_destroy(self, instance):
        # Check if user has permission to remove roles
        if not (self.request.user.is_superuser or can_user_perform(self.request.user, 'users', 'update')):
            raise PermissionError('You do not have permission to remove roles')
        instance.delete()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_permissions(request):
    """Get current user's permissions"""
    permissions = get_user_permissions(request.user)
    user_roles = UserRole.objects.filter(user=request.user).select_related('role')

    return Response({
        'user': request.user.username,
        'roles': [
            {
                'id': ur.role.id,
                'name': ur.role.name,
                'display_name': ur.role.get_name_display(),
            }
            for ur in user_roles
        ],
        'permissions': permissions,
        'is_superuser': request.user.is_superuser
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users_with_roles(request):
    """Get all users with their roles (admin only)"""
    if not (request.user.is_superuser or can_user_perform(request.user, 'users', 'read')):
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    users = User.objects.all().prefetch_related('user_roles__role')
    serializer = UserWithRolesSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_role_to_user(request):
    """Assign a role to a user"""
    if not (request.user.is_superuser or can_user_perform(request.user, 'users', 'update')):
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    user_id = request.data.get('user_id')
    role_id = request.data.get('role_id')

    if not user_id or not role_id:
        return Response(
            {'error': 'user_id and role_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(pk=user_id)
        role = Role.objects.get(pk=role_id)

        user_role, created = UserRole.objects.get_or_create(
            user=user,
            role=role,
            defaults={'assigned_by': request.user}
        )

        if created:
            return Response(
                UserRoleSerializer(user_role).data,
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {'message': 'User already has this role'},
                status=status.HTTP_200_OK
            )
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Role.DoesNotExist:
        return Response(
            {'error': 'Role not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initialize_default_roles(request):
    """Initialize default roles (admin only)"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'Only superusers can initialize roles'},
            status=status.HTTP_403_FORBIDDEN
        )

    roles_created = []
    for role_name, display_name in Role.ROLE_CHOICES:
        role, created = Role.objects.get_or_create(
            name=role_name,
            defaults={
                'description': f'{display_name} role with predefined permissions'
            }
        )
        if created:
            # Set default permissions
            role.permissions = role.default_permissions
            role.save()
            roles_created.append(role_name)

    if roles_created:
        return Response({
            'message': f'Created roles: {", ".join(roles_created)}',
            'roles': RoleSerializer(Role.objects.all(), many=True).data
        })
    else:
        return Response({
            'message': 'All roles already exist',
            'roles': RoleSerializer(Role.objects.all(), many=True).data
        })
