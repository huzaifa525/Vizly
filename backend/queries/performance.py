from django.db import models
from django.conf import settings
import uuid
from queries.models import Query
from connections.models import Connection


class QueryExecution(models.Model):
    """Track query execution performance"""

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('error', 'Error'),
        ('timeout', 'Timeout'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.ForeignKey(Query, on_delete=models.CASCADE, related_name='executions', null=True, blank=True)
    connection = models.ForeignKey(Connection, on_delete=models.CASCADE, related_name='query_executions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='query_executions')

    # SQL and parameters
    sql = models.TextField()
    parameters = models.JSONField(default=dict, null=True, blank=True)

    # Performance metrics
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='success')
    execution_time_ms = models.FloatField(help_text='Execution time in milliseconds')
    row_count = models.IntegerField(default=0)
    bytes_returned = models.BigIntegerField(default=0, help_text='Size of data returned in bytes')

    # Error information
    error_message = models.TextField(null=True, blank=True)
    error_code = models.CharField(max_length=50, null=True, blank=True)

    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Additional metadata
    cache_hit = models.BooleanField(default=False)
    query_plan = models.JSONField(null=True, blank=True, help_text='Database query execution plan')

    class Meta:
        db_table = 'query_executions'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['-started_at']),
            models.Index(fields=['query', '-started_at']),
            models.Index(fields=['user', '-started_at']),
            models.Index(fields=['status', '-started_at']),
        ]

    def __str__(self):
        return f"Query execution {self.id} - {self.status}"

    @property
    def duration_seconds(self):
        """Get execution time in seconds"""
        return self.execution_time_ms / 1000 if self.execution_time_ms else 0

    @property
    def is_slow(self):
        """Check if query is considered slow (>5 seconds)"""
        return self.execution_time_ms > 5000 if self.execution_time_ms else False


class QueryPerformanceStats(models.Model):
    """Aggregate statistics for query performance"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.OneToOneField(Query, on_delete=models.CASCADE, related_name='performance_stats')

    # Aggregate metrics
    total_executions = models.IntegerField(default=0)
    successful_executions = models.IntegerField(default=0)
    failed_executions = models.IntegerField(default=0)

    # Performance metrics
    avg_execution_time_ms = models.FloatField(default=0)
    min_execution_time_ms = models.FloatField(default=0)
    max_execution_time_ms = models.FloatField(default=0)
    avg_row_count = models.FloatField(default=0)

    # Timestamps
    first_execution = models.DateTimeField(null=True, blank=True)
    last_execution = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'query_performance_stats'

    def __str__(self):
        return f"Stats for {self.query.name}"

    def update_stats(self):
        """Recalculate statistics from executions"""
        from django.db.models import Avg, Min, Max, Count, Q

        executions = self.query.executions.all()

        if not executions.exists():
            return

        stats = executions.aggregate(
            total=Count('id'),
            successful=Count('id', filter=Q(status='success')),
            failed=Count('id', filter=Q(status__in=['error', 'timeout'])),
            avg_time=Avg('execution_time_ms'),
            min_time=Min('execution_time_ms'),
            max_time=Max('execution_time_ms'),
            avg_rows=Avg('row_count'),
        )

        self.total_executions = stats['total'] or 0
        self.successful_executions = stats['successful'] or 0
        self.failed_executions = stats['failed'] or 0
        self.avg_execution_time_ms = stats['avg_time'] or 0
        self.min_execution_time_ms = stats['min_time'] or 0
        self.max_execution_time_ms = stats['max_time'] or 0
        self.avg_row_count = stats['avg_rows'] or 0

        self.first_execution = executions.order_by('started_at').first().started_at
        self.last_execution = executions.order_by('-started_at').first().started_at

        self.save()


def track_query_execution(query, connection, user, sql, execution_time_ms, row_count,
                          status='success', error_message=None, bytes_returned=0):
    """Helper function to track query execution"""
    import sys
    from django.utils import timezone

    execution = QueryExecution.objects.create(
        query=query,
        connection=connection,
        user=user,
        sql=sql,
        status=status,
        execution_time_ms=execution_time_ms,
        row_count=row_count,
        error_message=error_message,
        bytes_returned=bytes_returned,
        completed_at=timezone.now(),
    )

    # Update or create performance stats
    if query:
        stats, created = QueryPerformanceStats.objects.get_or_create(query=query)
        stats.update_stats()

    return execution


def get_slow_queries(threshold_ms=5000, limit=20):
    """Get queries that are running slow"""
    return QueryExecution.objects.filter(
        execution_time_ms__gt=threshold_ms,
        status='success'
    ).select_related('query', 'connection', 'user')[:limit]


def get_query_performance_report(query):
    """Generate a performance report for a specific query"""
    from django.db.models import Avg, Count, Q
    from datetime import timedelta
    from django.utils import timezone

    now = timezone.now()
    last_24h = now - timedelta(hours=24)
    last_7d = now - timedelta(days=7)

    executions = query.executions.all()

    report = {
        'query_id': query.id,
        'query_name': query.name,
        'total_executions': executions.count(),
        'last_24h': executions.filter(started_at__gte=last_24h).count(),
        'last_7d': executions.filter(started_at__gte=last_7d).count(),
        'success_rate': 0,
        'avg_execution_time': 0,
        'p95_execution_time': 0,
        'slow_queries_count': executions.filter(execution_time_ms__gt=5000).count(),
    }

    if executions.exists():
        stats = executions.aggregate(
            total=Count('id'),
            successful=Count('id', filter=Q(status='success')),
            avg_time=Avg('execution_time_ms'),
        )

        report['success_rate'] = (stats['successful'] / stats['total'] * 100) if stats['total'] > 0 else 0
        report['avg_execution_time'] = stats['avg_time'] or 0

        # Calculate P95
        execution_times = list(executions.values_list('execution_time_ms', flat=True).order_by('execution_time_ms'))
        if execution_times:
            p95_index = int(len(execution_times) * 0.95)
            report['p95_execution_time'] = execution_times[p95_index] if p95_index < len(execution_times) else execution_times[-1]

    return report
