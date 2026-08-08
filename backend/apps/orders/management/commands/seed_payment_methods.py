"""
Management command to seed the payment methods catalog for development.

Usage:
    python manage.py seed_payment_methods         # creates methods if they don't exist
    python manage.py seed_payment_methods --clear # deletes all methods and re-creates them
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from apps.orders.models import PaymentMethod

SEED_PAYMENT_METHODS = [
    {"id": 1, "name": "Efectivo", "is_digital": False},
    {"id": 2, "name": "Tarjeta", "is_digital": True},
]


class Command(BaseCommand):
    help = 'Siembra el catálogo de métodos de pago (Efectivo, Tarjeta) para desarrollo.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todos los métodos de pago antes de sembrar.',
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

        if options['clear']:
            deleted, _ = PaymentMethod.objects.all().delete()
            self.stdout.write(f'{deleted} método(s) de pago eliminado(s).\n')

        created = 0

        for item in SEED_PAYMENT_METHODS:
            method_obj, was_created = PaymentMethod.objects.get_or_create(
                pk=item['id'],
                defaults={'name': item['name'], 'is_digital': item['is_digital']},
            )

            if was_created:
                created += 1
                self.stdout.write(f'  + Método "{method_obj.name}"')
            else:
                self.stdout.write(f'  ~ Método "{method_obj.name}" ya existe.')

        self.stdout.write(
            self.style.SUCCESS(f'\n{created} método(s) de pago creado(s).')
        )
