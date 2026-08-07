from decimal import Decimal

from django.urls import reverse
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company
from apps.orders.models import Order, OrderProduct
from apps.schools.models import School
from apps.users.models import User


class OrderApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.client_user = User.objects.create_user(
            user="client-one@school.edu.mx",
            name="Client One",
            password="password",
        )
        cls.other_user = User.objects.create_user(
            user="client-two@school.edu.mx",
            name="Client Two",
            password="password",
        )
        school = School.objects.create(
            full_name="Test School",
            short_name="TEST",
        )
        company = Company.objects.create(
            name="Test Company",
            owner=cls.client_user,
        )
        Branch.objects.create(
            id=1,
            name="Test Branch",
            company=company,
            school=school,
            active=True,
            accepting_orders=True,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.client_user)

    def test_order_requires_at_least_one_product(self):
        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": 1,
                "client_id": self.client_user.id,
                "payment_method": "cash",
                "order_products": [],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("order_products", response.data)

    def test_client_can_create_order_and_total_is_persisted(self):
        from apps.products.models import Product
        Product.objects.create(id=10, name="P10", price=Decimal("10.00"))
        Product.objects.create(id=11, name="P11", price=Decimal("20.00"))

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": 1,
                "client_id": self.client_user.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": 10, "quantity": 1, "price": "30.00"},
                    {"item_id": 11, "quantity": 2, "price": "20.00"},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(client_id=self.client_user.id)
        self.assertEqual(order.order_number, 1)
        self.assertEqual(order.total, Decimal("50.00"))
        self.assertEqual(order.order_products.count(), 2)
        self.assertEqual(response.data["iva"], "3.70")

    def test_client_can_add_product_and_total_is_updated(self):
        from apps.products.models import Product
        Product.objects.create(id=10, name="P10", price=Decimal("12.50"))

        order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=1,
            client_id=self.client_user.id,
            payment_method=1,
        )

        response = self.client.post(
            reverse("orders-add-product", args=[order.id]),
            {"item_id": 10, "quantity": 2, "price": "12.50"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        order.refresh_from_db()
        self.assertEqual(order.total, Decimal("25.00"))
        self.assertEqual(response.data["iva"], "1.85")
        self.assertEqual(
            OrderProduct.objects.get(order=order).quantity,
            2,
        )

    def test_client_only_lists_their_own_orders(self):
        own_order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=1,
            client_id=self.client_user.id,
            payment_method=1,
        )
        Order.objects.create(
            order_number=2,
            date="2026-01-01",
            branch_id=1,
            client_id=self.other_user.id,
            payment_method=1,
        )

        response = self.client.get(reverse("orders-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [own_order.id])

    def test_client_cannot_retrieve_another_clients_order(self):
        other_order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=1,
            client_id=self.other_user.id,
            payment_method=1,
        )

        response = self.client.get(
            reverse("orders-detail", args=[other_order.id]),
        )

        self.assertEqual(response.status_code, 404)

    def test_order_endpoints_require_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(reverse("orders-list"))

        self.assertEqual(response.status_code, 401)
