from decimal import Decimal

from django.urls import reverse
from rest_framework.test import APITestCase

from apps.orders.models import Order, OrderProduct
from apps.products.models import Category, Product
from apps.users.models import User


class OrderBusinessRuleRegressionTests(APITestCase):
    """Specification-derived regressions for behavior not enforced yet.

    This module is intentionally outside Django's default ``test*.py``
    discovery pattern. Run it explicitly while implementing the missing rules:
    ``pnpm back:manage test apps.orders.pending_tests --noinput``.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            user="pending-rules@school.edu.mx",
            name="Pending Rules Client",
            password="password",
        )
        category = Category.objects.create(name="Pending rules")
        cls.available_product = Product.objects.create(
            name="Available product",
            price=Decimal("10.00"),
            category=category,
            active=True,
            max_per_order=2,
        )
        cls.unavailable_product = Product.objects.create(
            name="Unavailable product",
            price=Decimal("10.00"),
            category=category,
            active=False,
            max_per_order=2,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.user)

    def create_order(self):
        return Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=1,
            client_id=self.user.id,
            payment_method=1,
        )

    def test_unavailable_product_cannot_be_added_to_an_order(self):
        """RF-06 / RN-08: disabled products cannot enter new orders."""
        order = self.create_order()

        response = self.client.post(
            reverse("orders-add-product", args=[order.id]),
            {
                "item_id": self.unavailable_product.id,
                "quantity": 1,
            },
            format="json",
        )

        self.assertNotEqual(response.status_code, 201)
        self.assertEqual(OrderProduct.objects.filter(order=order).count(), 0)

    def test_product_quantity_cannot_exceed_its_per_order_limit(self):
        """RF-06/RF-09 / RN-12: a product limit applies to a new order."""
        order = self.create_order()

        response = self.client.post(
            reverse("orders-add-product", args=[order.id]),
            {
                "item_id": self.available_product.id,
                "quantity": 3,
            },
            format="json",
        )

        self.assertNotEqual(response.status_code, 201)
        self.assertEqual(OrderProduct.objects.filter(order=order).count(), 0)

    def test_client_cannot_create_two_active_orders_for_the_same_branch(self):
        """RF-10 / RN-04: one active order per client and branch."""
        self.create_order()

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": 1,
                "client_id": self.user.id,
                "payment_method": 1,
                "order_products": [
                    {
                        "item_id": self.available_product.id,
                        "quantity": 1,
                        "price": "10.00",
                    }
                ],
            },
            format="json",
        )

        self.assertNotEqual(response.status_code, 201)
        self.assertEqual(
            Order.objects.filter(client_id=self.user.id, branch_id=1).count(),
            1,
        )

    def test_unavailable_product_cannot_be_used_when_creating_an_order(self):
        """RF-10 / RN-08: creation validates product availability."""
        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": 1,
                "client_id": self.user.id,
                "payment_method": 1,
                "order_products": [
                    {
                        "item_id": self.unavailable_product.id,
                        "quantity": 1,
                        "price": "10.00",
                    }
                ],
            },
            format="json",
        )

        self.assertNotEqual(response.status_code, 201)
        self.assertFalse(Order.objects.filter(client_id=self.user.id).exists())

    def test_order_creation_cannot_exceed_product_limit(self):
        """RF-10 / RN-12: creation validates the per-order product limit."""
        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": 1,
                "client_id": self.user.id,
                "payment_method": 1,
                "order_products": [
                    {
                        "item_id": self.available_product.id,
                        "quantity": 3,
                        "price": "10.00",
                    }
                ],
            },
            format="json",
        )

        self.assertNotEqual(response.status_code, 201)
        self.assertFalse(Order.objects.filter(client_id=self.user.id).exists())

    def test_confirmed_order_cannot_be_modified(self):
        """RF-10 / RN-05: confirmation makes an order immutable."""
        order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=1,
            client_id=self.user.id,
            payment_method=1,
            state="confirmed",
            comment="Original comment",
        )

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"comment": "Changed comment"},
            format="json",
        )

        self.assertNotEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.comment, "Original comment")
