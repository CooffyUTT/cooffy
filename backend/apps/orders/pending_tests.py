from decimal import Decimal

from django.urls import reverse
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company
from apps.orders.models import Order, OrderProduct
from apps.products.models import Category, Product, ProductStock
from apps.schools.models import School
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

    def test_rejected_order_cannot_be_accepted_again(self):
        """RF-07 / RN-14: rejection is a terminal decision."""
        order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=1,
            client_id=self.user.id,
            payment_method=1,
            state="rejected",
        )

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"state": "accepted"},
            format="json",
        )

        self.assertNotEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.state, "rejected")

    def test_delivered_order_cannot_change_state(self):
        """RF-07 / RN-15: delivered orders are immutable."""
        order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=1,
            client_id=self.user.id,
            payment_method=1,
            state="delivered",
        )

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"state": "preparing"},
            format="json",
        )

        self.assertNotEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.state, "delivered")


class OrderBranchScopeRegressionTests(APITestCase):
    """RN-13: every item in an order must be offered by the order's branch.

    A product is considered offered by a branch when there is a
    ``ProductStock(branch_id, product_id)`` row with ``stock != OUT_OF_STOCK``.
    Orders and ``add-product`` actions that violate this rule must be
    rejected with 4xx and must not persist any line.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            user="branch-scope@school.edu.mx",
            name="Branch Scope Client",
            password="password",
        )
        cls.school = School.objects.create(
            full_name="Branch Scope School",
            short_name="BSS",
            admin=cls.user,
        )
        cls.company = Company.objects.create(
            name="Branch Scope Co", owner=cls.user
        )
        cls.branch_a = Branch.objects.create(
            name="Branch A",
            company=cls.company,
            school=cls.school,
            accepting_orders=True,
        )
        cls.branch_b = Branch.objects.create(
            name="Branch B",
            company=cls.company,
            school=cls.school,
            accepting_orders=True,
        )

        category = Category.objects.create(name="Scope")
        cls.product_only_in_b = Product.objects.create(
            name="Only in B",
            price=Decimal("10.00"),
            category=category,
            active=True,
        )
        cls.product_a_in_stock = Product.objects.create(
            name="A in stock",
            price=Decimal("10.00"),
            category=category,
            active=True,
        )
        cls.product_a_out_of_stock = Product.objects.create(
            name="A out of stock",
            price=Decimal("10.00"),
            category=category,
            active=True,
        )
        cls.product_a_not_tracked = Product.objects.create(
            name="A not tracked",
            price=Decimal("10.00"),
            category=category,
            active=True,
        )

        ProductStock.objects.create(
            branch=cls.branch_b,
            product=cls.product_only_in_b,
            stock=ProductStock.StockState.IN_STOCK,
        )
        ProductStock.objects.create(
            branch=cls.branch_a,
            product=cls.product_a_in_stock,
            stock=ProductStock.StockState.IN_STOCK,
        )
        ProductStock.objects.create(
            branch=cls.branch_a,
            product=cls.product_a_out_of_stock,
            stock=ProductStock.StockState.OUT_OF_STOCK,
        )
        ProductStock.objects.create(
            branch=cls.branch_a,
            product=cls.product_a_not_tracked,
            stock=ProductStock.StockState.NOT_TRACKED,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.user)

    def _create_payload(self, branch_id, products):
        return {
            "branch_id": branch_id,
            "payment_method": 1,
            "order_products": [
                {"item_id": pid, "quantity": 1} for pid in products
            ],
        }

    def test_order_creation_succeeds_when_all_products_offered_and_in_stock(self):
        """Happy path: every product is in stock at the chosen branch."""
        response = self.client.post(
            reverse("orders-list"),
            self._create_payload(
                self.branch_a.id, [self.product_a_in_stock.id]
            ),
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Order.objects.filter(client_id=self.user.id).count(), 1
        )

    def test_order_creation_succeeds_when_product_stock_is_not_tracked(self):
        """``NOT_TRACKED`` products are orderable (no inventory gate)."""
        response = self.client.post(
            reverse("orders-list"),
            self._create_payload(
                self.branch_a.id, [self.product_a_not_tracked.id]
            ),
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_order_creation_rejects_products_not_offered_by_branch(self):
        """A product with no ``ProductStock`` for the branch is rejected."""
        response = self.client.post(
            reverse("orders-list"),
            self._create_payload(
                self.branch_a.id, [self.product_only_in_b.id]
            ),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("order_products", response.data)
        self.assertFalse(
            Order.objects.filter(client_id=self.user.id).exists()
        )

    def test_order_creation_rejects_products_out_of_stock_in_branch(self):
        """A product whose branch stock is ``OUT_OF_STOCK`` is rejected."""
        response = self.client.post(
            reverse("orders-list"),
            self._create_payload(
                self.branch_a.id, [self.product_a_out_of_stock.id]
            ),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("order_products", response.data)
        self.assertFalse(
            Order.objects.filter(client_id=self.user.id).exists()
        )

    def test_add_product_to_pending_order_rejects_products_from_other_branch(self):
        """``add-product`` must also enforce the branch scope."""
        order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=self.branch_a.id,
            client_id=self.user.id,
            payment_method=1,
        )

        response = self.client.post(
            reverse("orders-add-product", args=[order.id]),
            {"item_id": self.product_only_in_b.id, "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("unavailable", response.data)
        self.assertEqual(
            OrderProduct.objects.filter(order=order).count(), 0
        )

    def test_add_product_to_pending_order_rejects_out_of_stock_products(self):
        """``add-product`` rejects products that are out of stock in the order's branch."""
        order = Order.objects.create(
            order_number=1,
            date="2026-01-01",
            branch_id=self.branch_a.id,
            client_id=self.user.id,
            payment_method=1,
        )

        response = self.client.post(
            reverse("orders-add-product", args=[order.id]),
            {"item_id": self.product_a_out_of_stock.id, "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("unavailable", response.data)
        self.assertEqual(
            OrderProduct.objects.filter(order=order).count(), 0
        )
