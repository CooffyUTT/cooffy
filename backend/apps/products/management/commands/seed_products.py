"""
Management command to seed 10 demo products for development.

Usage:
    python manage.py seed_products          # creates products if they don't exist
    python manage.py seed_products --clear  # deletes all products and re-creates them
"""

import os
from urllib.parse import urlsplit

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.branches.models import Branch
from apps.products.models import Category, Product, ProductStock

SEED_CATEGORIES = [
    {"name": "Burritos"},
    {"name": "Sándwiches"},
    {"name": "Bebidas"},
    {"name": "Bebidas calientes"},
    {"name": "Hamburguesas"},
    {"name": "Snacks"},
    {"name": "Postres"},
]

SEED_PRODUCTS = [
    {
        "name": "Burrito de carne asada",
        "price": 55.00,
        "category": "Burritos",
        "description": "Burrito grande con carne asada, frijoles, arroz, pico de gallo y guacamole.",
        "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
        "modifiers": ["sin cebolla", "sin cilantro", "extra queso", "salsa picante"],
        "max_per_order": 3,
    },
    {
        "name": "Burrito de frijoles con queso",
        "price": 45.00,
        "category": "Burritos",
        "description": "Burrito vegetariano con frijoles refritos, queso derretido, arroz y verduras.",
        "image": "https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?w=400",
        "modifiers": ["sin crema", "extra queso", "con rajas", "salsa verde"],
        "max_per_order": 3,
    },
    {
        "name": "Sandwich de jamón y queso",
        "price": 40.00,
        "category": "Sándwiches",
        "description": "Sandwich caliente con jamón de pavo, queso manchego, lechuga, jitomate y aderezo.",
        "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
        "modifiers": ["sin jitomate", "sin aderezo", "pan integral", "doble jamón"],
        "max_per_order": 4,
    },
    {
        "name": "Sandwich de pollo",
        "price": 48.00,
        "category": "Sándwiches",
        "description": "Pechuga de pollo a la plancha con aguacate, lechuga, jitomate y mayonesa de chipotle.",
        "image": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400",
        "modifiers": ["sin aguacate", "sin chipotle", "pan integral", "doble pollo"],
        "max_per_order": 4,
    },
    {
        "name": "Agua embotellada 500ml",
        "price": 15.00,
        "category": "Bebidas",
        "description": "Botella de agua purificada de 500 ml.",
        "image": "https://images.unsplash.com/photo-1616118132534-381148898bb4?w=400",
        "modifiers": ["natural", "mineral"],
        "max_per_order": 10,
    },
    {
        "name": "Agua embotellada 1L",
        "price": 22.00,
        "category": "Bebidas",
        "description": "Botella de agua purificada de 1 litro.",
        "image": "https://images.unsplash.com/photo-1616118132534-381148898bb4?w=400",
        "modifiers": ["natural", "mineral"],
        "max_per_order": 8,
    },
    {
        "name": "Hamburguesa clásica",
        "price": 55.00,
        "category": "Hamburguesas",
        "description": "Carne de res 150g, lechuga, jitomate, cebolla, pepinillos y aderezo de la casa.",
        "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        "modifiers": ["sin cebolla", "sin pepinillos", "doble carne", "tocino extra"],
        "max_per_order": 3,
    },
    {
        "name": "Hamburguesa con queso",
        "price": 62.00,
        "category": "Hamburguesas",
        "description": "Carne de res 150g con doble queso americano, lechuga, jitomate y salsa especial.",
        "image": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400",
        "modifiers": ["sin jitomate", "doble carne", "tocino extra", "queso manchego"],
        "max_per_order": 3,
    },
    {
        "name": "Rebanada de pizza pepperoni",
        "price": 35.00,
        "category": "Snacks",
        "description": "Rebanada grande de pizza con pepperoni, queso mozzarella y salsa de tomate artesanal.",
        "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
        "modifiers": ["orilla de queso", "sin pepperoni", "chile quebrado", "orégano extra"],
        "max_per_order": 5,
    },
    {
        "name": "Papas fritas",
        "price": 25.00,
        "category": "Snacks",
        "description": "Bolsa de papas fritas. Elige tu favorita.",
        "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
        "modifiers": ["Sabritas original", "Cheetos", "Doritos"],
        "max_per_order": 6,
    },
    {
        "name": "Café americano",
        "price": 25.00,
        "category": "Bebidas calientes",
        "description": "Café de grano recién preparado, aroma y cuerpo equilibrados.",
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
        "modifiers": ["sin azúcar", "con azúcar", "canela", "miel"],
        "max_per_order": 5,
    },
    {
        "name": "Café con leche",
        "price": 30.00,
        "category": "Bebidas calientes",
        "description": "Café de grano con leche al vapor y una capa de espuma.",
        "image": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400",
        "modifiers": ["sin azúcar", "leche deslactosada", "leche de almendra", "extra espuma"],
        "max_per_order": 5,
    },
    {
        "name": "Capuchino",
        "price": 35.00,
        "category": "Bebidas calientes",
        "description": "Espresso con leche al vapor y espuma, espolvoreado con canela.",
        "image": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
        "modifiers": ["sin canela", "con chocolate", "doble espresso", "leche de almendra"],
        "max_per_order": 5,
    },
    {
        "name": "Té helado",
        "price": 20.00,
        "category": "Bebidas",
        "description": "Té frío de jamaica o limón con hielo. Refrescante.",
        "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
        "modifiers": ["jamaica", "limón", "sin azúcar", "con hielo extra"],
        "max_per_order": 6,
    },
    {
        "name": "Jugo de naranja",
        "price": 28.00,
        "category": "Bebidas",
        "description": "Jugo natural de naranja recién exprimido, 300 ml.",
        "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
        "modifiers": ["sin hielo", "con hielo", "natural", "con pulpa"],
        "max_per_order": 4,
    },
    {
        "name": "Refresco 355ml",
        "price": 18.00,
        "category": "Bebidas",
        "description": "Refresco embotellado frío. Elige tu sabor favorito.",
        "image": "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400",
        "modifiers": ["Cola", "Manzanita", "Naranja", "Toronja"],
        "max_per_order": 6,
    },
    {
        "name": "Donas",
        "price": 15.00,
        "category": "Postres",
        "description": "Dona glaseada suave y esponjosa. Ideal para acompañar tu café.",
        "image": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
        "modifiers": ["glaseado", "chocolate", "canela y azúcar", "rellena de fresa"],
        "max_per_order": 6,
    },
    {
        "name": "Galletas",
        "price": 10.00,
        "category": "Postres",
        "description": "Galletas recién horneadas. Elige la variedad.",
        "image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
        "modifiers": ["chispas de chocolate", "avena con pasas", "mantequilla"],
        "max_per_order": 6,
    },
    {
        "name": "Pastel de chocolate",
        "price": 45.00,
        "category": "Postres",
        "description": "Rebanada de pastel de chocolate húmedo con frosting.",
        "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        "modifiers": ["sin frosting", "con nuez", "porción doble"],
        "max_per_order": 3,
    },
    {
        "name": "Quesadilla",
        "price": 30.00,
        "category": "Snacks",
        "description": "Tortilla de harina con queso derretido a la plancha.",
        "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
        "modifiers": ["con salsa", "sin salsa", "con frijoles", "doble queso"],
        "max_per_order": 4,
    },
    {
        "name": "Hot dog",
        "price": 32.00,
        "category": "Snacks",
        "description": "Pan suave con salchicha, cebolla, salsa y papitas al gusto.",
        "image": "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400",
        "modifiers": ["con tocino", "sin cebolla", "salsa especial", "extra papitas"],
        "max_per_order": 4,
    },
]


def download_image(image_url, timeout=15):
    response = requests.get(image_url, timeout=timeout)
    response.raise_for_status()
    filename = os.path.basename(urlsplit(image_url).path) or 'image'
    if '.' not in filename:
        filename = f'{filename}.jpg'
    return filename, ContentFile(response.content)


class Command(BaseCommand):
    help = 'Siembra 10 productos de cafetería para desarrollo.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todos los productos antes de sembrar.',
        )
        parser.add_argument(
            '--allow-non-dev',
            action='store_true',
            help='Permite ejecutar el seed fuera del entorno development (ej. demo en producción).',
        )

    def handle(self, *args, **options):
        if settings.DJANGO_ENV != 'development' and not options.get('allow_non_dev'):
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

        # Crear categorías
        categories = {}
        for cat_data in SEED_CATEGORIES:
            cat, _ = Category.objects.get_or_create(name=cat_data['name'])
            categories[cat.name] = cat
        self.stdout.write(f'{len(categories)} categoría(s) creada(s).')

        created = 0
        skipped = 0

        for item in SEED_PRODUCTS:
            name = item['name']
            image_url = item.get('image')
            image_file = None

            if image_url:
                try:
                    filename, content = download_image(image_url)
                    image_file = (filename, content)
                except requests.RequestException as e:
                    self.stderr.write(f'  [FAIL] {name}: falló descarga de imagen ({e})')

            defaults = {
                'price': item['price'],
                'category': categories.get(item.get('category')),
                'description': item.get('description'),
                'modifiers': item.get('modifiers'),
                'max_per_order': item.get('max_per_order'),
            }

            obj, was_created = Product.objects.get_or_create(
                name=name,
                defaults=defaults,
            )

            if was_created or not obj.image:
                if image_file:
                    obj.image.save(*image_file)
                    if not was_created:
                        obj.save(update_fields=['image'])
                elif was_created and image_url:
                    obj.image = image_url
                    obj.save(update_fields=['image'])

            if was_created:
                created += 1
                self.stdout.write(f'  [OK] {name}')
            else:
                if image_file:
                    self.stdout.write(f'  [UPDATE] {name} (imagen actualizada)')
                else:
                    skipped += 1
                    self.stdout.write(f'  [SKIP] {name} (ya existe)')

        self.stdout.write(
            self.style.SUCCESS(
                f'\n{created} producto(s) creado(s), {skipped} ya existían.'
            )
        )

        # Vincular 4-8 productos por sucursal activa (estado por defecto:
        # sin stock activado). El control de inventario se gestionará después.
        # Las sucursales de una misma empresa comparten un núcleo de productos;
        # entre empresas distintas se evita la repetición mientras el pool alcance.
        products = list(Product.objects.order_by('id'))
        branches_by_company = {}
        for branch in Branch.objects.filter(active=True).order_by('company_id', 'id'):
            branches_by_company.setdefault(branch.company_id, []).append(branch)

        if not branches_by_company:
            self.stdout.write(self.style.WARNING('No hay sucursales activas; no se crearon vínculos de stock.'))
            return

        target = 6
        shared = 3
        cursor = 0
        total_created = 0

        for company_id in sorted(branches_by_company):
            branches = branches_by_company[company_id]
            window = target + (len(branches) - 1) * shared
            company_start = cursor
            for offset, branch in enumerate(branches):
                start = company_start + offset * shared
                picks = products[start:start + target]
                if len(picks) < target:
                    picks = (products[start:] + products[:target - len(picks)])
                ProductStock.objects.filter(branch=branch).delete()
                ProductStock.objects.bulk_create(
                    ProductStock(
                        branch=branch,
                        product=product,
                        stock=ProductStock.StockState.NOT_TRACKED,
                    )
                    for product in picks
                )
                total_created += len(picks)
                self.stdout.write(
                    f'    {branch.name}: {len(picks)} producto(s)'
                )
            cursor += window

        self.stdout.write(
            self.style.SUCCESS(
                f'\n{total_created} vínculo(s) producto-sucursal creado(s) '
                f'para {sum(len(b) for b in branches_by_company.values())} sucursal(es).'
            )
        )
