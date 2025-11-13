from django.db import models
from django.conf import settings
import uuid


class Role(models.Model):
    """User roles with permissions"""
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('analyst', 'Data Analyst'),
        ('viewer', 'Viewer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=dict)  # Flexible permission structure
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'roles'
        ordering = ['name']

    def __str__(self):
        return self.get_name_display()

    @property
    def default_permissions(self):
        """Default permissions for each role"""
        defaults = {
            'admin': {
                'connections': ['create', 'read', 'update', 'delete'],
                'queries': ['create', 'read', 'update', 'delete', 'execute'],
                'dashboards': ['create', 'read', 'update', 'delete', 'share'],
                'visualizations': ['create', 'read', 'update', 'delete'],
                'users': ['create', 'read', 'update', 'delete'],
            },
            'analyst': {
                'connections': ['read'],
                'queries': ['create', 'read', 'update', 'execute'],
                'dashboards': ['create', 'read', 'update'],
                'visualizations': ['create', 'read', 'update'],
                'users': ['read'],
            },
            'viewer': {
                'connections': ['read'],
                'queries': ['read', 'execute'],
                'dashboards': ['read'],
                'visualizations': ['read'],
                'users': ['read'],
            },
        }
        return defaults.get(self.name, {})


class UserRole(models.Model):
    """Many-to-many relationship between users and roles"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='role_assignments_made'
    )

    class Meta:
        db_table = 'user_roles'
        unique_together = ['user', 'role']
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"
