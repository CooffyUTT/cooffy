from decimal import Decimal

from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company
from apps.orders.models import Order
from apps.products.models import Product, ProductStock
from apps.schools.models import School
from apps.users.models import User


class PublicBranchScopeTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.client_user = User.objects.create_user(
            user='client-one@school.edu.mx',
            name='Client One',
            password='password',
        )
        cls.other_admin = User.objects.create_user(
            user='admin-two@school.edu.mx',
            name='Admin Two',
            password='password',
        )
        cls.school = School.objects.create(
            full_name='School One',
            short_name='S1',
            admin=cls.other_admin,
        )
        cls.other_school = School.objects.create(
            full_name='School Two',
            short_name='S2',
            admin=cls.other_admin,
        )
        cls.client_user.school = cls.school
        cls.client_user.save(update_fields=['school'])
        owner = User.objects.create_user(
            user='manager@school.edu.mx',
            name='Manager',
            password='password',
        )
        company = Company.objects.create(name='Company', owner=owner)
        Branch.objects.create(name='Branch One', company=company, school=cls.school)
        Branch.objects.create(name='Branch Two', company=company, school=cls.other_school)

    def test_public_branches_are_scoped_to_user_school(self):
        self.client.force_authenticate(user=self.client_user)

        response = self.client.get(reverse('branch-public-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [branch['name'] for branch in response.data['results']],
            ['Branch One'],
        )

    def test_public_branches_are_empty_without_school(self):
        self.client_user.school = None
        self.client_user.save(update_fields=['school'])
        self.client.force_authenticate(user=self.client_user)

        response = self.client.get(reverse('branch-public-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'], [])


class ToggleAcceptingOrdersTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.gerente_group, _ = Group.objects.get_or_create(name='gerente')
        cls.empleado_group, _ = Group.objects.get_or_create(name='empleado')
        cls.cliente_group, _ = Group.objects.get_or_create(name='cliente')

        cls.gerente_user = User.objects.create_user(
            user='gerente@test.com',
            name='Gerente',
            password='password',
        )
        cls.gerente_user.groups.add(cls.gerente_group)

        cls.empleado_user = User.objects.create_user(
            user='empleado@test.com',
            name='Empleado',
            password='password',
        )
        cls.empleado_user.groups.add(cls.empleado_group)

        cls.otro_empleado = User.objects.create_user(
            user='otro-empleado@test.com',
            name='Otro Empleado',
            password='password',
        )
        cls.otro_empleado.groups.add(cls.empleado_group)

        cls.cliente_user = User.objects.create_user(
            user='cliente@test.com',
            name='Cliente',
            password='password',
        )
        cls.cliente_user.groups.add(cls.cliente_group)

        cls.school = School.objects.create(
            full_name='Test School',
            short_name='TEST',
        )

        cls.company = Company.objects.create(
            name='Test Company',
            owner=cls.gerente_user,
        )

        cls.other_company = Company.objects.create(
            name='Other Company',
            owner=cls.gerente_user,
        )

        cls.branch = Branch.objects.create(
            name='Sucursal Principal',
            company=cls.company,
            school=cls.school,
            active=True,
            accepting_orders=True,
        )

        cls.other_branch = Branch.objects.create(
            name='Otra Sucursal',
            company=cls.other_company,
            school=cls.school,
            active=True,
            accepting_orders=True,
        )

        cls.empleado_user.branch = cls.branch
        cls.empleado_user.save(update_fields=['branch'])

        cls.otro_empleado.branch = cls.other_branch
        cls.otro_empleado.save(update_fields=['branch'])

        cls.cliente_user.school = cls.school
        cls.cliente_user.save(update_fields=['school'])

    def _toggle_url(self, branch):
        return reverse('branch-toggle-accepting', kwargs={'pk': branch.id})

    def _orders_url(self):
        return reverse('orders-list')

    def test_empleado_puede_suspender_su_sucursal(self):
        self.client.force_authenticate(user=self.empleado_user)

        response = self.client.post(self._toggle_url(self.branch))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['accepting_orders'])
        self.branch.refresh_from_db()
        self.assertFalse(self.branch.accepting_orders)

    def test_empleado_no_puede_suspender_otra_sucursal(self):
        self.client.force_authenticate(user=self.empleado_user)

        response = self.client.post(self._toggle_url(self.other_branch))

        self.assertEqual(response.status_code, 404)

    def test_gerente_puede_suspender_sucursal_de_su_empresa(self):
        self.client.force_authenticate(user=self.gerente_user)

        response = self.client.post(self._toggle_url(self.branch))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['accepting_orders'])
        self.branch.refresh_from_db()
        self.assertFalse(self.branch.accepting_orders)

    def test_gerente_no_puede_suspender_sucursal_de_otra_empresa(self):
        otro_gerente = User.objects.create_user(
            user='otro-gerente@test.com',
            name='Otro Gerente',
            password='password',
        )
        otro_gerente.groups.add(self.gerente_group)

        self.client.force_authenticate(user=otro_gerente)

        response = self.client.post(self._toggle_url(self.branch))

        self.assertEqual(response.status_code, 404)

    def test_cliente_no_puede_suspender(self):
        self.client.force_authenticate(user=self.cliente_user)

        response = self.client.post(self._toggle_url(self.branch))

        self.assertEqual(response.status_code, 404)

    def test_unauthenticated_no_puede_suspender(self):
        response = self.client.post(self._toggle_url(self.branch))

        self.assertEqual(response.status_code, 401)

    def test_superuser_puede_suspender(self):
        superuser = User.objects.create_superuser(
            user='admin@test.com',
            name='Admin',
            password='password',
        )
        self.client.force_authenticate(user=superuser)

        response = self.client.post(self._toggle_url(self.branch))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['accepting_orders'])

    def test_empleado_puede_reanudar_su_sucursal(self):
        self.branch.accepting_orders = False
        self.branch.save(update_fields=['accepting_orders'])

        self.client.force_authenticate(user=self.empleado_user)

        response = self.client.post(self._toggle_url(self.branch))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['accepting_orders'])
        self.branch.refresh_from_db()
        self.assertTrue(self.branch.accepting_orders)

    def test_sucursal_suspendida_no_acepta_pedidos(self):
        self.branch.accepting_orders = False
        self.branch.save(update_fields=['accepting_orders', 'updated_at'])

        product = Product.objects.create(
            id=900, name='Test Product', price=Decimal('25.00')
        )
        ProductStock.objects.create(
            branch=self.branch,
            product=product,
            stock=ProductStock.StockState.IN_STOCK,
        )

        self.client.force_authenticate(user=self.cliente_user)

        response = self.client.post(
            self._orders_url(),
            {
                'branch_id': self.branch.id,
                'payment_method': 1,
                'order_products': [
                    {'item_id': product.id, 'quantity': 1},
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('aceptando pedidos', str(response.data))
