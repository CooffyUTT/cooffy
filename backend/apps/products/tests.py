from decimal import Decimal

from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from .models import Product


class ProductManageViewSetTests(APITestCase):
    list_url = '/api/menu/manage/products/'

    def setUp(self):
        self.gerente_group, _ = Group.objects.get_or_create(name='gerente')
        self.supervisor_group, _ = Group.objects.get_or_create(name='supervisor')
        self.cliente_group, _ = Group.objects.get_or_create(name='cliente')

        self.gerente = User.objects.create_user(
            user='gerente@ut-tijuana.edu.mx', password='Password123', name='Gerente',
        )
        self.gerente.groups.add(self.gerente_group)

        self.supervisor = User.objects.create_user(
            user='supervisor@ut-tijuana.edu.mx', password='Password123', name='Supervisor',
        )
        self.supervisor.groups.add(self.supervisor_group)

        self.cliente = User.objects.create_user(
            user='cliente@ut-tijuana.edu.mx', password='Password123', name='Cliente',
        )
        self.cliente.groups.add(self.cliente_group)

        self.product = Product.objects.create(
            name='Café americano', price=Decimal('25.00'), description='Café negro',
        )

    def _auth_as(self, user):
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')

    def detail_url(self, product_id):
        return f'{self.list_url}{product_id}/'

    def test_cliente_no_puede_administrar_productos(self):
        self._auth_as(self.cliente)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_no_autenticado_es_rechazado(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_gerente_puede_listar_productos_incluyendo_inactivos(self):
        Product.objects.create(name='Producto agotado', price=Decimal('10.00'), active=False)
        self._auth_as(self.gerente)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_supervisor_puede_crear_producto(self):
        self._auth_as(self.supervisor)
        response = self.client.post(self.list_url, {
            'name': 'Jugo de naranja',
            'price': '30.00',
            'max_per_order': 3,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Product.objects.filter(name='Jugo de naranja').exists())

    def test_crear_producto_con_precio_invalido_falla(self):
        self._auth_as(self.gerente)
        response = self.client.post(self.list_url, {'name': 'Producto gratis', 'price': '0'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)

    def test_crear_producto_sin_nombre_falla(self):
        self._auth_as(self.gerente)
        response = self.client.post(self.list_url, {'name': '   ', 'price': '10'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    def test_editar_producto(self):
        self._auth_as(self.gerente)
        response = self.client.patch(self.detail_url(self.product.id), {'price': '28.50'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, Decimal('28.50'))

    def test_eliminar_producto(self):
        self._auth_as(self.gerente)
        response = self.client.delete(self.detail_url(self.product.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())

    def test_toggle_active_deshabilita_y_habilita_producto(self):
        self._auth_as(self.gerente)
        url = f'{self.detail_url(self.product.id)}toggle-active/'

        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['active'])

        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['active'])
