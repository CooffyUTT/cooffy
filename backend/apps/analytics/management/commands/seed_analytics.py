"""
Management command to seed analytics demo orders for development.

Generates realistic orders spread over the last period so every dashboard
endpoint returns meaningful data (daily summary, top products, orders by
hour, sales series and operation times).

The range is driven by the `--period` flag, mirroring the analytics API:

    daily        -> today
    weekly       -> last 7 days
    monthly      -> last 30 days      (default)
    four_monthly -> last 120 days
    semesterly   -> last 180 days

Usage:
    python manage.py seed_analytics              # monthly (30 days)
    python manage.py seed_analytics --period semesterly
    python manage.py seed_analytics --clear --period four_monthly
"""

import random
from datetime import time, timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db.models import Max
from django.utils import timezone

from apps.analytics.views import PERIOD_DAYS
from apps.branches.models import Branch
from apps.orders.models import Order, OrderProduct
from apps.products.models import Product
from apps.users.models import User

ORDERS_PER_DAY_RANGE = (3, 5)
ITEMS_PER_ORDER_RANGE = (1, 3)
MAX_QUANTITY_PER_ITEM = 2

# Umbral de idempotencia: se omite si ya hay al menos el 40% de las
# órdenes esperadas en la ventana (promedio de 4 órdenes/día), evitando
# duplicar el seed sin necesidad de --clear.
IDEMPOTENCY_FRACTION = 0.4
EXPECTED_ORDERS_PER_DAY = sum(ORDERS_PER_DAY_RANGE) / len(ORDERS_PER_DAY_RANGE)

# Pesos para dar popularidad a algunos productos (afecta el top de productos).
# Se aplican por nombre para no depender de IDs fijos en la base de datos.
PRODUCT_NAME_WEIGHTS = {
    'Burrito de carne asada': 5,
    'Burrito de frijoles con queso': 3,
    'Sandwich de jamón y queso': 4,
    'Sandwich de pollo': 2,
    'Agua embotellada 500ml': 3,
    'Agua embotellada 1L': 2,
    'Hamburguesa clásica': 4,
    'Hamburguesa con queso': 2,
    'Rebanada de pizza pepperoni': 3,
    'Papas fritas': 4,
}

# Pesos por hora: picos de demanda en desayuno (8-10) y comida (13-15).
HOUR_WEIGHTS = {
    7: 1, 8: 4, 9: 5, 10: 3, 11: 2, 12: 3,
    13: 4, 14: 5, 15: 3, 16: 2, 17: 1, 18: 1,
}


def _weighted_choice(weights):
    total = sum(weights.values())
    roll = random.randint(1, total)
    upto = 0
    for key, weight in weights.items():
        upto += weight
        if roll <= upto:
            return key
    return next(iter(weights))


class Command(BaseCommand):
    help = 'Siembra órdenes analíticas para desarrollo según un período (daily, weekly, monthly, four_monthly, semesterly).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--period',
            default='monthly',
            choices=list(PERIOD_DAYS.keys()),
            help='Rango de tiempo a sembrar. Default: monthly (30 días).',
        )
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

        branches = list(
            Branch.objects.filter(active=True).values_list('id', flat=True)
        )
        if not branches:
            self.stderr.write(
                self.style.ERROR('No hay sucursales activas. Ejecuta seed_branches primero.')
            )
            return

        products = list(
            Product.objects.filter(active=True).values('id', 'price', 'name')
        )
        if not products:
            self.stderr.write(
                self.style.ERROR('No hay productos activos. Ejecuta seed_products primero.')
            )
            return

        product_weights = {
            p['id']: PRODUCT_NAME_WEIGHTS.get(p['name'], 1)
            for p in products
        }

        client_ids = list(
            User.objects.filter(groups__name='cliente').values_list('id', flat=True)
        )
        if not client_ids:
            self.stderr.write(
                self.style.ERROR('No hay clientes. Ejecuta seed_users primero.')
            )
            return

        today = timezone.now().date()
        period = options['period']
        days_back = PERIOD_DAYS[period]
        # Ventana móvil e inclusiva de hoy (mismo criterio que la API).
        window_start = today - timedelta(days=days_back - 1)
        existing_in_window = Order.objects.filter(date__gte=window_start).count()

        expected_orders = int(EXPECTED_ORDERS_PER_DAY * days_back)
        min_orders_in_window = max(1, int(expected_orders * IDEMPOTENCY_FRACTION))

        if options['clear']:
            deleted_products, _ = OrderProduct.objects.all().delete()
            deleted_orders, _ = Order.objects.all().delete()
            self.stdout.write(
                f'{deleted_orders} orden(es) y {deleted_products} producto(s) de orden eliminados.\n'
            )
        elif existing_in_window >= min_orders_in_window:
            self.stdout.write(
                self.style.WARNING(
                    f'ℹ Ya existen {existing_in_window} órdenes en los últimos {days_back} días '
                    f'({period}, omitido). Usa --clear para re-crearlas.'
                )
            )
            return

        price_map = {p['id']: p['price'] for p in products}
        max_num = Order.objects.aggregate(max_num=Max('order_number'))['max_num'] or 0
        created = 0

        for day_offset in range(days_back - 1, -1, -1):
            order_date = today - timedelta(days=day_offset)
            orders_today = random.randint(*ORDERS_PER_DAY_RANGE)

            for _ in range(orders_today):
                max_num += 1
                hour = _weighted_choice(HOUR_WEIGHTS)
                minute = random.randint(0, 59)
                created_at = timezone.make_aware(
                    timezone.datetime.combine(order_date, time(hour=hour, minute=minute))
                )

                prep_minutes = random.randint(1, 8)
                prepared_at = created_at + timedelta(minutes=prep_minutes)

                roll = random.random()
                if roll < 0.55:
                    state = 'ready'
                    picked_up_at = prepared_at + timedelta(
                        minutes=random.randint(1, 12)
                    )
                    payment_status = 'paid'
                elif roll < 0.75:
                    state = 'preparing'
                    picked_up_at = None
                    payment_status = random.choice(['pending', 'paid'])
                else:
                    state = 'pending'
                    prepared_at = None
                    picked_up_at = None
                    payment_status = 'pending'

                item_ids = [
                    _weighted_choice(product_weights)
                    for _ in range(random.randint(*ITEMS_PER_ORDER_RANGE))
                ]
                line_items = [
                    {'item_id': item_id, 'quantity': random.randint(1, MAX_QUANTITY_PER_ITEM)}
                    for item_id in item_ids
                ]

                order = Order.objects.create(
                    order_number=max_num,
                    date=order_date,
                    branch_id=random.choice(branches),
                    client_id=random.choice(client_ids),
                    created_at=created_at,
                    prepared_at=prepared_at,
                    picked_up_at=picked_up_at,
                    total=0,
                    state=state,
                    payment_method=random.randint(1, 2),
                    payment_status=payment_status,
                )

                order_products = []
                for item in line_items:
                    order_products.append(
                        OrderProduct(
                            order=order,
                            item_id=item['item_id'],
                            quantity=item['quantity'],
                            price=price_map[item['item_id']] * item['quantity'],
                        )
                    )
                OrderProduct.objects.bulk_create(order_products)

                order.total = sum(op.price for op in order_products)
                order.created_at = created_at
                order.save(update_fields=['total', 'created_at'])

                created += 1

            self.stdout.write(
                f'  [OK] {order_date} | {orders_today} órdenes '
                f'(última #{order.order_number})'
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n{created} órden(es) analítica(s) creada(s) en los últimos {days_back} días '
                f'({period}).'
            )
        )
