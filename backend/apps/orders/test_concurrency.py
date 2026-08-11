"""Concurrency tests for RF-10 / RN-21 order numbering.

Two (or more) orders created at the same time for the same branch and date
must both succeed and receive distinct ``order_number`` values. The branch row
is locked with ``select_for_update`` inside the create transaction so the
``Max(order_number) + 1`` computation is serialized per branch.

``APITransactionTestCase`` leaves every thread free to open its own committed
PostgreSQL connection, which is what makes the simulation real.
"""

import threading
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal

from django.db import connections
from django.urls import reverse
from rest_framework.test import APIClient, APITransactionTestCase

from apps.branches.models import Branch, Company
from apps.orders.models import Order
from apps.products.models import Product, ProductStock
from apps.schools.models import School
from apps.users.models import User


class OrderNumberConcurrencyTests(APITransactionTestCase):
    def setUp(self):
        self.users = [
            User.objects.create_user(
                user=f"conc-{i}@school.edu.mx",
                name=f"Concurrent Client {i}",
                password="password",
            )
            for i in range(4)
        ]
        school = School.objects.create(
            full_name="Concurrency School", short_name="CONC"
        )
        company = Company.objects.create(
            name="Concurrency Co", owner=self.users[0]
        )
        self.branch = Branch.objects.create(
            name="Concurrency Branch",
            company=company,
            school=school,
            active=True,
            accepting_orders=True,
        )
        self.product = Product.objects.create(
            name="Concurrency product", price=Decimal("10.00")
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=self.product,
            stock=ProductStock.StockState.IN_STOCK,
        )

    def _submit(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": "cash",
                "order_products": [
                    {"item_id": self.product.id, "quantity": 1}
                ],
            },
            format="json",
        )

    def _worker(self, barrier, user):
        try:
            barrier.wait(timeout=15)
            return self._submit(user)
        finally:
            connections.close_all()

    def _create_concurrently(self, n):
        barrier = threading.Barrier(n)
        with ThreadPoolExecutor(max_workers=n) as executor:
            futures = [
                executor.submit(self._worker, barrier, self.users[i])
                for i in range(n)
            ]
            return [future.result(timeout=30) for future in futures]

    def _order_numbers(self):
        return sorted(
            Order.objects.filter(branch_id=self.branch.id)
            .values_list("order_number", flat=True)
        )

    def test_two_concurrent_orders_get_distinct_numbers(self):
        responses = self._create_concurrently(2)

        self.assertEqual([r.status_code for r in responses], [201, 201])
        self.assertEqual(self._order_numbers(), [1, 2])

    def test_four_concurrent_orders_get_distinct_numbers(self):
        responses = self._create_concurrently(4)

        self.assertEqual([r.status_code for r in responses], [201, 201, 201, 201])
        self.assertEqual(self._order_numbers(), [1, 2, 3, 4])
