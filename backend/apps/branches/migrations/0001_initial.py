# Generated manually to introduce Company and Branch models

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='companies', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'companies',
                'ordering': ['-created_at'],
                'verbose_name_plural': 'Companies',
            },
        ),
        migrations.CreateModel(
            name='Branch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('school_id', models.BigIntegerField()),
                ('location', models.TextField(blank=True, null=True)),
                ('active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='branches', to='branches.company')),
            ],
            options={
                'db_table': 'branches',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='branch',
            index=models.Index(fields=['company'], name='branches_company_5f1e15_idx'),
        ),
        migrations.AddIndex(
            model_name='branch',
            index=models.Index(fields=['school_id', 'active'], name='branches_school__6d0f3f_idx'),
        ),
    ]
