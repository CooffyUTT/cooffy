"""
Management command to seed a default admin user for development.

Usage:
    python manage.py seed_dev       # creates admin if not exists
    python manage.py seed_dev --force  # re-creates even if already exists
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from apps.users.models import User


class Command(BaseCommand):
    help = 'Crea un usuario admin por defecto para desarrollo (user=admin / password=admin123).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-crea el admin aunque ya exista.',
        )

    def handle(self, *args, **options):
        # Guard: only run in development
        if settings.DJANGO_ENV != 'development':
            self.stderr.write(
                self.style.ERROR(
                    'Este comando solo puede ejecutarse en entorno development '
                    f'(DJANGO_ENV={settings.DJANGO_ENV}).'
                )
            )
            return

        username = 'admin'
        password = 'admin123'

        existing = User.objects.filter(user=username).first()

        if existing and not options['force']:
            self.stdout.write(
                self.style.WARNING(
                    f'El usuario "{username}" ya existe. '
                    'Usa --force para re-crearlo.'
                )
            )
            return

        if existing and options['force']:
            existing.delete()
            self.stdout.write(f'Usuario "{username}" eliminado.')

        User.objects.create_superuser(
            user=username,
            password=password,
            name='Admin',
            lastname='Cooffy',
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Usuario admin creado: {username} / {password}'
            )
        )
