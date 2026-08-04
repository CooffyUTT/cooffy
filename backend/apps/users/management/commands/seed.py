"""
Management command to run all seed commands for development.
 
Usage:
    python manage.py seed        # runs seed_users and seed_products
    python manage.py seed --force  # passes --force to seed_users
"""

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Ejecuta todos los comandos seed (seed_users, seed_branches, seed_products, seed_orders y seed_analytics).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Pasa --force a seed_users para re-crear usuarios.',
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

        force = options['force']

        self.stdout.write(self.style.MIGRATE_HEADING("=== Ejecutando seed_users ==="))
        seed_users_kwargs = {}
        if force:
            seed_users_kwargs['force'] = True
        call_command('seed_users', **seed_users_kwargs)

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Ejecutando seed_branches ==="))
        call_command('seed_branches')

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Ejecutando seed_products ==="))
        call_command('seed_products')

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Ejecutando seed_orders ==="))
        call_command('seed_orders')

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Ejecutando seed_analytics ==="))
        call_command('seed_analytics')

        self.stdout.write(self.style.MIGRATE_LABEL("\n¡Todos los seeds completados con éxito"))
