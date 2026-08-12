from decimal import Decimal

from django.contrib.auth.models import Group
from django.db import connection
from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company
from apps.orders.models import Order, OrderProduct, PaymentMethod
from apps.orders.state_machine import (
    ALL_STATES,
    TERMINAL_STATES,
    VALID_TRANSITIONS as STATE_MACHINE_TRANSITIONS,
    allowed_next_states,
    can_transition,
    is_terminal,
)
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

        # Avanzar la secuencia de branches para que los siguientes Branch.objects.create()
        # (sin id explícito) no colisionen con el id=1 anterior (fix fragilidad flake).
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT setval(pg_get_serial_sequence('branches', 'id'), "
                "GREATEST((SELECT MAX(id) FROM branches), 1))"
            )

    def setUp(self):
        self.client.force_authenticate(user=self.client_user)

    def test_order_requires_at_least_one_product(self):
        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "client_id": self.client_user.id,
                "payment_method": 1,
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
                "payment_method": 1,
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
            payment_method_id=1,
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
            payment_method_id=1,
        )
        Order.objects.create(
            order_number=2,
            date="2026-01-01",
            branch_id=1,
            client_id=self.other_user.id,
            payment_method_id=1,
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
            payment_method_id=1,
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
            payment_method_id=1,
        )
        Order.objects.create(
            order_number=2,
            date="2026-01-01",
            branch_id=1,
            client_id=self.other_user.id,
            payment_method_id=1,
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
            payment_method_id=1,
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
                "payment_method": 1,
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
                "payment_method": 1,
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
                "payment_method": 1,
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
            payment_method_id=1,
            state=Order.State.PENDING,
        )

        response = self.client.post(
            reverse("orders-list"),
            {
                "branch_id": self.branch.id,
                "payment_method": 1,
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
                "payment_method": 1,
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
                "payment_method": 1,
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
                "payment_method": 1,
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
                "payment_method": 1,
                "order_products": [
                    {"item_id": product.id, "quantity": 1},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(client_id=self.client_user.id)
        self.assertEqual(order.total, Decimal("10.00"))



class OrderStateMachineTests(SimpleTestCase):
    """RF-07 / RN-13: la tabla canónica de transiciones es la única fuente de verdad."""

    VALID = {
        "pending": {"preparing", "rejected"},
        "preparing": {"ready", "rejected"},
        "ready": {"picked_up"},
        "picked_up": set(),
        "rejected": set(),
    }

    def test_all_state_combinations_are_evaluated(self):
        """Todas las 25 combinaciones (válidas e inválidas) responden según la tabla."""
        self.assertEqual(
            set(STATE_MACHINE_TRANSITIONS.keys()), set(self.VALID.keys())
        )
        for from_state in ALL_STATES:
            for to_state in ALL_STATES:
                expected = to_state in self.VALID[from_state]
                with self.subTest(from_state=from_state, to_state=to_state):
                    self.assertEqual(
                        can_transition(from_state, to_state), expected
                    )
                    self.assertEqual(
                        can_transition(
                            Order.State(from_state), Order.State(to_state)
                        ),
                        expected,
                    )

    def test_terminal_states_have_no_outgoing_transitions(self):
        """picked_up y rejected no permiten ninguna transición saliente (RN-14/RN-15)."""
        for state in TERMINAL_STATES:
            with self.subTest(state=state):
                self.assertTrue(is_terminal(state))
                self.assertEqual(allowed_next_states(state), [])

    def test_non_terminal_states_have_outgoing_transitions(self):
        for state in ("pending", "preparing", "ready"):
            with self.subTest(state=state):
                self.assertFalse(is_terminal(state))
                self.assertNotEqual(allowed_next_states(state), [])


class OrderStateTransitionApiTests(APITestCase):
    """RF-07 / RN-13 / RN-14 / RN-15: transiciones vía PUT/PATCH en /api/orders/."""

    VALID_TRANSITIONS = [
        ("pending", "preparing"),
        ("pending", "rejected"),
        ("preparing", "ready"),
        ("preparing", "rejected"),
        ("ready", "picked_up"),
    ]

    INVALID_TRANSITIONS = [
        ("pending", "ready"),
        ("pending", "picked_up"),
        ("preparing", "pending"),
        ("preparing", "picked_up"),
        ("ready", "pending"),
        ("ready", "preparing"),
        ("ready", "rejected"),
        ("picked_up", "pending"),
        ("picked_up", "preparing"),
        ("picked_up", "ready"),
        ("picked_up", "rejected"),
        ("rejected", "pending"),
        ("rejected", "preparing"),
        ("rejected", "ready"),
        ("rejected", "picked_up"),
    ]

    @classmethod
    def setUpTestData(cls):
        cls.client_user = User.objects.create_user(
            user="client-states@school.edu.mx",
            name="Client States",
            password="password",
        )
        cls.kitchen_user = User.objects.create_user(
            user="kitchen-states@school.edu.mx",
            name="Kitchen States",
            password="password",
        )
        cls.kitchen_group = Group.objects.create(name="empleado")
        cls.kitchen_user.groups.add(cls.kitchen_group)

    def setUp(self):
        self.client.force_authenticate(user=self.kitchen_user)
        self.order_seq = 0

    def create_order(self, state=Order.State.PENDING):
        self.order_seq += 1
        return Order.objects.create(
            order_number=self.order_seq,
            date="2026-01-01",
            branch_id=1,
            client_id=self.client_user.id,
            payment_method_id=1,
            state=state,
        )

    def test_valid_transitions_update_the_order_state(self):
        """RN-13: la secuencia lineal válida avanza con PUT/PATCH."""
        for from_state, to_state in self.VALID_TRANSITIONS:
            with self.subTest(from_state=from_state, to_state=to_state):
                order = self.create_order(state=from_state)

                response = self.client.patch(
                    reverse("orders-detail", args=[order.id]),
                    {"state": to_state},
                    format="json",
                )

                self.assertEqual(response.status_code, 200)
                order.refresh_from_db()
                self.assertEqual(order.state, to_state)

    def test_invalid_transitions_are_rejected_and_state_is_unchanged(self):
        """Las transiciones no permitidas responden 400 y no persisten."""
        for from_state, to_state in self.INVALID_TRANSITIONS:
            with self.subTest(from_state=from_state, to_state=to_state):
                order = self.create_order(state=from_state)

                response = self.client.patch(
                    reverse("orders-detail", args=[order.id]),
                    {"state": to_state},
                    format="json",
                )

                self.assertEqual(response.status_code, 400)
                order.refresh_from_db()
                self.assertEqual(order.state, from_state)

    def test_rejected_order_cannot_be_accepted_again(self):
        """RN-14: rejected es terminal; ningún cambio de estado posterior es válido."""
        order = self.create_order(state=Order.State.REJECTED)

        for to_state in ALL_STATES:
            if to_state == "rejected":
                continue
            with self.subTest(to_state=to_state):
                response = self.client.patch(
                    reverse("orders-detail", args=[order.id]),
                    {"state": to_state},
                    format="json",
                )

                self.assertEqual(response.status_code, 400)
                order.refresh_from_db()
                self.assertEqual(order.state, "rejected")

    def test_picked_up_order_cannot_change_state(self):
        """RN-15: picked_up es terminal; el pedido entregado no cambia de estado."""
        order = self.create_order(state=Order.State.PICKED_UP)

        for to_state in ALL_STATES:
            if to_state == "picked_up":
                continue
            with self.subTest(to_state=to_state):
                response = self.client.patch(
                    reverse("orders-detail", args=[order.id]),
                    {"state": to_state},
                    format="json",
                )

                self.assertEqual(response.status_code, 400)
                order.refresh_from_db()
                self.assertEqual(order.state, "picked_up")

    def test_client_cannot_change_order_state(self):
        """Solo el personal de cocina cambia estados; un cliente recibe 403."""
        order = self.create_order(state=Order.State.PENDING)
        self.client.force_authenticate(user=self.client_user)

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"state": "preparing"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        order.refresh_from_db()
        self.assertEqual(order.state, Order.State.PENDING)

    def test_preparing_sets_prepared_at_and_picked_up_sets_picked_up_at(self):
        """Los timestamps asociados a la transición se registran."""
        order = self.create_order(state=Order.State.PENDING)

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"state": "preparing"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertIsNotNone(order.prepared_at)
        self.assertIsNone(order.picked_up_at)

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"state": "ready"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"state": "picked_up"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertIsNotNone(order.picked_up_at)


class OrderPaymentConfirmationApiTests(APITestCase):
    """RF-11 / RN-19 / RN-20: confirmación de pago en efectivo por el cajero."""

    @classmethod
    def setUpTestData(cls):
        cls.client_user = User.objects.create_user(
            user="client-pay@school.edu.mx",
            name="Client Pay",
            password="password",
        )
        cls.cashier_user = User.objects.create_user(
            user="cashier-pay@school.edu.mx",
            name="Cashier Pay",
            password="password",
        )
        cls.cashier_group = Group.objects.create(name="empleado")
        cls.cashier_user.groups.add(cls.cashier_group)

    def setUp(self):
        self.client.force_authenticate(user=self.cashier_user)
        self.order_seq = 0

    def create_order(self, payment_method_id=1, payment_status="pending"):
        self.order_seq += 1
        return Order.objects.create(
            order_number=self.order_seq,
            date="2026-01-01",
            branch_id=1,
            client_id=self.client_user.id,
            payment_method_id=payment_method_id,
            payment_status=payment_status,
        )

    def test_cashier_confirms_cash_payment(self):
        """RN-19: el cajero confirma el pago en efectivo (pending -> paid)."""
        order = self.create_order()

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"payment_status": "paid"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.payment_status, "paid")

    def test_client_cannot_confirm_payment(self):
        """Solo el personal de caja puede confirmar el pago."""
        order = self.create_order()
        self.client.force_authenticate(user=self.client_user)

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"payment_status": "paid"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        order.refresh_from_db()
        self.assertEqual(order.payment_status, "pending")

    def test_paid_payment_cannot_be_unconfirmed(self):
        """Un pago confirmado no puede regresar a 'pending'."""
        order = self.create_order(payment_status="paid")

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"payment_status": "pending"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        order.refresh_from_db()
        self.assertEqual(order.payment_status, "paid")

    def test_card_payment_does_not_require_cashier_confirmation(self):
        """RN-19: solo los pedidos en efectivo requieren confirmación de pago."""
        order = self.create_order(payment_method_id=2)

        response = self.client.patch(
            reverse("orders-detail", args=[order.id]),
            {"payment_status": "paid"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        order.refresh_from_db()
        self.assertEqual(order.payment_status, "pending")

    def test_payment_method_serialized_as_pk(self):
        """La API expone payment_method como el id del método (RF-11)."""
        order = self.create_order()
        response = self.client.get(
            reverse("orders-detail", args=[order.id]), format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["payment_method"], 1)
        self.assertIsInstance(response.data["payment_method"], int)

    def test_payment_method_catalog_has_cash_and_card(self):
        """El catálogo sembrado por migración contiene Efectivo y Tarjeta."""
        methods = PaymentMethod.objects.order_by("id").values_list(
            "name", "is_digital"
        )
        self.assertEqual(
            list(methods),
            [("Efectivo", False), ("Tarjeta", True)],
        )
