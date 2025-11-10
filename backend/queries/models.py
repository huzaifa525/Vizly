from django.db import models
from django.conf import settings
from connections.models import Connection
import uuid


class Query(models.Model):
    """Saved SQL query"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    sql = models.TextField()
    connection = models.ForeignKey(Connection, on_delete=models.CASCADE, related_name='queries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='queries')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'queries'
        ordering = ['-updated_at']
        verbose_name_plural = 'Queries'

    def __str__(self):
        return self.name
