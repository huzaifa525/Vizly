# Generated manually for initial migration

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('queries', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Visualization',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('type', models.CharField(choices=[('table', 'Table'), ('line', 'Line Chart'), ('bar', 'Bar Chart'), ('pie', 'Pie Chart'), ('area', 'Area Chart'), ('scatter', 'Scatter Plot')], max_length=20)),
                ('config', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('query', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='visualizations', to='queries.query')),
            ],
            options={
                'db_table': 'visualizations',
                'ordering': ['-created_at'],
            },
        ),
    ]
