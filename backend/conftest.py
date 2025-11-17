"""
Pytest configuration and shared fixtures for the backend tests.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    """Return an unauthenticated API client"""
    return APIClient()


@pytest.fixture
def user(db):
    """Create and return a test user"""
    return User.objects.create_user(
        email='test@example.com',
        username='testuser',
        password='testpass123',
        name='Test User'
    )


@pytest.fixture
def admin_user(db):
    """Create and return an admin user"""
    return User.objects.create_user(
        email='admin@example.com',
        username='adminuser',
        password='adminpass123',
        name='Admin User',
        role='admin'
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Return an API client authenticated with a regular user"""
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    api_client.user = user
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """Return an API client authenticated with an admin user"""
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    api_client.user = admin_user
    return api_client
