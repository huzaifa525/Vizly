from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Visualization
from .serializers import VisualizationSerializer


class VisualizationViewSet(viewsets.ModelViewSet):
    """ViewSet for visualizations"""
    serializer_class = VisualizationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Visualization.objects.filter(
            query__user=self.request.user
        ).select_related('query__connection')

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': {'visualizations': serializer.data}
        })

    def retrieve(self, request, pk=None):
        try:
            visualization = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(visualization)
            return Response({
                'status': 'success',
                'data': {'visualization': serializer.data}
            })
        except Visualization.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Visualization not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'data': {'visualization': serializer.data}
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            visualization = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(visualization, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Visualization updated successfully'
                })
            return Response({
                'status': 'error',
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Visualization.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Visualization not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            visualization = self.get_queryset().get(pk=pk)
            visualization.delete()
            return Response({
                'status': 'success',
                'message': 'Visualization deleted successfully'
            })
        except Visualization.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Visualization not found'
            }, status=status.HTTP_404_NOT_FOUND)
