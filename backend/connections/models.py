from django.db import models
from django.conf import settings
import uuid
from .encryption import encrypt_credential, decrypt_credential


class Connection(models.Model):
    """Database connection configuration with encrypted credentials"""
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
    # Store encrypted password - max length increased to accommodate encrypted data
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
        """Decrypt and return the password"""
        if self._encrypted_password:
            try:
                return decrypt_credential(self._encrypted_password)
            except ValueError:
                # If decryption fails, might be legacy plaintext password
                # Return as-is and it will be re-encrypted on next save
                return self._encrypted_password
        return None

    @password.setter
    def password(self, value):
        """Encrypt and store the password"""
        if value:
            # Check if already encrypted (starts with gAAAAA which is Fernet token prefix)
            if value and not value.startswith('gAAAAA'):
                self._encrypted_password = encrypt_credential(value)
            else:
                # Already encrypted, store as-is
                self._encrypted_password = value
        else:
            self._encrypted_password = None

    def get_decrypted_password(self):
        """Explicitly get the decrypted password for database connections"""
        return self.password
