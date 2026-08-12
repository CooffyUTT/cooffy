from decimal import Decimal

from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APITestCase
from django.core.exceptions import ValidationError

from apps.branches.models import Branch, Company
from apps.products.models import Category, Product, ProductStock
from apps.schools.models import School
from apps.users.models import User


class ProductAvailabilityTests(APITestCase):
    """RF-06: unavailable products must not be orderable from the menu."""

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(user="client@example.com", name="Client", password="password")
        cls.manager = User.objects.create_user(user="manager@example.com", name="Manager", password="password")
        cls.manager.groups.add(Group.objects.create(name="gerente"))
        cls.category = Category.objects.create(name="Drinks")
        cls.active_product = Product.objects.create(
            name="Coffee",
            price=Decimal("50.00"),
            category=cls.category,
            max_per_order=2,
            active=True,
        )
        cls.inactive_product = Product.objects.create(
            name="Unavailable coffee",
            price=Decimal("55.00"),
            category=cls.category,
            max_per_order=2,
            active=False,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.user)

    def test_menu_excludes_inactive_products(self):
        response = self.client.get(reverse("product-menu-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data["results"]], [self.active_product.id])

    def test_product_limit_must_be_positive_or_unlimited(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.post(
            reverse("product-manage-list"),
            {
                "name": "Invalid product",
                "price": "20.00",
                "category": self.category.id,
                "max_per_order": 0,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("max_per_order", response.data)

    def test_menu_can_filter_products_by_category(self):
        other_category = Category.objects.create(name="Food")
        Product.objects.create(
            name="Sandwich",
            price=Decimal("70.00"),
            category=other_category,
            active=True,
        )

        response = self.client.get(
            reverse("product-menu-list"),
            {"category": other_category.id},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], "Sandwich")

    def test_menu_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(reverse("product-menu-list"))

        self.assertEqual(response.status_code, 401)

    def test_manager_can_toggle_product_availability(self):
        self.client.force_authenticate(user=self.manager)

        response = self.client.patch(
            reverse("product-manage-toggle-active", args=[self.active_product.id]),
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.active_product.refresh_from_db()
        self.assertFalse(self.active_product.active)

    def test_toggle_does_not_regenerate_image(self):
        """El toggle no debe reprocesar la imagen (bug: desaparecía hasta re-render)."""
        import base64

        from django.core.files.uploadedfile import SimpleUploadedFile

        # PNG real de 1x1 px (el save del modelo lo convierte a WEBP)
        png_1px = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        )
        product = Product.objects.create(
            name="Con imagen",
            price=Decimal("20.00"),
            category=self.category,
            image=SimpleUploadedFile("foto.png", png_1px, content_type="image/png"),
        )
        original_name = product.image.name

        self.client.force_authenticate(user=self.manager)
        response = self.client.patch(
            reverse("product-manage-toggle-active", args=[product.id]),
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        product.refresh_from_db()
        # La imagen no debe regenerarse: mismo nombre de archivo
        self.assertEqual(product.image.name, original_name)
        # La respuesta debe incluir la imagen
        self.assertTrue(response.data.get("image"))


class ProductStockTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = User.objects.create_user(
            user='stock-owner@example.com',
            name='Stock Owner',
            password='password',
        )
        cls.client_user = User.objects.create_user(
            user='stock-client@example.com',
            name='Stock Client',
            password='password',
        )
        cls.school = School.objects.create(
            full_name='Stock School',
            short_name='STOCK',
            admin=cls.owner,
        )
        cls.company = Company.objects.create(name='Stock Company', owner=cls.owner)
        cls.branch = Branch.objects.create(
            name='Stock Branch',
            company=cls.company,
            school=cls.school,
        )
        cls.product = Product.objects.create(name='Stock Product', price=Decimal('10.00'))

    def setUp(self):
        self.client.force_authenticate(user=self.client_user)

    def test_product_stock_supports_the_three_mvp_states(self):
        for stock_state in (-1, 0, 1):
            stock = ProductStock.objects.create(
                branch=self.branch,
                product=Product.objects.create(
                    name=f'Product {stock_state}',
                    price=Decimal('10.00'),
                ),
                stock=stock_state,
            )
            self.assertEqual(stock.stock, stock_state)

    def test_product_stock_rejects_values_outside_mvp_states(self):
        stock = ProductStock(
            branch=self.branch,
            product=self.product,
            stock=2,
        )

        with self.assertRaises(ValidationError):
            stock.full_clean()

    def test_menu_filters_products_by_branch(self):
        other_branch = Branch.objects.create(
            name='Other Stock Branch',
            company=self.company,
            school=self.school,
        )
        other_product = Product.objects.create(
            name='Other Branch Product',
            price=Decimal('12.00'),
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=self.product,
            stock=ProductStock.StockState.IN_STOCK,
        )
        ProductStock.objects.create(
            branch=other_branch,
            product=other_product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.get(
            reverse('product-menu-list'),
            {'branch': self.branch.id},
        )

        self.assertEqual(response.status_code, 200)
        ids = [item['id'] for item in response.data['results']]
        self.assertIn(self.product.id, ids)
        self.assertNotIn(other_product.id, ids)

    def test_menu_without_branch_returns_global_catalog(self):
        response = self.client.get(reverse('product-menu-list'))

        self.assertEqual(response.status_code, 200)
        ids = [item['id'] for item in response.data['results']]
        self.assertIn(self.product.id, ids)

    def test_menu_rejects_invalid_branch_param(self):
        response = self.client.get(
            reverse('product-menu-list'),
            {'branch': 'abc'},
        )

        self.assertEqual(response.status_code, 400)

    def test_menu_exposes_available_in_branches_per_product(self):
        ProductStock.objects.create(
            branch=self.branch,
            product=self.product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.get(reverse('product-menu-list'))

        self.assertEqual(response.status_code, 200)
        item = next(
            i for i in response.data['results'] if i['id'] == self.product.id
        )
        self.assertEqual(item['available_in_branches'], [self.branch.id])
        self.assertIsNone(item['branch_id'])

    def test_menu_exposes_branch_id_when_filtered_by_branch(self):
        other_branch = Branch.objects.create(
            name='Branch scope other',
            company=self.company,
            school=self.school,
        )
        in_scope = Product.objects.create(
            name='In scope product',
            price=Decimal('15.00'),
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=in_scope,
            stock=ProductStock.StockState.IN_STOCK,
        )
        ProductStock.objects.create(
            branch=other_branch,
            product=in_scope,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.get(
            reverse('product-menu-list'),
            {'branch': self.branch.id},
        )

        self.assertEqual(response.status_code, 200)
        item = next(i for i in response.data['results'] if i['id'] == in_scope.id)
        self.assertEqual(item['branch_id'], self.branch.id)
        self.assertCountEqual(
            item['available_in_branches'],
            [self.branch.id, other_branch.id],
        )

    def test_menu_excludes_out_of_stock_branches_from_available_in_branches(self):
        ProductStock.objects.create(
            branch=self.branch,
            product=self.product,
            stock=ProductStock.StockState.OUT_OF_STOCK,
        )

        response = self.client.get(reverse('product-menu-list'))

        self.assertEqual(response.status_code, 200)
        item = next(
            i for i in response.data['results'] if i['id'] == self.product.id
        )
        self.assertEqual(item['available_in_branches'], [])

    def test_menu_exposes_branch_id_on_product_detail(self):
        ProductStock.objects.create(
            branch=self.branch,
            product=self.product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.get(
            reverse('product-menu-detail', args=[self.product.id]),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['available_in_branches'], [self.branch.id])
        self.assertIsNone(response.data['branch_id'])


class ProductStockManageTests(APITestCase):
    """RF-06 / RN-23: el gerente gestiona ProductStock por sucursal."""

    @classmethod
    def setUpTestData(cls):
        cls.owner = User.objects.create_user(user='owner@example.com', name='Owner', password='password')
        cls.manager = User.objects.create_user(user='manager@example.com', name='Manager', password='password')
        cls.manager.groups.add(Group.objects.create(name='gerente'))
        cls.supervisor = User.objects.create_user(user='supervisor@example.com', name='Supervisor', password='password')
        cls.supervisor.groups.add(Group.objects.create(name='supervisor'))
        cls.client_user = User.objects.create_user(user='client@example.com', name='Client', password='password')
        cls.superuser = User.objects.create_superuser(user='admin@example.com', name='Admin', password='password')

        cls.other_owner = User.objects.create_user(user='other-owner@example.com', name='Other Owner', password='password')
        cls.other_school = School.objects.create(full_name='Other School', short_name='OTHER', admin=cls.other_owner)
        cls.other_company = Company.objects.create(name='Other Company', owner=cls.other_owner)
        cls.other_branch = Branch.objects.create(
            name='Other Branch',
            company=cls.other_company,
            school=cls.other_school,
            active=True,
        )

        cls.school = School.objects.create(full_name='Manage School', short_name='MGMT', admin=cls.owner)
        cls.company = Company.objects.create(name='Manage Company', owner=cls.manager)
        cls.branch = Branch.objects.create(
            name='Manage Branch',
            company=cls.company,
            school=cls.school,
            active=True,
        )
        cls.inactive_branch = Branch.objects.create(
            name='Inactive Branch',
            company=cls.company,
            school=cls.school,
            active=False,
        )

        cls.product = Product.objects.create(name='Manage Product', price=Decimal('10.00'))

    def setUp(self):
        self.client.force_authenticate(user=self.manager)

    def stock_url(self):
        return reverse('product-manage-stocks', args=[self.product.id])

    def test_manager_can_assign_product_to_branch(self):
        response = self.client.post(self.stock_url(), {'branch_id': self.branch.id}, format='json')

        self.assertEqual(response.status_code, 200)
        stock = ProductStock.objects.get(branch=self.branch, product=self.product)
        self.assertEqual(stock.stock, ProductStock.StockState.NOT_TRACKED)
        self.assertEqual(response.data['branch_stocks'], {self.branch.id: -1})

    def test_post_stock_upserts_existing_row(self):
        ProductStock.objects.create(
            branch=self.branch,
            product=self.product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.post(
            self.stock_url(),
            {'branch_id': self.branch.id, 'stock': ProductStock.StockState.OUT_OF_STOCK},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(ProductStock.objects.filter(branch=self.branch, product=self.product).count(), 1)
        stock = ProductStock.objects.get(branch=self.branch, product=self.product)
        self.assertEqual(stock.stock, ProductStock.StockState.OUT_OF_STOCK)
        self.assertEqual(response.data['branch_stocks'], {self.branch.id: 0})

    def test_manager_can_mark_product_available_and_out_of_stock(self):
        self.client.post(
            self.stock_url(),
            {'branch_id': self.branch.id, 'stock': ProductStock.StockState.OUT_OF_STOCK},
            format='json',
        )
        self.client.post(
            self.stock_url(),
            {'branch_id': self.branch.id, 'stock': ProductStock.StockState.IN_STOCK},
            format='json',
        )

        stock = ProductStock.objects.get(branch=self.branch, product=self.product)
        self.assertEqual(stock.stock, ProductStock.StockState.IN_STOCK)

    def test_stock_accepts_only_mvp_states(self):
        response = self.client.post(
            self.stock_url(),
            {'branch_id': self.branch.id, 'stock': 2},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('stock', response.data)
        self.assertFalse(ProductStock.objects.filter(branch=self.branch, product=self.product).exists())

    def test_post_requires_branch_id(self):
        response = self.client.post(self.stock_url(), {}, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('branch_id', response.data)

    def test_manager_cannot_assign_to_branch_of_another_company(self):
        response = self.client.post(
            self.stock_url(),
            {'branch_id': self.other_branch.id},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
        self.assertFalse(ProductStock.objects.filter(branch=self.other_branch, product=self.product).exists())

    def test_manager_cannot_assign_to_inactive_branch(self):
        response = self.client.post(
            self.stock_url(),
            {'branch_id': self.inactive_branch.id},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
        self.assertFalse(ProductStock.objects.filter(branch=self.inactive_branch, product=self.product).exists())

    def test_client_cannot_manage_stocks(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.post(
            self.stock_url(),
            {'branch_id': self.branch.id},
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(ProductStock.objects.filter(branch=self.branch, product=self.product).exists())

    def test_supervisor_cannot_manage_stocks(self):
        self.client.force_authenticate(user=self.supervisor)

        response = self.client.post(
            self.stock_url(),
            {'branch_id': self.branch.id},
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(ProductStock.objects.filter(branch=self.branch, product=self.product).exists())

    def test_superuser_can_manage_any_branch(self):
        self.client.force_authenticate(user=self.superuser)

        response = self.client.post(
            self.stock_url(),
            {'branch_id': self.other_branch.id, 'stock': ProductStock.StockState.IN_STOCK},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        stock = ProductStock.objects.get(branch=self.other_branch, product=self.product)
        self.assertEqual(stock.stock, ProductStock.StockState.IN_STOCK)

    def test_manager_can_remove_product_from_branch(self):
        ProductStock.objects.create(
            branch=self.branch,
            product=self.product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.delete(
            f"{self.stock_url()}?branch_id={self.branch.id}",
            format='json',
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(ProductStock.objects.filter(branch=self.branch, product=self.product).exists())

    def test_delete_requires_branch_id(self):
        response = self.client.delete(self.stock_url(), format='json')

        self.assertEqual(response.status_code, 400)

    def test_delete_missing_row_returns_404(self):
        response = self.client.delete(
            f"{self.stock_url()}?branch_id={self.branch.id}",
            format='json',
        )

        self.assertEqual(response.status_code, 404)

    def test_manage_list_exposes_branch_stocks_map(self):
        ProductStock.objects.create(
            branch=self.branch,
            product=self.product,
            stock=ProductStock.StockState.OUT_OF_STOCK,
        )

        response = self.client.get(reverse('product-manage-list'))

        self.assertEqual(response.status_code, 200)
        item = next(i for i in response.data['results'] if i['id'] == self.product.id)
        self.assertEqual(item['branch_stocks'], {self.branch.id: 0})
