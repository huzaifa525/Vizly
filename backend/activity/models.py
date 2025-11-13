from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid


class ActivityLog(models.Model):
    """Track user actions across the platform"""

    ACTION_CHOICES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('execute', 'Executed'),
        ('view', 'Viewed'),
        ('export', 'Exported'),
        ('share', 'Shared'),
        ('login', 'Logged In'),
        ('logout', 'Logged Out'),
    ]

    RESOURCE_CHOICES = [
        ('connection', 'Connection'),
        ('query', 'Query'),
        ('dashboard', 'Dashboard'),
        ('visualization', 'Visualization'),
        ('user', 'User'),
        ('role', 'Role'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activities'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50, choices=RESOURCE_CHOICES)
    resource_id = models.CharField(max_length=255, null=True, blank=True)
    resource_name = models.CharField(max_length=255, null=True, blank=True)

    # Additional metadata
    details = models.JSONField(default=dict, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['resource_type', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} {self.get_action_display()} {self.resource_type}"

    @property
    def user_name(self):
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        return "System"

    @property
    def description(self):
        """Generate human-readable description"""
        action_text = self.get_action_display().lower()
        resource_name = self.resource_name or f"{self.resource_type} #{self.resource_id}"
        return f"{action_text} {resource_name}"
