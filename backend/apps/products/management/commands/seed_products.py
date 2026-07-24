"""
Management command to seed 10 demo products for development.

Usage:
    python manage.py seed_products          # creates products if they don't exist
    python manage.py seed_products --clear  # deletes all products and re-creates them
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from apps.products.models import Product

#TODO: implement upload photos and use that ones
SEED_PRODUCTS = [
    {
        "name": "Burrito de carne asada",
        "price": 55.00,
        "description": "Burrito grande con carne asada, frijoles, arroz, pico de gallo y guacamole.",
        "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
        "modifiers": ["sin cebolla", "sin cilantro", "extra queso", "salsa picante"],
        "max_per_order": 3,
    },
    {
        "name": "Burrito de frijoles con queso",
        "price": 45.00,
        "description": "Burrito vegetariano con frijoles refritos, queso derretido, arroz y verduras.",
        "image": "https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?w=400",
        "modifiers": ["sin crema", "extra queso", "con rajas", "salsa verde"],
        "max_per_order": 3,
    },
    {
        "name": "Sandwich de jamón y queso",
        "price": 40.00,
        "description": "Sandwich caliente con jamón de pavo, queso manchego, lechuga, jitomate y aderezo.",
        "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
        "modifiers": ["sin jitomate", "sin aderezo", "pan integral", "doble jamón"],
        "max_per_order": 4,
    },
    {
        "name": "Sandwich de pollo",
        "price": 48.00,
        "description": "Pechuga de pollo a la plancha con aguacate, lechuga, jitomate y mayonesa de chipotle.",
        "image": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400",
        "modifiers": ["sin aguacate", "sin chipotle", "pan integral", "doble pollo"],
        "max_per_order": 4,
    },
    {
        "name": "Agua embotellada 500ml",
        "price": 15.00,
        "description": "Botella de agua purificada de 500 ml.",
        "image": "https://images.unsplash.com/photo-1616118132534-381148898bb4?w=400",
        "modifiers": ["natural", "mineral"],
        "max_per_order": 10,
    },
    {
        "name": "Agua embotellada 1L",
        "price": 22.00,
        "description": "Botella de agua purificada de 1 litro.",
        "image": "https://images.unsplash.com/photo-1616118132534-381148898bb4?w=400",
        "modifiers": ["natural", "mineral"],
        "max_per_order": 8,
    },
    {
        "name": "Hamburguesa clásica",
        "price": 55.00,
        "description": "Carne de res 150g, lechuga, jitomate, cebolla, pepinillos y aderezo de la casa.",
        "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        "modifiers": ["sin cebolla", "sin pepinillos", "doble carne", "tocino extra"],
        "max_per_order": 3,
    },
    {
        "name": "Hamburguesa con queso",
        "price": 62.00,
        "description": "Carne de res 150g con doble queso americano, lechuga, jitomate y salsa especial.",
        "image": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400",
        "modifiers": ["sin jitomate", "doble carne", "tocino extra", "queso manchego"],
        "max_per_order": 3,
    },
    {
        "name": "Rebanada de pizza pepperoni",
        "price": 35.00,
        "description": "Rebanada grande de pizza con pepperoni, queso mozzarella y salsa de tomate artesanal.",
        "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
        "modifiers": ["orilla de queso", "sin pepperoni", "chile quebrado", "orégano extra"],
        "max_per_order": 5,
    },
    {
        "name": "Papas fritas",
        "price": 25.00,
        "description": "Bolsa de papas fritas. Elige tu favorita.",
        "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
        "modifiers": ["Sabritas original", "Cheetos", "Doritos"],
        "max_per_order": 6,
    },
]


class Command(BaseCommand):
    help = 'Siembra 10 productos de cafetería para desarrollo.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todos los productos antes de sembrar.',
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

        if options['clear']:
            deleted, _ = Product.objects.all().delete()
            self.stdout.write(f'{deleted} producto(s) eliminado(s).\n')

        created = 0
        skipped = 0

        for item in SEED_PRODUCTS:
            name = item['name']
            defaults = {
                'price': item['price'],
                'description': item.get('description'),
                'image': item.get('image'),
                'modifiers': item.get('modifiers'),
                'max_per_order': item.get('max_per_order'),
            }

            obj, was_created = Product.objects.get_or_create(
                name=name,
                defaults=defaults,
            )

            if was_created:
                created += 1
                self.stdout.write(f'  \u2714 {name}')
            else:
                skipped += 1
                self.stdout.write(f'  ~ {name} (ya existe)')

        self.stdout.write(
            self.style.SUCCESS(
                f'\n{created} producto(s) creado(s), {skipped} ya existían.'
            )
        )
