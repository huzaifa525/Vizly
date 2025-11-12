from django.db import models
from django.conf import settings
import uuid
from .encryption import encrypt_password, decrypt_password


class Connection(models.Model):
    """Database connection configuration"""
    TYPE_CHOICES = [
        ('postgres', 'PostgreSQL'),
        ('mysql', 'MySQL'),
        ('sqlite', 'SQLite'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    host = models.CharField(max_length=255, null=True, blank=True)
    port = models.IntegerField(null=True, blank=True)
    database = models.CharField(max_length=255)
    username = models.CharField(max_length=255, null=True, blank=True)
    _encrypted_password = models.TextField(null=True, blank=True, db_column='password')
    ssl = models.BooleanField(default=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='connections')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connections'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.type})"

    @property
    def password(self):
        """Decrypt password when accessing"""
        if self._encrypted_password:
            return decrypt_password(self._encrypted_password)
        return ''

    @password.setter
    def password(self, value):
        """Encrypt password when setting"""
        if value:
            self._encrypted_password = encrypt_password(value)
        else:
            self._encrypted_password = ''
