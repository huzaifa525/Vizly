from rest_framework import serializers
from .models import Role, UserRole
from django.contrib.auth.models import User


class RoleSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='get_name_display', read_only=True)

    class Meta:
        model = Role
        fields = ['id', 'name', 'display_name', 'description', 'permissions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRoleSerializer(serializers.ModelSerializer):
    role_details = RoleSerializer(source='role', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = UserRole
        fields = [
            'id', 'user', 'role', 'role_details', 'user_email', 'user_name',
            'assigned_at', 'assigned_by', 'assigned_by_name'
        ]
        read_only_fields = ['id', 'assigned_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

    def get_assigned_by_name(self, obj):
        if obj.assigned_by:
            return f"{obj.assigned_by.first_name} {obj.assigned_by.last_name}".strip() or obj.assigned_by.username
        return None


class UserWithRolesSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'roles', 'permissions', 'is_superuser']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_roles(self, obj):
        user_roles = UserRole.objects.filter(user=obj).select_related('role')
        return [
            {
                'id': ur.role.id,
                'name': ur.role.name,
                'display_name': ur.role.get_name_display(),
            }
            for ur in user_roles
        ]

    def get_permissions(self, obj):
        from .permissions import get_user_permissions
        return get_user_permissions(obj)
