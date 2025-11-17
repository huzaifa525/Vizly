"""
Tests for the connections app
"""
import pytest
from django.urls import reverse
from rest_framework import status
from connections.models import Connection


@pytest.fixture
def connection(user):
    """Create a test database connection"""
    return Connection.objects.create(
        name='Test PostgreSQL',
        type='postgres',
        host='localhost',
        port=5432,
        database='testdb',
        username='testuser',
        password='testpass',
        ssl=False,
        user=user
    )


@pytest.mark.django_db
class TestConnectionModel:
    """Test Connection model"""

    def test_create_connection(self, user):
        """Test creating a connection"""
        connection = Connection.objects.create(
            name='Test MySQL',
            type='mysql',
            host='localhost',
            port=3306,
            database='testdb',
            username='testuser',
            password='testpass',
            ssl=True,
            user=user
        )
        assert connection.name == 'Test MySQL'
        assert connection.type == 'mysql'
        assert connection.host == 'localhost'
        assert connection.port == 3306
        assert connection.database == 'testdb'
        assert connection.ssl is True
        assert connection.user == user
        assert str(connection) == 'Test MySQL (mysql)'

    def test_connection_ordering(self, user):
        """Test connections are ordered by created_at descending"""
        conn1 = Connection.objects.create(
            name='Connection 1',
            type='postgres',
            database='db1',
            user=user
        )
        conn2 = Connection.objects.create(
            name='Connection 2',
            type='mysql',
            database='db2',
            user=user
        )
        connections = list(Connection.objects.all())
        assert connections[0] == conn2
        assert connections[1] == conn1


@pytest.mark.django_db
class TestConnectionListAPI:
    """Test connection list endpoint"""

    def test_list_connections_authenticated(self, authenticated_client, connection):
        """Test listing connections when authenticated"""
        url = reverse('connection-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert len(response.data['data']['connections']) == 1
        assert response.data['data']['connections'][0]['name'] == 'Test PostgreSQL'

    def test_list_connections_unauthenticated(self, api_client):
        """Test listing connections when not authenticated fails"""
        url = reverse('connection-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_connections_only_user_connections(self, authenticated_client, connection, admin_user):
        """Test users only see their own connections"""
        # Create a connection for a different user
        Connection.objects.create(
            name='Admin Connection',
            type='mysql',
            database='admindb',
            user=admin_user
        )

        url = reverse('connection-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']['connections']) == 1
        assert response.data['data']['connections'][0]['name'] == 'Test PostgreSQL'


@pytest.mark.django_db
class TestConnectionRetrieveAPI:
    """Test connection retrieve endpoint"""

    def test_retrieve_connection(self, authenticated_client, connection):
        """Test retrieving a specific connection"""
        url = reverse('connection-detail', kwargs={'pk': connection.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert response.data['data']['connection']['name'] == 'Test PostgreSQL'

    def test_retrieve_nonexistent_connection(self, authenticated_client):
        """Test retrieving non-existent connection fails"""
        url = reverse('connection-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'

    def test_retrieve_other_user_connection(self, authenticated_client, admin_user):
        """Test retrieving another user's connection fails"""
        other_connection = Connection.objects.create(
            name='Admin Connection',
            type='mysql',
            database='admindb',
            user=admin_user
        )

        url = reverse('connection-detail', kwargs={'pk': other_connection.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestConnectionCreateAPI:
    """Test connection create endpoint"""

    def test_create_connection(self, authenticated_client):
        """Test creating a new connection"""
        url = reverse('connection-list')
        data = {
            'name': 'New MySQL Connection',
            'type': 'mysql',
            'host': 'db.example.com',
            'port': 3306,
            'database': 'mydb',
            'username': 'dbuser',
            'password': 'dbpass',
            'ssl': True
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'success'
        assert response.data['data']['connection']['name'] == 'New MySQL Connection'
        assert Connection.objects.filter(name='New MySQL Connection').exists()

    def test_create_connection_invalid_type(self, authenticated_client):
        """Test creating connection with invalid type fails"""
        url = reverse('connection-list')
        data = {
            'name': 'Invalid Connection',
            'type': 'invalid_db',
            'database': 'mydb'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'

    def test_create_connection_missing_fields(self, authenticated_client):
        """Test creating connection with missing required fields fails"""
        url = reverse('connection-list')
        data = {
            'name': 'Incomplete Connection'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestConnectionUpdateAPI:
    """Test connection update endpoint"""

    def test_update_connection(self, authenticated_client, connection):
        """Test updating a connection"""
        url = reverse('connection-detail', kwargs={'pk': connection.id})
        data = {
            'name': 'Updated Connection Name',
            'port': 5433
        }
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'

        connection.refresh_from_db()
        assert connection.name == 'Updated Connection Name'
        assert connection.port == 5433

    def test_update_nonexistent_connection(self, authenticated_client):
        """Test updating non-existent connection fails"""
        url = reverse('connection-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        data = {'name': 'Updated Name'}
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestConnectionDeleteAPI:
    """Test connection delete endpoint"""

    def test_delete_connection(self, authenticated_client, connection):
        """Test deleting a connection"""
        connection_id = connection.id
        url = reverse('connection-detail', kwargs={'pk': connection_id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert not Connection.objects.filter(id=connection_id).exists()

    def test_delete_nonexistent_connection(self, authenticated_client):
        """Test deleting non-existent connection fails"""
        url = reverse('connection-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'
