
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('branches', '0003_branch_schedule'),
    ]

    operations = [
        migrations.AddField(
            model_name='branch',
            name='accepting_orders',
            field=models.BooleanField(default=True),
        ),
    ]
