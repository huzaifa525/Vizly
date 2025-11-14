"""
Database credential encryption utilities.

This module provides secure encryption and decryption for database
credentials using Fernet (symmetric encryption) from the cryptography library.
"""
import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings


def get_encryption_key():
    """
    Generate or retrieve the encryption key from Django settings.

    The key is derived from SECRET_KEY using PBKDF2 for added security.
    Returns a Fernet-compatible key.
    """
    secret_key = settings.SECRET_KEY.encode()

    # Get unique salt from environment or generate one
    # SECURITY: Each installation should have a unique salt
    from decouple import config

    salt_str = config('ENCRYPTION_SALT', default=None)

    if salt_str is None:
        # Generate a unique salt for this installation
        # This should be saved to .env file after generation
        salt = os.urandom(32)
        salt_b64 = base64.b64encode(salt).decode()

        # Log warning to remind admin to save the salt
        import logging
        logger = logging.getLogger('connections')
        logger.warning(
            f"ENCRYPTION_SALT not found in environment. Generated new salt. "
            f"Add this to your .env file to persist it: ENCRYPTION_SALT={salt_b64}"
        )
    else:
        # Use the salt from environment
        salt = base64.b64decode(salt_str.encode())

    # Derive a key using PBKDF2
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(secret_key))
    return key


def encrypt_credential(plaintext: str) -> str:
    """
    Encrypt a credential string.

    Args:
        plaintext: The credential to encrypt (e.g., database password)

    Returns:
        The encrypted credential as a base64-encoded string
    """
    if not plaintext:
        return ''

    key = get_encryption_key()
    f = Fernet(key)
    encrypted = f.encrypt(plaintext.encode())
    return encrypted.decode()


def decrypt_credential(encrypted: str) -> str:
    """
    Decrypt an encrypted credential string.

    Args:
        encrypted: The encrypted credential (base64-encoded string)

    Returns:
        The decrypted credential as plaintext
    """
    if not encrypted:
        return ''

    key = get_encryption_key()
    f = Fernet(key)

    try:
        decrypted = f.decrypt(encrypted.encode())
        return decrypted.decode()
    except Exception as e:
        # Log the error in production
        raise ValueError(f"Failed to decrypt credential: {str(e)}")
