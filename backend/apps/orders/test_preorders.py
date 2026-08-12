"""Tests for RF-14 / RN-25 a RN-31: pedidos anticipados (backend).

Covers the anticipation window validation on order creation, the ``cancelled``
state and cancel endpoint, the kitchen queue release rule and the ``upcoming``
tab, the per-day kitchen filter for pre-orders, and the branch anticipation
window configuration by the manager.
"""
from datetime import datetime, timedelta
from decimal import Decimal

from django.contrib.auth.models import Group
from django.db.models import Max
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company
from apps.orders.models import Order
from apps.orders.services import PRE_ORDER_KITCHEN_LEAD_MINUTES
from apps.orders.state_machine import ALL_STATES, can_transition, is_terminal
from apps.products.models import Category, Product, ProductStock
from apps.schools.models import School
from apps.users.models import User


class PreOrderTestBase(APITestCase):
    """Shared fixtures: client, branch (default 30 min / 24 h) and product."""

    @classmethod
    def setUpTestData(cls):
        cls.client_user = User.objects.create_user(
            user="preorder-client@school.edu.mx",
            name="Preorder Client",
            password="password",
        )
        cls.school = School.objects.create(
            full_name="Preorder School",
            short_name="PRE",
        )
        cls.company = Company.objects.create(
            name="Preorder Co",
            owner=cls.client_user,
        )
        cls.branch = Branch.objects.create(
            name="Preorder Branch",
            company=cls.company,
            school=cls.school,
            active=True,
            accepting_orders=True,
        )
        cls.category = Category.objects.create(name="Preorder")
        cls.product = Product.objects.create(
            name="Preorder product",
            price=Decimal("25.00"),
            category=cls.category,
            active=True,
        )
        ProductStock.objects.create(
            branch=cls.branch,
            product=cls.product,
            stock=ProductStock.StockState.IN_STOCK,
        )

    def order_payload(self, pickup=None):
        payload = {
            "branch_id": self.branch.id,
            "payment_method": 1,
            "order_products": [{"item_id": self.product.id, "quantity": 1}],
        }
        if pickup is not None:
            payload["scheduled_pickup_at"] = pickup.isoformat()
        return payload

    def make_order(self, **kwargs):
        max_num = Order.objects.aggregate(m=Max("order_number"))["m"] or 0
        defaults = {
            "order_number": max_num + 1,
            "date": timezone.localdate(),
            "branch_id": self.branch.id,
            "client_id": self.client_user.id,
            "payment_method_id": 1,
        }
        defaults.update(kwargs)
        return Order.objects.create(**defaults)


class PreOrderWindowValidationTests(PreOrderTestBase):
    """RN-25 / RN-26: la recogida programada debe caer en la ventana de la sucursal."""

    def setUp(self):
        self.client.force_authenticate(user=self.client_user)

    def test_pickup_too_soon_is_rejected(self):
        pickup = timezone.now() + timedelta(minutes=10)
        response = self.client.post(
            reverse("orders-list"), self.order_payload(pickup), format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("30 minutos", str(response.data))
        self.assertFalse(Order.objects.filter(client_id=self.client_user.id).exists())

    def test_pickup_beyond_maximum_anticipation_is_rejected(self):
        pickup = timezone.now() + timedelta(hours=25)
        response = self.client.post(
            reverse("orders-list"), self.order_payload(pickup), format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("24 horas", str(response.data))
        self.assertFalse(Order.objects.filter(client_id=self.client_user.id).exists())

    def test_pickup_within_window_today_is_accepted(self):
        pickup = timezone.now() + timedelta(minutes=40)
        response = self.client.post(
            reverse("orders-list"), self.order_payload(pickup), format="json"
        )

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(client_id=self.client_user.id)
        self.assertIsNotNone(order.scheduled_pickup_at)
        self.assertLess(abs((order.scheduled_pickup_at - pickup).total_seconds()), 1)

    def test_pickup_within_window_tomorrow_is_accepted(self):
        pickup = timezone.now() + timedelta(hours=20)
        response = self.client.post(
            reverse("orders-list"), self.order_payload(pickup), format="json"
        )

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(client_id=self.client_user.id)
        self.assertIsNotNone(order.scheduled_pickup_at)

    def test_order_without_scheduled_pickup_is_a_normal_order(self):
        response = self.client.post(
            reverse("orders-list"), self.order_payload(), format="json"
        )

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(client_id=self.client_user.id)
        self.assertIsNone(order.scheduled_pickup_at)


class PreOrderActiveOrderTests(PreOrderTestBase):
    """RN-28: un pedido anticipado cuenta como pedido activo (RN-04)."""

    def setUp(self):
        self.client.force_authenticate(user=self.client_user)

    def test_active_normal_order_blocks_preorder(self):
        self.make_order(state=Order.State.PENDING)

        response = self.client.post(
            reverse("orders-list"),
            self.order_payload(timezone.now() + timedelta(hours=2)),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("pedido activo", str(response.data))

    def test_active_preorder_blocks_normal_order(self):
        self.make_order(
            state=Order.State.PENDING,
            scheduled_pickup_at=timezone.now() + timedelta(hours=2),
        )

        response = self.client.post(
            reverse("orders-list"), self.order_payload(), format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("pedido activo", str(response.data))
        self.assertEqual(Order.objects.filter(client_id=self.client_user.id).count(), 1)

    def test_cancelled_preorder_no_longer_blocks_new_orders(self):
        self.make_order(
            state=Order.State.CANCELLED,
            scheduled_pickup_at=timezone.now() + timedelta(hours=2),
        )

        response = self.client.post(
            reverse("orders-list"), self.order_payload(), format="json"
        )

        self.assertEqual(response.status_code, 201)


class PreOrderKitchenQueueTests(PreOrderTestBase):
    """RN-29 / RN-31: liberación de pre-orders a la cola y pestaña upcoming."""

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.kitchen_group, _ = Group.objects.get_or_create(name="empleado")
        cls.kitchen_user = User.objects.create_user(
            user="preorder-kitchen@school.edu.mx",
            name="Preorder Kitchen",
            password="password",
        )
        cls.kitchen_user.groups.add(cls.kitchen_group)
        cls.kitchen_user.branch = cls.branch
        cls.kitchen_user.save(update_fields=["branch"])

    def setUp(self):
        self.client.force_authenticate(user=self.kitchen_user)

    def test_upcoming_lists_unreleased_preorders(self):
        tomorrow = timezone.now() + timedelta(days=1, hours=1)
        self.make_order(state=Order.State.PENDING, scheduled_pickup_at=tomorrow)
        self.make_order(state=Order.State.PREPARING, scheduled_pickup_at=tomorrow + timedelta(hours=2))
        self.make_order(state=Order.State.PENDING)

        response = self.client.get(reverse("orders-list"), {"upcoming": "true"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        pickups = {item["scheduled_pickup_at"] for item in response.data}
        self.assertEqual(len(pickups), 2)

    def test_pending_state_excludes_unreleased_preorders(self):
        self.make_order(
            state=Order.State.PENDING,
            scheduled_pickup_at=timezone.now() + timedelta(hours=3),
        )

        response = self.client.get(reverse("orders-list"), {"state": "pending"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_preorder_within_lead_appears_in_pending_queue(self):
        self.make_order(
            state=Order.State.PENDING,
            scheduled_pickup_at=timezone.now()
            + timedelta(minutes=PRE_ORDER_KITCHEN_LEAD_MINUTES - 5),
        )

        response = self.client.get(reverse("orders-list"), {"state": "pending"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["state"], "pending")

    def test_upcoming_orders_by_pickup_ascending(self):
        later = timezone.now() + timedelta(hours=5)
        sooner = timezone.now() + timedelta(hours=1)
        self.make_order(state=Order.State.PENDING, scheduled_pickup_at=later)
        self.make_order(state=Order.State.PENDING, scheduled_pickup_at=sooner)

        response = self.client.get(reverse("orders-list"), {"upcoming": "true"})

        self.assertEqual(response.status_code, 200)
        pickups = [item["scheduled_pickup_at"] for item in response.data]
        self.assertEqual(pickups, sorted(pickups))

    def test_client_cannot_access_upcoming_tab(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.get(reverse("orders-list"), {"upcoming": "true"})

        self.assertEqual(response.status_code, 403)

    def test_list_serializer_exposes_scheduled_pickup_at(self):
        self.make_order(
            state=Order.State.PENDING,
            scheduled_pickup_at=timezone.now() + timedelta(hours=2),
        )

        response = self.client.get(reverse("orders-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertIn("scheduled_pickup_at", response.data[0])
        self.assertIsNotNone(response.data[0]["scheduled_pickup_at"])


class PreOrderDayFilterTests(PreOrderTestBase):
    """RN-29: un pre-order creado ayer con recogida hoy se ve en la cola de hoy."""

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.kitchen_group, _ = Group.objects.get_or_create(name="empleado")
        cls.kitchen_user = User.objects.create_user(
            user="preorder-day-kitchen@school.edu.mx",
            name="Preorder Day Kitchen",
            password="password",
        )
        cls.kitchen_user.groups.add(cls.kitchen_group)
        cls.kitchen_user.branch = cls.branch
        cls.kitchen_user.save(update_fields=["branch"])

    def _yesterday_preorder_picking_up_today(self):
        today = timezone.localdate()
        pickup = timezone.localtime() + timedelta(minutes=20)
        if pickup.date() != today:
            pickup = timezone.make_aware(
                datetime.combine(
                    today, datetime.min.time()
                ).replace(hour=23, minute=59, second=59)
            )
        return Order.objects.create(
            order_number=1,
            date=today - timedelta(days=1),
            branch_id=self.branch.id,
            client_id=self.client_user.id,
            payment_method_id=1,
            state=Order.State.PENDING,
            scheduled_pickup_at=pickup,
        )

    def test_preorder_created_yesterday_appears_in_today_kitchen_queue(self):
        order = self._yesterday_preorder_picking_up_today()
        self.client.force_authenticate(user=self.kitchen_user)

        response = self.client.get(
            reverse("orders-list"),
            {"date": timezone.localdate().isoformat(), "state": "pending"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [order.id])

    def test_client_does_not_see_yesterday_preorder_in_today_view(self):
        self._yesterday_preorder_picking_up_today()
        self.client.force_authenticate(user=self.client_user)

        response = self.client.get(
            reverse("orders-list"),
            {"date": timezone.localdate().isoformat()},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])


class PreOrderCancellationTests(PreOrderTestBase):
    """RN-30: cancelación de pedidos anticipados dentro de la ventana."""

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.other_user = User.objects.create_user(
            user="preorder-other@school.edu.mx",
            name="Preorder Other",
            password="password",
        )

    def setUp(self):
        self.client.force_authenticate(user=self.client_user)

    def _cancel_url(self, order):
        return reverse("orders-cancel", args=[order.id])

    def test_owner_cancels_pending_preorder(self):
        order = self.make_order(
            state=Order.State.PENDING,
            scheduled_pickup_at=timezone.now() + timedelta(hours=3),
        )

        response = self.client.post(self._cancel_url(order))

        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.state, Order.State.CANCELLED)
        self.assertEqual(response.data["state"], "cancelled")

    def test_non_owner_cannot_cancel(self):
        order = self.make_order(
            state=Order.State.PENDING,
            scheduled_pickup_at=timezone.now() + timedelta(hours=3),
        )
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(self._cancel_url(order))

        self.assertEqual(response.status_code, 403)
        order.refresh_from_db()
        self.assertEqual(order.state, Order.State.PENDING)

    def test_normal_order_cannot_be_cancelled(self):
        order = self.make_order(state=Order.State.PENDING)

        response = self.client.post(self._cancel_url(order))

        self.assertEqual(response.status_code, 400)
        self.assertIn("pedido anticipado", str(response.data))
        order.refresh_from_db()
        self.assertEqual(order.state, Order.State.PENDING)

    def test_non_pending_preorder_cannot_be_cancelled(self):
        order = self.make_order(
            state=Order.State.PREPARING,
            scheduled_pickup_at=timezone.now() + timedelta(hours=3),
        )

        response = self.client.post(self._cancel_url(order))

        self.assertEqual(response.status_code, 400)
        self.assertIn("en espera", str(response.data))
        order.refresh_from_db()
        self.assertEqual(order.state, Order.State.PREPARING)

    def test_out_of_window_preorder_cannot_be_cancelled(self):
        order = self.make_order(
            state=Order.State.PENDING,
            scheduled_pickup_at=timezone.now() + timedelta(minutes=10),
        )

        response = self.client.post(self._cancel_url(order))

        self.assertEqual(response.status_code, 400)
        self.assertIn("fuera de la ventana de cancelación", str(response.data))
        order.refresh_from_db()
        self.assertEqual(order.state, Order.State.PENDING)

    def test_cancelled_is_terminal_and_not_reactivable(self):
        self.assertTrue(is_terminal("cancelled"))
        for to_state in ALL_STATES:
            with self.subTest(to_state=to_state):
                self.assertFalse(can_transition("cancelled", to_state))


class BranchAnticipationWindowApiTests(APITestCase):
    """RN-27: el gerente configura la ventana de anticipación de la sucursal."""

    @classmethod
    def setUpTestData(cls):
        cls.gerente_group, _ = Group.objects.get_or_create(name="gerente")
        cls.gerente_user = User.objects.create_user(
            user="preorder-gerente@school.edu.mx",
            name="Gerente",
            password="password",
        )
        cls.gerente_user.groups.add(cls.gerente_group)
        cls.school = School.objects.create(
            full_name="Window School",
            short_name="WIN",
        )
        cls.company = Company.objects.create(
            name="Window Co",
            owner=cls.gerente_user,
        )
        cls.branch = Branch.objects.create(
            name="Window Branch",
            company=cls.company,
            school=cls.school,
            active=True,
            accepting_orders=True,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.gerente_user)

    def test_branch_serializer_exposes_anticipation_window(self):
        response = self.client.get(
            reverse("branch-detail", args=[self.branch.id])
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["min_anticipation_minutes"], 30)
        self.assertEqual(response.data["max_anticipation_hours"], 24)

    def test_manager_can_patch_anticipation_window(self):
        response = self.client.patch(
            reverse("branch-detail", args=[self.branch.id]),
            {"min_anticipation_minutes": 15, "max_anticipation_hours": 48},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["min_anticipation_minutes"], 15)
        self.assertEqual(response.data["max_anticipation_hours"], 48)
        self.branch.refresh_from_db()
        self.assertEqual(self.branch.min_anticipation_minutes, 15)
        self.assertEqual(self.branch.max_anticipation_hours, 48)
