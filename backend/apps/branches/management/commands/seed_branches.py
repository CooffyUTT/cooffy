"""
Management command to seed demo companies and branches for development.
 
Usage:
    python manage.py seed_branches         # creates companies and branches if they don't exist
    python manage.py seed_branches --clear # deletes all branches/companies and re-creates them
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from apps.users.models import User
from apps.branches.models import Company, CompanySchool, Branch
from apps.schools.models import School


SEED_SCHOOL_ID = 10001

SEED_BRANCHES = [
    {
        "company": "El Circulo",
        "branches": [
            {
                "name": "La Cafe",
                "location": "Entre Docencia 1 y 6",
            },
            {
                "name": "Tiendita UTT",
                "location": "A Lado de Vinculación",
            },
        ],
    },
    {
        "company": "Cooffy",
        "branches": [
            {
                "name": "Tiendita Don Andres",
                "location": "Frente Biblioteca",
            },
        ],
    },
]


class Command(BaseCommand):
    help = 'Siembra empresas y sucursales de prueba para desarrollo.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todas las sucursales y empresas antes de sembrar.',
        )

    def handle(self, *args, **options):
        if getattr(settings, 'DJANGO_ENV', 'development') != 'development':
            self.stderr.write(
                self.style.ERROR(
                    'Este comando solo puede ejecutarse en entorno desarrollo '
                    f'(DJANGO_ENV={getattr(settings, "DJANGO_ENV", "production")}).'
                )
            )
            return

        if not User.objects.filter(user='admin').exists():
            self.stderr.write(
                self.style.ERROR(
                    'No se encontró el usuario admin. Ejecuta seed_users primero.'
                )
            )
            return

        admin_user = User.objects.get(user='admin')

        school_admin = User.objects.filter(user='school_admin').first()
        school, _ = School.objects.get_or_create(
            id=SEED_SCHOOL_ID,
            defaults={
                'full_name': 'Universidad Tecnológica de Tijuana',
                'short_name': 'UTT',
                'address': 'Tijuana, Baja California',
                'admin': school_admin,
            },
        )
        if school_admin and school.admin_id != school_admin.id:
            school.admin = school_admin
            school.save(update_fields=['admin', 'updated_at'])

        if school_admin and school_admin.school_id != school.id:
            school_admin.school_id = school.id
            school_admin.save(update_fields=['school_id', 'updated_at'])

        if options['clear']:
            deleted_branches, _ = Branch.objects.all().delete()
            deleted_companies, _ = Company.objects.all().delete()
            self.stdout.write(
                f'{deleted_companies} empresa(s) y {deleted_branches} sucursal(es) eliminadas.\n'
            )

        created_companies = 0
        created_branches = 0

        for company_data in SEED_BRANCHES:
            company_name = company_data['company']

            company_obj, was_created = Company.objects.get_or_create(
                name=company_name,
                defaults={'owner': admin_user},
            )

            if was_created:
                created_companies += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✔ Empresa "{company_name}" creada.')
                )
            else:
                self.stdout.write(f'  ~ Empresa "{company_name}" ya existe.')

            CompanySchool.objects.update_or_create(
                company=company_obj,
                school=school,
                defaults={'active': True},
            )

            first_branch = None
            for branch_data in company_data['branches']:
                branch_name = branch_data['name']

                branch_obj, was_created = Branch.objects.get_or_create(
                    name=branch_name,
                    company=company_obj,
                    defaults={
                        'school': school,
                        'location': branch_data['location'],
                    },
                )

                if first_branch is None:
                    first_branch = branch_obj

                if was_created:
                    created_branches += 1
                    self.stdout.write(
                        f'    + Sucursal "{branch_name}" ({branch_data["location"]})'
                    )
                else:
                    self.stdout.write(f'    ~ Sucursal "{branch_name}" ya existe.')

            if first_branch:
                cocina = User.objects.filter(user='cocina1').first()
                if cocina and cocina.branch_id != first_branch.id:
                    cocina.branch_id = first_branch.id
                    cocina.save(update_fields=['branch_id', 'updated_at'])
                    self.stdout.write(
                        f'    ✔ usuario "cocina1" asignado a sucursal "{first_branch.name}"'
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n{created_companies} empresa(s) creada(s), '
                f'{created_branches} sucursal(es) creada(s).'
            )
        )
