# Generated manually for initial migration

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('visualizations', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Dashboard',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('layout', models.JSONField(blank=True, default=dict, null=True)),
                ('is_public', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dashboards', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'dashboards',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='DashboardItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('position', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='dashboards.dashboard')),
                ('visualization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dashboard_items', to='visualizations.visualization')),
            ],
            options={
                'db_table': 'dashboard_items',
                'ordering': ['created_at'],
            },
        ),
    ]
