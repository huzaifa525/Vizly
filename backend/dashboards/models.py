from django.db import models
from django.conf import settings
from visualizations.models import Visualization
import uuid


class Dashboard(models.Model):
    """Dashboard container"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    layout = models.JSONField(default=dict, null=True, blank=True)  # Grid layout config
    filters = models.JSONField(default=list, null=True, blank=True)  # Dashboard-level filters
    is_public = models.BooleanField(default=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dashboards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dashboards'
        ordering = ['-updated_at']

    def __str__(self):
        return self.name


class DashboardItem(models.Model):
    """Item on a dashboard"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE, related_name='items')
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE, related_name='dashboard_items')
    position = models.JSONField(default=dict)  # {x, y, w, h}
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'dashboard_items'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.dashboard.name} - {self.visualization.name}"
