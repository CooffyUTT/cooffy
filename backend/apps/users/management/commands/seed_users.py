"""
Management command to seed default users and groups for development testing.
 
Usage:
    python manage.py seed_users        # creates default groups and test users if not exist
    python manage.py seed_users --force  # re-creates users even if already exist
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from apps.users.models import User
from django.contrib.auth.models import Group


class Command(BaseCommand):
    help = 'Crea usuarios de prueba y grupos por defecto para desarrollo (gerente, empleado y cliente).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-crea los usuarios aunque ya existan.',
        )

    def handle(self, *args, **options):
        # Guard: only run in development
        if getattr(settings, 'DJANGO_ENV', 'development') != 'development':
            self.stderr.write(
                self.style.ERROR(
                    'Este comando solo puede ejecutarse en entorno desarrollo '
                    f'(DJANGO_ENV={getattr(settings, "DJANGO_ENV", "production")}).'
                )
            )
            return

        force = options['force']

        # ============================================================
        # 1. CREACIÓN DE GRUPOS
        # ============================================================
        self.stdout.write(self.style.MIGRATE_HEADING("--- Creando Grupos ---"))

        groups_config = ['gerente', 'cliente', 'empleado', 'admin_escolar']
        groups = {}

        for group_name in groups_config:
            group_obj, created = Group.objects.get_or_create(name=group_name)
            groups[group_name] = group_obj
            if created:
                self.stdout.write(self.style.SUCCESS(f"✔ Grupo '{group_name}' creado."))
            else:
                self.stdout.write(self.style.WARNING(f"ℹ Grupo '{group_name}' ya existe."))

        # ============================================================
        # 2. DEFINICIÓN DE USUARIOS DE PRUEBA
        # ============================================================
        self.stdout.write(self.style.MIGRATE_HEADING("\n--- Creando Usuarios de Prueba ---"))

        test_users = [
            {
                'username': 'admin',
                'password': 'admin123',
                'name': 'Admin',
                'lastname': 'Cooffy',
                'is_superuser': True,
                'groups': [groups['gerente']],
            },
            {
                'username': 'cocina1',
                'password': 'admin123',
                'name': 'Carlos',
                'lastname': 'Cocinero',
                'is_superuser': False,
                'groups': [groups['empleado']],
            },
            {
                'username': 'cliente1',
                'password': 'admin123',
                'name': 'Ana',
                'lastname': 'Cliente',
                'is_superuser': False,
                'groups': [groups['cliente']],
            },
            {
                'username': 'admin_escolar1',
                'password': 'admin123',
                'name': 'María',
                'lastname': 'Escolar',
                'is_superuser': False,
                'groups': [groups['admin_escolar']],
            },
        ]

        # ============================================================
        # 3. PROCESAMIENTO DE USUARIOS
        # ============================================================
        for user_data in test_users:
            username = user_data['username']
            password = user_data['password']
            existing = User.objects.filter(user=username).first()

            if existing:
                if force:
                    existing.delete()
                    self.stdout.write(self.style.WARNING(f'Usuario "{username}" eliminado por --force.'))
                else:
                    self.stdout.write(self.style.WARNING(f'ℹ Usuario "{username}" ya existe (omitido).'))
                    continue

            # Crear usuario según su rol
            if user_data['is_superuser']:
                user_obj = User.objects.create_superuser(
                    user=username,
                    password=password,
                    name=user_data['name'],
                    lastname=user_data['lastname'],
                )
            else:
                user_obj = User.objects.create_user(
                    user=username,
                    password=password,
                    name=user_data['name'],
                    lastname=user_data['lastname'],
                )

            # Asignar grupos
            user_obj.groups.set(user_data['groups'])

            self.stdout.write(
                self.style.SUCCESS(
                    f'✔ Usuario Creado: {username} | Pass: {password} | Rol: {[g.name for g in user_data["groups"]]}'
                )
            )

        self.stdout.write(self.style.MIGRATE_LABEL("\n¡Seed de desarrollo completado con éxito! 🎉"))
