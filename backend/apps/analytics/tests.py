from datetime import timedelta

from django.contrib.auth.models import Group
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company, CompanySchool
from apps.orders.models import Order, OrderProduct
from apps.products.models import Product, Category
from apps.schools.models import School
from apps.users.models import User


class AnalyticsApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.manager = User.objects.create_user(
            user="manager@school.edu.mx",
            name="Manager",
            password="password",
        )
        cls.other_manager = User.objects.create_user(
            user="other-manager@school.edu.mx",
            name="Other Manager",
            password="password",
        )
        cls.client_user = User.objects.create_user(
            user="client@school.edu.mx",
            name="Client",
            password="password",
        )
        manager_group = Group.objects.create(name="gerente")
        cls.manager.groups.add(manager_group)
        cls.other_manager.groups.add(manager_group)

        category = Category.objects.create(name="Bebidas")
        cls.product_a = Product.objects.create(
            name="Café americano",
            price="25.00",
            category=category,
        )
        cls.product_b = Product.objects.create(
            name="Capuchino",
            price="35.00",
            category=category,
        )

        cls.school = School.objects.create(
            full_name="Test School",
            short_name="TS",
        )
        cls.company = Company.objects.create(
            name="Test Company",
            owner=cls.manager,
        )
        CompanySchool.objects.create(
            company=cls.company,
            school=cls.school,
        )
        cls.branch = Branch.objects.create(
            name="Main Branch",
            company=cls.company,
            school=cls.school,
        )

        cls.other_company = Company.objects.create(
            name="Other Company",
            owner=cls.other_manager,
        )
        CompanySchool.objects.create(
            company=cls.other_company,
            school=cls.school,
        )
        cls.other_branch = Branch.objects.create(
            name="Other Branch",
            company=cls.other_company,
            school=cls.school,
        )

        today = timezone.now().date()
        now = timezone.now()

        cls.order1 = Order.objects.create(
            order_number=1,
            date=today,
            branch_id=cls.branch.id,
            client_id=cls.client_user.id,
            payment_method=1,
            state="ready",
            total="60.00",
        )
        cls.order1.created_at = now.replace(hour=8, minute=0)
        cls.order1.save(update_fields=["created_at"])
        OrderProduct.objects.create(
            order=cls.order1, item_id=cls.product_a.id, quantity=1, price="25.00"
        )

        cls.order2 = Order.objects.create(
            order_number=2,
            date=today,
            branch_id=cls.branch.id,
            client_id=cls.client_user.id,
            payment_method=1,
            state="ready",
            total="35.00",
        )
        cls.order2.created_at = now.replace(hour=10, minute=0)
        cls.order2.save(update_fields=["created_at"])
        OrderProduct.objects.create(
            order=cls.order2, item_id=cls.product_b.id, quantity=1, price="35.00"
        )

        cls.order3 = Order.objects.create(
            order_number=3,
            date=today,
            branch_id=cls.branch.id,
            client_id=cls.client_user.id,
            payment_method=1,
            state="ready",
            total="85.00",
        )
        cls.order3.created_at = now.replace(hour=10, minute=30)
        cls.order3.save(update_fields=["created_at"])
        OrderProduct.objects.create(
            order=cls.order3, item_id=cls.product_a.id, quantity=2, price="50.00"
        )
        OrderProduct.objects.create(
            order=cls.order3, item_id=cls.product_b.id, quantity=1, price="35.00"
        )

        cls.order4 = Order.objects.create(
            order_number=4,
            date=today - timedelta(days=2),
            branch_id=cls.branch.id,
            client_id=cls.client_user.id,
            payment_method=1,
            state="pending",
            total="25.00",
        )
        OrderProduct.objects.create(
            order=cls.order4, item_id=cls.product_a.id, quantity=1, price="25.00"
        )

        cls.other_order = Order.objects.create(
            order_number=100,
            date=today,
            branch_id=cls.other_branch.id,
            client_id=cls.client_user.id,
            payment_method=1,
            state="ready",
            total="999.00",
        )
        OrderProduct.objects.create(
            order=cls.other_order,
            item_id=cls.product_b.id,
            quantity=10,
            price="999.00",
        )

    def setUp(self):
        self.client.force_authenticate(user=self.manager)

    # daily-summary

    def test_daily_summary_returns_todays_metrics(self):
        response = self.client.get(
            reverse("analytics-daily-summary"),
            {"period": "daily"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["orders_count"], 3)
        self.assertEqual(response.data["sales_total"], "180.00")
        self.assertIsNotNone(response.data["top_product"])
        self.assertEqual(response.data["top_product"]["name"], "Café americano")
        self.assertEqual(response.data["top_product"]["quantity_sold"], 3)
        self.assertIsNone(response.data["avg_operation_minutes"])

    def test_daily_summary_avg_operation_with_completed_orders(self):
        now = timezone.now()
        self.order1.picked_up_at = self.order1.created_at + timedelta(minutes=5)
        self.order1.save(update_fields=["picked_up_at"])
        self.order2.picked_up_at = self.order2.created_at + timedelta(minutes=15)
        self.order2.save(update_fields=["picked_up_at"])

        response = self.client.get(
            reverse("analytics-daily-summary"),
            {"period": "daily"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.data["avg_operation_minutes"])
        self.assertEqual(response.data["avg_operation_minutes"], 10.0)

    # top-products

    def test_top_products_ranked_by_quantity(self):
        response = self.client.get(
            reverse("analytics-top-products"),
            {"period": "daily"},
        )

        self.assertEqual(response.status_code, 200)
        products = response.data["products"]

        product_a = next(p for p in products if p["name"] == "Café americano")
        product_b = next(p for p in products if p["name"] == "Capuchino")
        self.assertEqual(product_a["quantity_sold"], 3)
        self.assertEqual(product_b["quantity_sold"], 2)
        self.assertEqual(products[0]["name"], "Café americano")

    # orders-by-hour

    def test_orders_by_hour_returns_24_buckets(self):
        response = self.client.get(
            reverse("analytics-orders-by-hour"),
            {"period": "daily"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["hours"]), 24)

        hours = response.data["hours"]
        self.assertEqual(
            next(h["count"] for h in hours if h["hour"] == 8), 1
        )
        self.assertEqual(
            next(h["count"] for h in hours if h["hour"] == 10), 2
        )
        self.assertEqual(
            next(h["count"] for h in hours if h["hour"] == 0), 0
        )

    # sales

    def test_sales_returns_daily_totals(self):
        response = self.client.get(
            reverse("analytics-sales"),
            {"period": "weekly"},
        )

        self.assertEqual(response.status_code, 200)
        data = response.data["data"]

        today_str = str(timezone.now().date())
        today_entry = next(d for d in data if d["date"] == today_str)
        self.assertEqual(today_entry["total"], "180.00")
        self.assertEqual(today_entry["order_count"], 3)

    # operation-times

    def test_operation_times_only_counts_completed(self):
        now = timezone.now()
        self.order1.picked_up_at = self.order1.created_at + timedelta(minutes=8)
        self.order1.save(update_fields=["picked_up_at"])
        self.order2.picked_up_at = self.order2.created_at + timedelta(minutes=12)
        self.order2.save(update_fields=["picked_up_at"])

        response = self.client.get(
            reverse("analytics-operation-times"),
            {"period": "daily"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["avg_minutes"], 10.0)
        today_str = str(timezone.now().date())
        today_entry = next(
            d for d in response.data["data"] if d["date"] == today_str
        )
        self.assertEqual(today_entry["avg_minutes"], 10.0)
        self.assertEqual(today_entry["min_minutes"], 8.0)
        self.assertEqual(today_entry["max_minutes"], 12.0)

    def test_operation_times_no_completed_returns_null(self):
        response = self.client.get(
            reverse("analytics-operation-times"),
            {"period": "daily"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["avg_minutes"])
        self.assertEqual(len(response.data["data"]), 0)

    # auth / permissions

    def test_unauthenticated_rejected(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(reverse("analytics-daily-summary"))

        self.assertEqual(response.status_code, 401)

    def test_non_manager_rejected(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.get(reverse("analytics-daily-summary"))

        self.assertEqual(response.status_code, 403)

    # RN-23

    def test_rn23_manager_only_sees_own_branch_data(self):
        response = self.client.get(
            reverse("analytics-daily-summary"),
            {"period": "daily"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["orders_count"], 3)
        self.assertEqual(response.data["sales_total"], "180.00")

        self.client.force_authenticate(user=self.other_manager)
        response = self.client.get(
            reverse("analytics-daily-summary"),
            {"period": "daily"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["orders_count"], 1)
        self.assertEqual(response.data["sales_total"], "999.00")

    # period filtering

    def test_period_weekly_includes_older_order(self):
        response = self.client.get(
            reverse("analytics-daily-summary"),
            {"period": "weekly"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["orders_count"], 4)
