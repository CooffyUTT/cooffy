"""
Management command to seed demo companies and branches for development.
 
Usage:
    python manage.py seed_branches         # creates companies and branches if they don't exist
    python manage.py seed_branches --clear # deletes all branches/companies and re-creates them
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from apps.users.models import User
from apps.branches.models import Company, Branch

SEED_BRANCHES = [
    {
        "company": "El Circulo",
        "branches": [
            {
                "name": "La Cafe",
                "school_id": 10001,
                "location": "Entre Docencia 1 y 6",
            },
            {
                "name": "Tiendita UTT",
                "school_id": 10001,
                "location": "A Lado de Vinculación",
            },
        ],
    },
    {
        "company": "Cooffy",
        "branches": [
            {
                "name": "Tiendita Don Andres",
                "school_id": 10001,
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

            for branch_data in company_data['branches']:
                branch_name = branch_data['name']

                branch_obj, was_created = Branch.objects.get_or_create(
                    name=branch_name,
                    company=company_obj,
                    defaults={
                        'school_id': branch_data['school_id'],
                        'location': branch_data['location'],
                    },
                )

                if was_created:
                    created_branches += 1
                    self.stdout.write(
                        f'    + Sucursal "{branch_name}" ({branch_data["location"]})'
                    )
                else:
                    self.stdout.write(f'    ~ Sucursal "{branch_name}" ya existe.')

        self.stdout.write(
            self.style.SUCCESS(
                f'\n{created_companies} empresa(s) creada(s), '
                f'{created_branches} sucursal(es) creada(s).'
            )
        )
