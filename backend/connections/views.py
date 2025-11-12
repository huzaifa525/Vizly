from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from sqlalchemy import inspect
from .models import Connection
from .serializers import ConnectionSerializer
from .services import test_database_connection, create_connection_engine


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

    @action(detail=True, methods=['get'])
    def schema(self, request, pk=None):
        """Get database schema (tables and columns)"""
        try:
            connection = self.get_queryset().get(pk=pk)
            engine = create_connection_engine(connection)
            inspector = inspect(engine)

            # Get all table names
            table_names = inspector.get_table_names()

            # Get schema information for each table
            schema = []
            for table_name in table_names:
                columns = []
                for column in inspector.get_columns(table_name):
                    columns.append({
                        'name': column['name'],
                        'type': str(column['type']),
                        'nullable': column.get('nullable', True),
                        'default': str(column.get('default')) if column.get('default') is not None else None,
                        'primary_key': column.get('primary_key', False),
                    })

                # Get primary keys
                pk_constraint = inspector.get_pk_constraint(table_name)
                primary_keys = pk_constraint.get('constrained_columns', []) if pk_constraint else []

                # Get foreign keys
                foreign_keys = []
                for fk in inspector.get_foreign_keys(table_name):
                    foreign_keys.append({
                        'columns': fk.get('constrained_columns', []),
                        'referred_table': fk.get('referred_table'),
                        'referred_columns': fk.get('referred_columns', []),
                    })

                # Get indexes
                indexes = []
                for idx in inspector.get_indexes(table_name):
                    indexes.append({
                        'name': idx.get('name'),
                        'columns': idx.get('column_names', []),
                        'unique': idx.get('unique', False),
                    })

                schema.append({
                    'name': table_name,
                    'columns': columns,
                    'primary_keys': primary_keys,
                    'foreign_keys': foreign_keys,
                    'indexes': indexes,
                    'row_count': None,  # We don't query row counts for performance
                })

            return Response({
                'status': 'success',
                'data': {
                    'schema': schema,
                    'table_count': len(schema),
                }
            })

        except Connection.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Connection not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Failed to retrieve schema: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
