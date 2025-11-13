from .models import ActivityLog


def log_activity(user, action, resource_type, resource_id=None, resource_name=None, details=None, request=None):
    """
    Log user activity

    Args:
        user: Django User object
        action: str - One of ActivityLog.ACTION_CHOICES
        resource_type: str - One of ActivityLog.RESOURCE_CHOICES
        resource_id: str - ID of the resource
        resource_name: str - Name/description of the resource
        details: dict - Additional metadata
        request: HttpRequest - Optional request object for IP and user agent
    """
    activity_data = {
        'user': user,
        'action': action,
        'resource_type': resource_type,
        'resource_id': str(resource_id) if resource_id else None,
        'resource_name': resource_name,
        'details': details or {},
    }

    if request:
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        activity_data['ip_address'] = ip_address

        # Get user agent
        activity_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:500]

    return ActivityLog.objects.create(**activity_data)


def get_recent_activities(user=None, resource_type=None, limit=50):
    """Get recent activities with optional filtering"""
    queryset = ActivityLog.objects.all()

    if user:
        queryset = queryset.filter(user=user)

    if resource_type:
        queryset = queryset.filter(resource_type=resource_type)

    return queryset[:limit]


def get_activity_stats(user=None):
    """Get activity statistics"""
    from django.db.models import Count

    queryset = ActivityLog.objects.all()
    if user:
        queryset = queryset.filter(user=user)

    stats = {
        'total_activities': queryset.count(),
        'by_action': dict(
            queryset.values('action').annotate(count=Count('id')).values_list('action', 'count')
        ),
        'by_resource': dict(
            queryset.values('resource_type').annotate(count=Count('id')).values_list('resource_type', 'count')
        ),
    }

    return stats
