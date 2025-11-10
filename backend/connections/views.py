from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Connection
from .serializers import ConnectionSerializer
from .services import test_database_connection


class ConnectionViewSet(viewsets.ModelViewSet):
    """ViewSet for database connections"""
    serializer_class = ConnectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Connection.objects.filter(user=self.request.user)

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': {'connections': serializer.data}
        })

    def retrieve(self, request, pk=None):
        try:
            connection = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(connection)
            return Response({
                'status': 'success',
                'data': {'connection': serializer.data}
            })
        except Connection.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Connection not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'data': {'connection': serializer.data}
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            connection = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(connection, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Connection updated successfully'
                })
            return Response({
                'status': 'error',
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Connection.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Connection not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            connection = self.get_queryset().get(pk=pk)
            connection.delete()
            return Response({
                'status': 'success',
                'message': 'Connection deleted successfully'
            })
        except Connection.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Connection not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """Test database connection"""
        try:
            connection = self.get_queryset().get(pk=pk)
            result = test_database_connection(connection)
            return Response({
                'status': 'success',
                'data': result
            })
        except Connection.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Connection not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
