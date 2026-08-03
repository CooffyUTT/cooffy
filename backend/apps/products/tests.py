from decimal import Decimal

from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.products.models import Category, Product
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
