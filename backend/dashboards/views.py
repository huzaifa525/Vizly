from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Dashboard
from .serializers import DashboardSerializer


class DashboardViewSet(viewsets.ModelViewSet):
    """ViewSet for dashboards"""
    serializer_class = DashboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dashboard.objects.filter(user=self.request.user).prefetch_related('items__visualization__query')

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': {'dashboards': serializer.data}
        })

    def retrieve(self, request, pk=None):
        try:
            dashboard = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(dashboard)
            return Response({
                'status': 'success',
                'data': {'dashboard': serializer.data}
            })
        except Dashboard.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Dashboard not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'data': {'dashboard': serializer.data}
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None, partial=False):
        try:
            dashboard = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(dashboard, data=request.data, partial=partial)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Dashboard updated successfully'
                })
            return Response({
                'status': 'error',
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Dashboard.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Dashboard not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, pk=None):
        return self.update(request, pk, partial=True)

    def destroy(self, request, pk=None):
        try:
            dashboard = self.get_queryset().get(pk=pk)
            dashboard.delete()
            return Response({
                'status': 'success',
                'message': 'Dashboard deleted successfully'
            })
        except Dashboard.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Dashboard not found'
            }, status=status.HTTP_404_NOT_FOUND)
