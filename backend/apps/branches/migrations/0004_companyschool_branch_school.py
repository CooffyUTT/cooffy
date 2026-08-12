from django.core.management.color import no_style
from django.db import migrations, models
import django.db.models.deletion


def create_legacy_schools(apps, schema_editor):
    Branch = apps.get_model('branches', 'Branch')
    School = apps.get_model('schools', 'School')
    db_alias = schema_editor.connection.alias

    school_ids = (
        Branch.objects.using(db_alias)
        .values_list('school_id', flat=True)
        .distinct()
    )

    for school_id in school_ids:
        if school_id is None:
            continue
        School.objects.using(db_alias).get_or_create(
            id=school_id,
            defaults={
                'full_name': f'Escuela migrada {school_id}',
                'short_name': f'LEGACY-{school_id}',
            },
        )

    reset_sql = schema_editor.connection.ops.sequence_reset_sql(
        no_style(),
        [School],
    )
    with schema_editor.connection.cursor() as cursor:
        for sql in reset_sql:
            cursor.execute(sql)


class Migration(migrations.Migration):

    dependencies = [
        ('branches', '0003_branch_schedule'),
        ('schools', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CompanySchool',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'company',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='school_links',
                        to='branches.company',
                    ),
                ),
                (
                    'school',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='company_links',
                        to='schools.school',
                    ),
                ),
            ],
            options={
                'db_table': 'company_schools',
                'constraints': [
                    models.UniqueConstraint(
                        fields=('company', 'school'),
                        name='unique_company_school',
                    ),
                ],
                'indexes': [
                    models.Index(
                        fields=['school', 'active'],
                        name='company_sch_school__c2bd5a_idx',
                    ),
                    models.Index(
                        fields=['company', 'active'],
                        name='company_sch_company_8a6f3d_idx',
                    ),
                ],
            },
        ),
        migrations.AddField(
            model_name='company',
            name='schools',
            field=models.ManyToManyField(
                related_name='companies',
                through='branches.CompanySchool',
                to='schools.school',
            ),
        ),
        migrations.RunPython(create_legacy_schools, migrations.RunPython.noop),
        migrations.RenameField(
            model_name='branch',
            old_name='school_id',
            new_name='school',
        ),
        migrations.AlterField(
            model_name='branch',
            name='school',
            field=models.ForeignKey(
                db_column='school_id',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='branches',
                to='schools.school',
            ),
        ),
        migrations.RemoveIndex(
            model_name='branch',
            name='branches_school__57be82_idx',
        ),
        migrations.AddIndex(
            model_name='branch',
            index=models.Index(
                fields=['school', 'active'],
                name='branches_school__57be82_idx',
            ),
        ),
    ]
