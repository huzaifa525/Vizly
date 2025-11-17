"""
Tests for the visualizations app
"""
import pytest
from django.urls import reverse
from rest_framework import status
from visualizations.models import Visualization
from queries.models import Query
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
        user=user
    )


@pytest.fixture
def query(user, connection):
    """Create a test query"""
    return Query.objects.create(
        name='Test Query',
        sql='SELECT * FROM users',
        connection=connection,
        user=user
    )


@pytest.fixture
def visualization(query):
    """Create a test visualization"""
    return Visualization.objects.create(
        name='Test Bar Chart',
        type='bar',
        config={'x_axis': 'date', 'y_axis': 'count'},
        query=query
    )


@pytest.mark.django_db
class TestVisualizationModel:
    """Test Visualization model"""

    def test_create_visualization(self, query):
        """Test creating a visualization"""
        viz = Visualization.objects.create(
            name='Line Chart',
            type='line',
            config={'x_axis': 'time', 'y_axis': 'value'},
            query=query
        )
        assert viz.name == 'Line Chart'
        assert viz.type == 'line'
        assert viz.config == {'x_axis': 'time', 'y_axis': 'value'}
        assert viz.query == query
        assert str(viz) == 'Line Chart (line)'

    def test_visualization_ordering(self, query):
        """Test visualizations are ordered by created_at descending"""
        viz1 = Visualization.objects.create(
            name='Viz 1',
            type='bar',
            query=query
        )
        viz2 = Visualization.objects.create(
            name='Viz 2',
            type='line',
            query=query
        )
        visualizations = list(Visualization.objects.all())
        assert visualizations[0] == viz2
        assert visualizations[1] == viz1

    def test_visualization_type_choices(self, query):
        """Test various visualization type choices"""
        valid_types = ['table', 'line', 'bar', 'pie', 'scatter', 'area']
        for viz_type in valid_types:
            viz = Visualization.objects.create(
                name=f'Test {viz_type}',
                type=viz_type,
                query=query
            )
            assert viz.type == viz_type


@pytest.mark.django_db
class TestVisualizationListAPI:
    """Test visualization list endpoint"""

    def test_list_visualizations_authenticated(self, authenticated_client, visualization):
        """Test listing visualizations when authenticated"""
        url = reverse('visualization-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert len(response.data['data']['visualizations']) == 1
        assert response.data['data']['visualizations'][0]['name'] == 'Test Bar Chart'

    def test_list_visualizations_unauthenticated(self, api_client):
        """Test listing visualizations when not authenticated fails"""
        url = reverse('visualization-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_visualizations_only_user_visualizations(
        self, authenticated_client, visualization, admin_user
    ):
        """Test users only see visualizations from their own queries"""
        # Create connection, query, and visualization for admin user
        admin_connection = Connection.objects.create(
            name='Admin Connection',
            type='mysql',
            database='admindb',
            user=admin_user
        )
        admin_query = Query.objects.create(
            name='Admin Query',
            sql='SELECT * FROM admin_table',
            connection=admin_connection,
            user=admin_user
        )
        Visualization.objects.create(
            name='Admin Visualization',
            type='pie',
            query=admin_query
        )

        url = reverse('visualization-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']['visualizations']) == 1
        assert response.data['data']['visualizations'][0]['name'] == 'Test Bar Chart'


@pytest.mark.django_db
class TestVisualizationRetrieveAPI:
    """Test visualization retrieve endpoint"""

    def test_retrieve_visualization(self, authenticated_client, visualization):
        """Test retrieving a specific visualization"""
        url = reverse('visualization-detail', kwargs={'pk': visualization.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert response.data['data']['visualization']['name'] == 'Test Bar Chart'

    def test_retrieve_nonexistent_visualization(self, authenticated_client):
        """Test retrieving non-existent visualization fails"""
        url = reverse('visualization-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestVisualizationCreateAPI:
    """Test visualization create endpoint"""

    def test_create_visualization(self, authenticated_client, query):
        """Test creating a new visualization"""
        url = reverse('visualization-list')
        data = {
            'name': 'New Pie Chart',
            'type': 'pie',
            'config': {'label': 'category', 'value': 'amount'},
            'query': str(query.id)
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'success'
        assert response.data['data']['visualization']['name'] == 'New Pie Chart'
        assert Visualization.objects.filter(name='New Pie Chart').exists()

    def test_create_visualization_invalid_type(self, authenticated_client, query):
        """Test creating visualization with invalid type fails"""
        url = reverse('visualization-list')
        data = {
            'name': 'Invalid Viz',
            'type': 'invalid_type',
            'query': str(query.id)
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'

    def test_create_visualization_missing_fields(self, authenticated_client):
        """Test creating visualization with missing required fields fails"""
        url = reverse('visualization-list')
        data = {
            'name': 'Incomplete Visualization'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestVisualizationUpdateAPI:
    """Test visualization update endpoint"""

    def test_update_visualization(self, authenticated_client, visualization):
        """Test updating a visualization"""
        url = reverse('visualization-detail', kwargs={'pk': visualization.id})
        data = {
            'name': 'Updated Chart Name',
            'type': 'line',
            'config': {'x': 'time', 'y': 'value'}
        }
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'

        visualization.refresh_from_db()
        assert visualization.name == 'Updated Chart Name'
        assert visualization.type == 'line'

    def test_update_nonexistent_visualization(self, authenticated_client):
        """Test updating non-existent visualization fails"""
        url = reverse('visualization-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        data = {'name': 'Updated Name'}
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestVisualizationDeleteAPI:
    """Test visualization delete endpoint"""

    def test_delete_visualization(self, authenticated_client, visualization):
        """Test deleting a visualization"""
        viz_id = visualization.id
        url = reverse('visualization-detail', kwargs={'pk': viz_id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert not Visualization.objects.filter(id=viz_id).exists()

    def test_delete_nonexistent_visualization(self, authenticated_client):
        """Test deleting non-existent visualization fails"""
        url = reverse('visualization-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'
