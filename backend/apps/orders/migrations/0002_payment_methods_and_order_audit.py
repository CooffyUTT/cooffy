import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


def seed_payment_methods(apps, schema_editor):
    PaymentMethod = apps.get_model('orders', 'PaymentMethod')
    PaymentMethod.objects.get_or_create(
        pk=1, defaults={'name': 'Efectivo', 'is_digital': False, 'active': True}
    )
    PaymentMethod.objects.get_or_create(
        pk=2, defaults={'name': 'Tarjeta', 'is_digital': True, 'active': True}
    )


def normalize_orphan_payment_methods(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    Order.objects.exclude(payment_method__in=[1, 2]).update(payment_method=1)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentMethod',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
                ('is_digital', models.BooleanField()),
                ('active', models.BooleanField(default=True)),
            ],
            options={
                'db_table': 'payment_methods',
                'ordering': ['name'],
            },
        ),
        migrations.RunPython(seed_payment_methods, noop_reverse),
        migrations.RunPython(normalize_orphan_payment_methods, noop_reverse),
        migrations.AddField(
            model_name='order',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='order',
            name='payment_method',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='orders',
                to='orders.paymentmethod',
            ),
        ),
    ]
