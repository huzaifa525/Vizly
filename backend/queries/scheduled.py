from django.db import models
from django.conf import settings
import uuid
from queries.models import Query


class ScheduledQuery(models.Model):
    """Scheduled query execution"""

    FREQUENCY_CHOICES = [
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom (Cron)'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('disabled', 'Disabled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.ForeignKey(Query, on_delete=models.CASCADE, related_name='schedules')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scheduled_queries')

    # Schedule configuration
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily')
    cron_expression = models.CharField(max_length=100, null=True, blank=True,
                                     help_text='Cron expression for custom schedules')

    # Time configuration (for non-cron schedules)
    hour = models.IntegerField(null=True, blank=True, help_text='Hour of day (0-23)')
    minute = models.IntegerField(null=True, blank=True, help_text='Minute of hour (0-59)')
    day_of_week = models.IntegerField(null=True, blank=True, help_text='Day of week (0-6, 0=Monday)')
    day_of_month = models.IntegerField(null=True, blank=True, help_text='Day of month (1-31)')

    # Status and control
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    enabled = models.BooleanField(default=True)

    # Notification settings
    notify_on_success = models.BooleanField(default=False)
    notify_on_failure = models.BooleanField(default=True)
    notification_emails = models.JSONField(default=list, help_text='List of emails to notify')

    # Export settings
    auto_export = models.BooleanField(default=False)
    export_format = models.CharField(max_length=10, default='csv',
                                    choices=[('csv', 'CSV'), ('excel', 'Excel'), ('json', 'JSON')])
    export_destination = models.JSONField(default=dict, help_text='S3, email, or other destination config')

    # Execution tracking
    last_run_at = models.DateTimeField(null=True, blank=True)
    last_run_status = models.CharField(max_length=20, null=True, blank=True)
    next_run_at = models.DateTimeField(null=True, blank=True)
    run_count = models.IntegerField(default=0)
    success_count = models.IntegerField(default=0)
    failure_count = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'scheduled_queries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'enabled', 'next_run_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_frequency_display()})"

    @property
    def is_active(self):
        """Check if schedule is active"""
        return self.enabled and self.status == 'active'

    def calculate_next_run(self):
        """Calculate next run time based on frequency"""
        from datetime import datetime, timedelta
        from django.utils import timezone

        now = timezone.now()

        if self.frequency == 'hourly':
            return now + timedelta(hours=1)
        elif self.frequency == 'daily':
            next_run = now + timedelta(days=1)
            if self.hour is not None:
                next_run = next_run.replace(hour=self.hour, minute=self.minute or 0, second=0)
            return next_run
        elif self.frequency == 'weekly':
            days_ahead = (self.day_of_week or 0) - now.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            next_run = now + timedelta(days=days_ahead)
            if self.hour is not None:
                next_run = next_run.replace(hour=self.hour, minute=self.minute or 0, second=0)
            return next_run
        elif self.frequency == 'monthly':
            next_run = now.replace(day=self.day_of_month or 1)
            if next_run <= now:
                # Move to next month
                if now.month == 12:
                    next_run = next_run.replace(year=now.year + 1, month=1)
                else:
                    next_run = next_run.replace(month=now.month + 1)
            if self.hour is not None:
                next_run = next_run.replace(hour=self.hour, minute=self.minute or 0, second=0)
            return next_run
        elif self.frequency == 'custom' and self.cron_expression:
            # Would use croniter library in production
            return now + timedelta(hours=1)  # Fallback

        return now + timedelta(hours=1)  # Default fallback

    def record_execution(self, status, duration_ms=None, row_count=None, error=None):
        """Record the result of a scheduled execution"""
        from django.utils import timezone

        self.run_count += 1
        if status == 'success':
            self.success_count += 1
        else:
            self.failure_count += 1

        self.last_run_at = timezone.now()
        self.last_run_status = status
        self.next_run_at = self.calculate_next_run()
        self.save()


class ScheduledQueryRun(models.Model):
    """Individual execution of a scheduled query"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scheduled_query = models.ForeignKey(ScheduledQuery, on_delete=models.CASCADE, related_name='runs')

    # Execution details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_ms = models.FloatField(null=True, blank=True)

    # Results
    row_count = models.IntegerField(null=True, blank=True)
    result_size_bytes = models.BigIntegerField(null=True, blank=True)
    export_path = models.CharField(max_length=500, null=True, blank=True)

    # Error information
    error_message = models.TextField(null=True, blank=True)
    error_traceback = models.TextField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scheduled_query_runs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['scheduled_query', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return f"Run {self.id} - {self.status}"

    @property
    def duration_seconds(self):
        """Get duration in seconds"""
        return self.duration_ms / 1000 if self.duration_ms else 0


# Celery tasks would go here in a production environment
# For now, we'll create placeholder functions

def execute_scheduled_query(scheduled_query_id):
    """
    Execute a scheduled query (would be a Celery task in production)

    Usage with Celery:
    @shared_task
    def execute_scheduled_query(scheduled_query_id):
        ...
    """
    from django.utils import timezone
    from queries.services import execute_query

    try:
        schedule = ScheduledQuery.objects.get(id=scheduled_query_id)

        # Create run record
        run = ScheduledQueryRun.objects.create(
            scheduled_query=schedule,
            status='running',
            started_at=timezone.now()
        )

        # Execute query
        start_time = timezone.now()
        try:
            result = execute_query(schedule.query.connection, schedule.query.sql)
            duration = (timezone.now() - start_time).total_seconds() * 1000

            run.status = 'success'
            run.row_count = result.get('rowCount', 0)
            run.duration_ms = duration

            schedule.record_execution('success', duration, run.row_count)

            # Handle auto-export if enabled
            if schedule.auto_export:
                # Export logic here
                pass

            # Send success notification if enabled
            if schedule.notify_on_success:
                # Send notification
                pass

        except Exception as e:
            run.status = 'failed'
            run.error_message = str(e)
            schedule.record_execution('failed', error=str(e))

            # Send failure notification
            if schedule.notify_on_failure:
                # Send notification
                pass

        run.completed_at = timezone.now()
        run.save()

        return run.id

    except ScheduledQuery.DoesNotExist:
        print(f"Scheduled query {scheduled_query_id} not found")
        return None


def get_due_schedules():
    """Get scheduled queries that are due to run"""
    from django.utils import timezone

    now = timezone.now()
    return ScheduledQuery.objects.filter(
        enabled=True,
        status='active',
        next_run_at__lte=now
    )
