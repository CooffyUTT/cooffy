from decimal import Decimal

from django.urls import reverse
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company
from apps.orders.models import Order, OrderProduct
from apps.products.models import Product, ProductStock
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
        cls.branch = Branch.objects.create(
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
                "branch_id": self.branch.id,
                "client_id": self.client_user.id,
                "payment_method": "cash",
                "order_products": [],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("order_products", response.data)

    def test_client_can_create_order_and_total_is_persisted(self):
        product_10 = Product.objects.create(
            id=10, name="P10", price=Decimal("10.00")
        )
        product_11 = Product.objects.create(
            id=11, name="P11", price=Decimal("20.00")
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product_10,
            stock=ProductStock.StockState.IN_STOCK,
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product_11,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
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
        product_10 = Product.objects.create(
            id=10, name="P10", price=Decimal("12.50")
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product_10,
            stock=ProductStock.StockState.IN_STOCK,
        )

        order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=self.branch.id,
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

    def test_my_orders_returns_only_client_orders(self):
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

        response = self.client.get(reverse("orders-my-orders"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], own_order.id)

    def test_my_orders_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(reverse("orders-my-orders"))

        self.assertEqual(response.status_code, 401)

    def test_estimated_completion_minutes_in_order_detail(self):
        order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=1,
            client_id=self.client_user.id,
            payment_method=1,
            state=Order.State.PENDING,
        )

        response = self.client.get(reverse("orders-detail", args=[order.id]))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estimated_completion_minutes"], 15)

    def test_inactive_product_error_includes_product_name(self):
        inactive = Product.objects.create(
            id=50, name="Café con Leche", price=Decimal("35.00"), active=False
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=inactive,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": inactive.id, "quantity": 1},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        error = str(response.data)
        self.assertIn("Café con Leche", error)
        self.assertIn("inactivos", error)

    def test_max_per_order_exceeded_error_message(self):
        product = Product.objects.create(
            id=60, name="Burrito", price=Decimal("45.00"), max_per_order=2
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": product.id, "quantity": 5},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        error = str(response.data)
        self.assertIn("Burrito", error)
        self.assertIn("límite", error)
        self.assertIn("2", error)
        self.assertIn("5", error)

    def test_branch_not_accepting_orders_error_message(self):
        school = School.objects.create(
            full_name="Closed School", short_name="CLSD"
        )
        company = Company.objects.create(
            name="Closed Co", owner=self.client_user
        )
        closed_branch = Branch.objects.create(
            name="Cerrada",
            company=company,
            school=school,
            active=True,
            accepting_orders=False,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": closed_branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": 999, "quantity": 1},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        error = str(response.data)
        self.assertIn("aceptando pedidos", error)

    def test_active_order_exists_error_message(self):
        product = Product.objects.create(
            id=70, name="Donas", price=Decimal("15.00")
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=self.branch.id,
            client_id=self.client_user.id,
            payment_method="cash",
            state=Order.State.PENDING,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": product.id, "quantity": 1},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        error = str(response.data)
        self.assertIn("pedido activo", error)

    def test_unavailable_product_error_includes_product_name_and_reason(self):
        product = Product.objects.create(
            id=80, name="Ensalada", price=Decimal("40.00")
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product,
            stock=ProductStock.StockState.OUT_OF_STOCK,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": product.id, "quantity": 1},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("order_products", response.data)
        order_product_errors = response.data["order_products"]
        self.assertEqual(len(order_product_errors), 1)
        err = order_product_errors[0]
        self.assertEqual(err["name"], "Ensalada")
        self.assertEqual(err["reason"], "out_of_stock")
        self.assertEqual(err["item_id"], str(product.id))
        self.assertIn("agotado", err["message"])

    def test_product_with_stock_only_in_another_branch_is_rejected(self):
        other_branch = Branch.objects.create(
            name="Other Branch",
            company=self.branch.company,
            school=self.branch.school,
            active=True,
            accepting_orders=True,
        )
        product = Product.objects.create(
            id=90, name="Sandwich", price=Decimal("30.00")
        )
        ProductStock.objects.create(
            branch=other_branch,
            product=product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": product.id, "quantity": 1},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        order_product_errors = response.data["order_products"]
        self.assertEqual(len(order_product_errors), 1)
        err = order_product_errors[0]
        self.assertEqual(err["name"], "Sandwich")
        self.assertEqual(err["reason"], "not_offered")
        self.assertEqual(err["item_id"], str(product.id))
        self.assertIn("no pertenece a esta sucursal", err["message"])

    def test_product_with_stock_in_branch_can_be_ordered(self):
        product = Product.objects.create(
            id=91, name="Torta", price=Decimal("40.00")
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": product.id, "quantity": 1},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(client_id=self.client_user.id)
        self.assertEqual(order.total, Decimal("40.00"))

    def test_product_not_tracked_can_be_ordered(self):
        product = Product.objects.create(
            id=92, name="Galletas", price=Decimal("10.00")
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product,
            stock=ProductStock.StockState.NOT_TRACKED,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": product.id, "quantity": 1},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(client_id=self.client_user.id)
        self.assertEqual(order.total, Decimal("10.00"))
