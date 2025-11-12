"""
Password encryption utilities for database connections
"""
from cryptography.fernet import Fernet
from django.conf import settings
import base64
import hashlib


def get_encryption_key():
    """
    Get or generate encryption key from Django SECRET_KEY
    """
    # Use Django's SECRET_KEY to derive a Fernet key
    key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return base64.urlsafe_b64encode(key)


def encrypt_password(password: str) -> str:
    """
    Encrypt a password for storage
    """
    if not password:
        return ''

    f = Fernet(get_encryption_key())
    encrypted = f.encrypt(password.encode())
    return encrypted.decode()


def decrypt_password(encrypted_password: str) -> str:
    """
    Decrypt a stored password
    """
    if not encrypted_password:
        return ''

    try:
        f = Fernet(get_encryption_key())
        decrypted = f.decrypt(encrypted_password.encode())
        return decrypted.decode()
    except Exception:
        # If decryption fails, assume it's plain text (for migration)
        return encrypted_password
