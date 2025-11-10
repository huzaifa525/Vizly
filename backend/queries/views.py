from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Query
from .serializers import QuerySerializer
from connections.services import execute_query


class QueryViewSet(viewsets.ModelViewSet):
    """ViewSet for SQL queries"""
    serializer_class = QuerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Query.objects.filter(user=self.request.user).select_related('connection')

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': {'queries': serializer.data}
        })

    def retrieve(self, request, pk=None):
        try:
            query = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(query)
            return Response({
                'status': 'success',
                'data': {'query': serializer.data}
            })
        except Query.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Query not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'data': {'query': serializer.data}
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            query = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(query, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Query updated successfully'
                })
            return Response({
                'status': 'error',
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Query.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Query not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            query = self.get_queryset().get(pk=pk)
            query.delete()
            return Response({
                'status': 'success',
                'message': 'Query deleted successfully'
            })
        except Query.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Query not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute the SQL query"""
        try:
            query = self.get_queryset().get(pk=pk)
            result = execute_query(query.connection, query.sql)
            return Response({
                'status': 'success',
                'data': result
            })
        except Query.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Query not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
