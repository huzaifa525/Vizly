from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.http import HttpResponse
import logging
import pandas as pd
import csv
import io
from .models import Query
from .serializers import QuerySerializer
from connections.models import Connection
from connections.services import execute_query

logger = logging.getLogger('queries')


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

    @method_decorator(ratelimit(key='user', rate='30/m', method='POST'))
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute the SQL query"""
        try:
            query = self.get_queryset().get(pk=pk)
            logger.info(f'User {request.user.id} executing query {pk} on connection {query.connection.name}')

            result = execute_query(query.connection, query.sql)

            logger.info(f'Query {pk} executed successfully, returned {result.get("rowCount", 0)} rows')
            return Response({
                'status': 'success',
                'data': result
            })
        except Query.DoesNotExist:
            logger.warning(f'Query {pk} not found for user {request.user.id}')
            return Response({
                'status': 'error',
                'message': 'Query not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f'Query {pk} execution failed for user {request.user.id}: {str(e)}')
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(ratelimit(key='user', rate='30/m', method='POST'))
    @action(detail=False, methods=['post'])
    def execute_raw(self, request):
        """Execute raw SQL query"""
        try:
            connection_id = request.data.get('connection_id')
            sql = request.data.get('sql')

            if not connection_id or not sql:
                logger.warning(f'User {request.user.id} attempted raw query without required fields')
                return Response({
                    'status': 'error',
                    'message': 'connection_id and sql are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            connection = Connection.objects.get(pk=connection_id, user=request.user)
            logger.info(f'User {request.user.id} executing raw query on connection {connection.name}')
            logger.debug(f'SQL: {sql[:200]}...')  # Log first 200 chars of SQL

            result = execute_query(connection, sql)

            logger.info(f'Raw query executed successfully, returned {result.get("rowCount", 0)} rows')
            return Response({
                'status': 'success',
                'data': result
            })
        except Connection.DoesNotExist:
            logger.warning(f'Connection {connection_id} not found for user {request.user.id}')
            return Response({
                'status': 'error',
                'message': 'Connection not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f'Raw query execution failed for user {request.user.id}: {str(e)}')
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(ratelimit(key='user', rate='20/m', method='POST'))
    @action(detail=False, methods=['post'])
    def export_csv(self, request):
        """Export query results to CSV"""
        try:
            connection_id = request.data.get('connection_id')
            sql = request.data.get('sql')
            filename = request.data.get('filename', 'export')

            if not connection_id or not sql:
                return Response({
                    'status': 'error',
                    'message': 'connection_id and sql are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            connection = Connection.objects.get(pk=connection_id, user=request.user)
            logger.info(f'User {request.user.id} exporting CSV from connection {connection.name}')

            result = execute_query(connection, sql)

            if not result['rows']:
                return Response({
                    'status': 'error',
                    'message': 'No data to export'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create CSV
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=result['rows'][0].keys())
            writer.writeheader()
            writer.writerows(result['rows'])

            # Create response
            response = HttpResponse(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'

            logger.info(f'CSV export successful, {result.get("rowCount", 0)} rows exported')
            return response

        except Connection.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Connection not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f'CSV export failed for user {request.user.id}: {str(e)}')
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(ratelimit(key='user', rate='20/m', method='POST'))
    @action(detail=False, methods=['post'])
    def export_excel(self, request):
        """Export query results to Excel"""
        try:
            connection_id = request.data.get('connection_id')
            sql = request.data.get('sql')
            filename = request.data.get('filename', 'export')

            if not connection_id or not sql:
                return Response({
                    'status': 'error',
                    'message': 'connection_id and sql are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            connection = Connection.objects.get(pk=connection_id, user=request.user)
            logger.info(f'User {request.user.id} exporting Excel from connection {connection.name}')

            result = execute_query(connection, sql)

            if not result['rows']:
                return Response({
                    'status': 'error',
                    'message': 'No data to export'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create Excel file using pandas
            df = pd.DataFrame(result['rows'])
            output = io.BytesIO()

            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Query Results', index=False)

            output.seek(0)

            # Create response
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}.xlsx"'

            logger.info(f'Excel export successful, {result.get("rowCount", 0)} rows exported')
            return response

        except Connection.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Connection not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f'Excel export failed for user {request.user.id}: {str(e)}')
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
