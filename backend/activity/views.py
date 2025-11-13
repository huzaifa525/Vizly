from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from .utils import get_activity_stats, log_activity


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing activity logs"""
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ActivityLog.objects.select_related('user')

        # Filter by user if requested
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Filter by resource type
        resource_type = self.request.query_params.get('resource_type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)

        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)

        # Limit results
        limit = int(self.request.query_params.get('limit', 100))
        return queryset[:limit]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get activity statistics"""
        user_id = request.query_params.get('user_id')
        user = None
        if user_id:
            from django.contrib.auth.models import User
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        stats = get_activity_stats(user)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def my_activities(self, request):
        """Get current user's activities"""
        activities = ActivityLog.objects.filter(user=request.user)[:50]
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent activities across the platform"""
        limit = int(request.query_params.get('limit', 20))
        activities = ActivityLog.objects.select_related('user')[:limit]
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_activity_log(request):
    """Manually create an activity log (for testing or special cases)"""
    data = request.data
    required_fields = ['action', 'resource_type']

    for field in required_fields:
        if field not in data:
            return Response(
                {'error': f'{field} is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

    activity = log_activity(
        user=request.user,
        action=data['action'],
        resource_type=data['resource_type'],
        resource_id=data.get('resource_id'),
        resource_name=data.get('resource_name'),
        details=data.get('details'),
        request=request
    )

    serializer = ActivityLogSerializer(activity)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
