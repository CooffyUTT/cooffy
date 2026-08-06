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


SEED_SCHOOLS = [
    {
        "short_name": "UTT",
        "full_name": "Universidad Tecnológica de Tijuana",
        "address": "Tijuana, Baja California",
        "admin": "admin_escolar1",
        "users": ["admin", "cocina1", "cliente1", "admin_escolar1"],
        "manager": "admin",
        "kitchen": "cocina1",
        "companies": [
            {
                "name": "El Circulo",
                "branches": [
                    {"name": "La Cafe", "location": "Entre Docencia 1 y 6"},
                    {"name": "Tiendita UTT", "location": "A Lado de Vinculación"},
                ],
            },
            {
                "name": "Cooffy",
                "branches": [
                    {"name": "Tiendita Don Andres", "location": "Frente Biblioteca"},
                ],
            },
        ],
    },
    {
        "short_name": "UABC",
        "full_name": "Universidad Autónoma de Baja California",
        "address": "Tijuana, Baja California",
        "admin": "admin_escolar2",
        "users": ["admin2", "cocina2", "cliente2", "admin_escolar2"],
        "manager": "admin2",
        "kitchen": "cocina2",
        "companies": [
            {
                "name": "Cooffy Campus 2",
                "branches": [
                    {"name": "Cafetería Campus 2", "location": "Edificio principal"},
                ],
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

        if options['clear']:
            deleted_branches, _ = Branch.objects.all().delete()
            deleted_companies, _ = Company.objects.all().delete()
            self.stdout.write(
                f'{deleted_companies} empresa(s) y {deleted_branches} sucursal(es) eliminadas.\n'
            )

        created_companies = 0
        created_branches = 0

        for school_data in SEED_SCHOOLS:
            school_admin = User.objects.filter(user=school_data['admin']).first()
            school, school_created = School.objects.get_or_create(
                short_name=school_data['short_name'],
                defaults={
                    'full_name': school_data['full_name'],
                    'address': school_data['address'],
                    'admin': school_admin,
                },
            )
            if school_created:
                self.stdout.write(
                    self.style.SUCCESS(f'✔ Escuela "{school.full_name}" creada.')
                )

            if school_admin and school.admin_id != school_admin.id:
                school.admin = school_admin
                school.save(update_fields=['admin', 'updated_at'])

            users = User.objects.filter(user__in=school_data['users'])
            users.update(school=school)

            manager = User.objects.get(user=school_data['manager'])
            first_branch = None
            for company_data in school_data['companies']:
                company_obj, was_created = Company.objects.get_or_create(
                    name=company_data['name'],
                    defaults={'owner': manager},
                )
                if company_obj.owner_id != manager.id:
                    company_obj.owner = manager
                    company_obj.save(update_fields=['owner', 'updated_at'])

                if was_created:
                    created_companies += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✔ Empresa "{company_obj.name}" creada.')
                    )
                else:
                    self.stdout.write(f'  ~ Empresa "{company_obj.name}" ya existe.')

                CompanySchool.objects.update_or_create(
                    company=company_obj,
                    school=school,
                    defaults={'active': True},
                )

                for branch_data in company_data['branches']:
                    branch_obj, was_created = Branch.objects.get_or_create(
                        name=branch_data['name'],
                        company=company_obj,
                        defaults={
                            'school': school,
                            'location': branch_data['location'],
                        },
                    )
                    if branch_obj.school_id != school.id:
                        branch_obj.school = school
                        branch_obj.save(update_fields=['school', 'updated_at'])

                    if first_branch is None:
                        first_branch = branch_obj

                    if was_created:
                        created_branches += 1
                        self.stdout.write(
                            f'    + Sucursal "{branch_obj.name}" ({branch_data["location"]})'
                        )
                    else:
                        self.stdout.write(f'    ~ Sucursal "{branch_obj.name}" ya existe.')

            kitchen = User.objects.get(user=school_data['kitchen'])
            if first_branch and kitchen.branch_id != first_branch.id:
                kitchen.branch = first_branch
                kitchen.save(update_fields=['branch', 'updated_at'])
                self.stdout.write(
                    f'    ✔ usuario "{kitchen.user}" asignado a sucursal "{first_branch.name}"'
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n{created_companies} empresa(s) creada(s), '
                f'{created_branches} sucursal(es) creada(s).'
            )
        )
