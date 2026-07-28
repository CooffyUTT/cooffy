from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from .models import Company, Branch


class BranchViewSetTests(APITestCase):
    """Pruebas para GET /api/branches/?company_id=<id>"""

    def setUp(self):
        self.url = '/api/branches/'

        self.gerente_group, _ = Group.objects.get_or_create(name='gerente')
        self.cliente_group, _ = Group.objects.get_or_create(name='cliente')

        self.gerente = User.objects.create_user(
            user='gerente@ut-tijuana.edu.mx',
            password='Password123',
            name='Gerente',
        )
        self.gerente.groups.add(self.gerente_group)

        self.otro_gerente = User.objects.create_user(
            user='otro.gerente@ut-tijuana.edu.mx',
            password='Password123',
            name='Otro Gerente',
        )
        self.otro_gerente.groups.add(self.gerente_group)

        self.cliente = User.objects.create_user(
            user='cliente@ut-tijuana.edu.mx',
            password='Password123',
            name='Cliente',
        )
        self.cliente.groups.add(self.cliente_group)

        self.company = Company.objects.create(name='Cooffy Corp', owner=self.gerente)
        self.other_company = Company.objects.create(name='Otra Empresa', owner=self.otro_gerente)

        self.branch = Branch.objects.create(
            name='Sucursal Centro',
            company=self.company,
            school_id=1,
            location='Edificio A',
        )
        Branch.objects.create(
            name='Sucursal Inactiva',
            company=self.company,
            school_id=1,
            active=False,
        )

    def _auth_as(self, user):
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')

    def test_unauthenticated_request_is_rejected(self):
        response = self.client.get(self.url, {'company_id': self.company.id})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_company_id_returns_400(self):
        self._auth_as(self.gerente)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_numeric_company_id_returns_400(self):
        self._auth_as(self.gerente)
        response = self.client.get(self.url, {'company_id': 'abc'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_gerente_user_is_forbidden(self):
        self._auth_as(self.cliente)
        response = self.client.get(self.url, {'company_id': self.company.id})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_company_not_owned_by_gerente_returns_404(self):
        self._auth_as(self.gerente)
        response = self.client.get(self.url, {'company_id': self.other_company.id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_returns_active_branches_for_owned_company(self):
        self._auth_as(self.gerente)
        response = self.client.get(self.url, {'company_id': self.company.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], self.branch.name)
        self.assertEqual(response.data[0]['company_name'], self.company.name)
