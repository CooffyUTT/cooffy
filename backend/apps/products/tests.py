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
