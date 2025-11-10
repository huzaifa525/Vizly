from django.db import models
from queries.models import Query
import uuid


class Visualization(models.Model):
    """Chart/visualization configuration"""
    TYPE_CHOICES = [
        ('table', 'Table'),
        ('line', 'Line Chart'),
        ('bar', 'Bar Chart'),
        ('horizontal_bar', 'Horizontal Bar Chart'),
        ('stacked_bar', 'Stacked Bar Chart'),
        ('grouped_bar', 'Grouped Bar Chart'),
        ('pie', 'Pie Chart'),
        ('donut', 'Donut Chart'),
        ('area', 'Area Chart'),
        ('stacked_area', 'Stacked Area Chart'),
        ('scatter', 'Scatter Plot'),
        ('bubble', 'Bubble Chart'),
        ('heatmap', 'Heatmap'),
        ('treemap', 'Treemap'),
        ('sunburst', 'Sunburst Chart'),
        ('sankey', 'Sankey Diagram'),
        ('funnel', 'Funnel Chart'),
        ('radar', 'Radar Chart'),
        ('gauge', 'Gauge Chart'),
        ('candlestick', 'Candlestick Chart'),
        ('boxplot', 'Box Plot'),
        ('waterfall', 'Waterfall Chart'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    config = models.JSONField(default=dict)  # Chart configuration
    query = models.ForeignKey(Query, on_delete=models.CASCADE, related_name='visualizations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'visualizations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.type})"
