"""
Management command to seed demo orders for development.

Usage:
    python manage.py seed_orders        # creates demo orders if none exist today
    python manage.py seed_orders --clear # deletes all orders and re-creates them
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from django.db.models import Max
from apps.orders.models import Order, OrderProduct
from apps.products.models import Product

SEED_ORDERS = [
    {
        "branch_id": 1,
        "client_id": 1,
        "payment_method": 1,
        "order_products": [
            {"item_id": 1, "quantity": 1},
        ],
    },
    {
        "branch_id": 1,
        "client_id": 2,
        "payment_method": 1,
        "order_products": [
            {"item_id": 1, "quantity": 1},
            {"item_id": 2, "quantity": 2},
        ],
    },
    {
        "branch_id": 1,
        "client_id": 3,
        "payment_method": 1,
        "state": "preparing",
        "order_products": [
            {"item_id": 3, "quantity": 2},
        ],
    },
    {
        "branch_id": 1,
        "client_id": 2,
        "payment_method": 1,
        "state": "ready",
        "order_products": [
            {"item_id": 3, "quantity": 1},
            {"item_id": 4, "quantity": 1},
        ],
    },
]


class Command(BaseCommand):
    help = 'Siembra órdenes de prueba para desarrollo.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todas las órdenes antes de sembrar.',
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

        today = timezone.now().date()

        if options['clear']:
            deleted_products, _ = OrderProduct.objects.all().delete()
            deleted_orders, _ = Order.objects.all().delete()
            self.stdout.write(
                f'{deleted_orders} orden(es) y {deleted_products} producto(s) de orden eliminados.\n'
            )
        elif Order.objects.filter(date=today).exists():
            self.stdout.write(
                self.style.WARNING(
                    f'ℹ Ya existen órdenes para hoy ({today}) (omitido). Usa --clear para re-crearlas.'
                )
            )
            return

        item_ids = {p['item_id'] for o in SEED_ORDERS for p in o['order_products']}
        products = Product.objects.in_bulk(item_ids)

        max_num = Order.objects.aggregate(max_num=Max('order_number'))['max_num'] or 0
        created = 0

        for order_data in SEED_ORDERS:
            max_num += 1
            order_products_data = order_data.pop('order_products')

            order = Order.objects.create(
                order_number=max_num,
                date=today,
                state=order_data.pop('state', 'pending'),
                **order_data,
            )

            order_products = []
            for p in order_products_data:
                product = products.get(p['item_id'])
                if not product:
                    self.stderr.write(
                        f'  [FAIL] Orden #{order.order_number}: producto {p["item_id"]} no existe (omitido).'
                    )
                    continue
                order_products.append(
                    OrderProduct(
                        order=order,
                        price=product.price * p['quantity'],
                        **p,
                    )
                )
            OrderProduct.objects.bulk_create(order_products)

            order.total = sum(op.price for op in order_products)
            order.save(update_fields=['total'])

            created += 1
            self.stdout.write(
                f'  [OK] Orden #{order.order_number} | cliente={order.client_id} '
                f'| estado={order.state} | total=${order.total}'
            )

        self.stdout.write(
            self.style.SUCCESS(f'\n{created} orden(es) creada(s) para hoy ({today}).')
        )
