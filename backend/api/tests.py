"""
Tests for the API app (User authentication and management)
"""
import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Test User model"""

    def test_create_user(self):
        """Test creating a user with email"""
        user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123',
            name='Test User'
        )
        assert user.email == 'test@example.com'
        assert user.username == 'testuser'
        assert user.name == 'Test User'
        assert user.role == 'user'
        assert user.check_password('testpass123')
        assert str(user) == 'test@example.com'

    def test_user_email_unique(self):
        """Test that user email must be unique"""
        User.objects.create_user(
            email='test@example.com',
            username='testuser1',
            password='testpass123',
            name='Test User'
        )
        with pytest.raises(Exception):
            User.objects.create_user(
                email='test@example.com',
                username='testuser2',
                password='testpass123',
                name='Test User 2'
            )


@pytest.mark.django_db
class TestRegisterAPI:
    """Test user registration endpoint"""

    def test_register_success(self, api_client):
        """Test successful user registration"""
        url = reverse('register')
        data = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'name': 'New User'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'success'
        assert 'user' in response.data['data']
        assert 'token' in response.data['data']
        assert 'refresh' in response.data['data']
        assert response.data['data']['user']['email'] == 'newuser@example.com'

    def test_register_short_password(self, api_client):
        """Test registration with short password fails"""
        url = reverse('register')
        data = {
            'email': 'newuser@example.com',
            'password': 'short',
            'name': 'New User'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'

    def test_register_missing_fields(self, api_client):
        """Test registration with missing fields fails"""
        url = reverse('register')
        data = {
            'email': 'newuser@example.com'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'

    def test_register_invalid_email(self, api_client):
        """Test registration with invalid email fails"""
        url = reverse('register')
        data = {
            'email': 'invalid-email',
            'password': 'securepass123',
            'name': 'New User'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'

    def test_register_duplicate_email(self, api_client, user):
        """Test registration with duplicate email fails"""
        url = reverse('register')
        data = {
            'email': user.email,
            'password': 'securepass123',
            'name': 'New User'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestLoginAPI:
    """Test user login endpoint"""

    def test_login_success(self, api_client, user):
        """Test successful login"""
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert 'user' in response.data['data']
        assert 'token' in response.data['data']
        assert 'refresh' in response.data['data']

    def test_login_invalid_credentials(self, api_client, user):
        """Test login with invalid credentials fails"""
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data['status'] == 'error'

    def test_login_nonexistent_user(self, api_client):
        """Test login with non-existent user fails"""
        url = reverse('login')
        data = {
            'email': 'nonexistent@example.com',
            'password': 'somepassword'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data['status'] == 'error'

    def test_login_missing_fields(self, api_client):
        """Test login with missing fields fails"""
        url = reverse('login')
        data = {
            'email': 'test@example.com'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestCurrentUserAPI:
    """Test get current user endpoint"""

    def test_get_current_user_authenticated(self, authenticated_client):
        """Test getting current user when authenticated"""
        url = reverse('get_current_user')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert response.data['data']['user']['email'] == 'test@example.com'

    def test_get_current_user_unauthenticated(self, api_client):
        """Test getting current user when not authenticated fails"""
        url = reverse('get_current_user')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
