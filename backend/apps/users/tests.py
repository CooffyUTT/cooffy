from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company
from apps.schools.models import School
from apps.users.models import User


class AuthenticationTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            user="client@school.edu.mx",
            name="Client",
            password="correct-password",
        )
        cls.client_group = Group.objects.create(name="cliente")
        cls.user.groups.add(cls.client_group)

    def test_user_can_login_with_valid_credentials(self):
        response = self.client.post(
            reverse("login"),
            {"user": self.user.user, "password": "correct-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["id"], self.user.id)

    def test_login_rejects_invalid_password(self):
        response = self.client.post(
            reverse("login"),
            {"user": self.user.user, "password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_login_rejects_inactive_user(self):
        self.user.active = False
        self.user.save(update_fields=["active"])

        response = self.client.post(
            reverse("login"),
            {"user": self.user.user, "password": "correct-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)


class ClientRegistrationTests(APITestCase):
    def test_client_can_register_with_institutional_email(self):
        school = School.objects.create(
            full_name='Registration School',
            short_name='REG',
            domain_address='school.edu.mx',
        )
        response = self.client.post(
            reverse("user-register"),
            {
                "user": "new-client@school.edu.mx",
                "name": "New Client",
                "password": "strong-password",
                "school_id": school.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(user="new-client@school.edu.mx")
        self.assertTrue(user.groups.filter(name="cliente").exists())

    def test_client_registration_rejects_non_institutional_email(self):
        response = self.client.post(
            reverse("user-register"),
            {
                "user": "new-client@example.com",
                "name": "New Client",
                "password": "strong-password",
                "school_id": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("non_field_errors", response.data)


class ClientDomainRegistrationTests(APITestCase):
    """RF-02: el correo debe pertenecer al dominio institucional de la escuela."""

    @classmethod
    def setUpTestData(cls):
        cls.school = School.objects.create(
            full_name="Domain School",
            short_name="DOM",
            domain_address="utt.edu.mx",
        )

    def _register(self, email, school_id):
        return self.client.post(
            reverse("user-register"),
            {
                "user": email,
                "name": "Student",
                "password": "strong-password",
                "school_id": school_id,
            },
            format="json",
        )

    def test_client_registration_accepts_email_matching_school_domain(self):
        response = self._register("student@utt.edu.mx", self.school.id)

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            User.objects.filter(user="student@utt.edu.mx", school=self.school).exists()
        )

    def test_client_registration_accepts_email_domain_case_insensitive(self):
        response = self._register("Student@UTT.EDU.MX", self.school.id)

        self.assertEqual(response.status_code, 201)

    def test_client_registration_rejects_email_domain_not_matching_school(self):
        response = self._register("student@other.edu.mx", self.school.id)

        self.assertEqual(response.status_code, 400)
        self.assertIn("non_field_errors", response.data)
        self.assertFalse(
            User.objects.filter(user="student@other.edu.mx").exists()
        )

    def test_client_registration_rejects_school_without_domain(self):
        school_no_domain = School.objects.create(
            full_name="No Domain School",
            short_name="NODOM",
        )

        response = self._register("student@nodom.edu.mx", school_no_domain.id)

        self.assertEqual(response.status_code, 400)
        self.assertIn("non_field_errors", response.data)

    def test_client_registration_rejects_unknown_school(self):
        response = self._register("student@utt.edu.mx", 999999)

        self.assertEqual(response.status_code, 400)
        self.assertIn("school_id", response.data)


class UserAccessTests(APITestCase):
    def test_user_list_requires_authentication(self):
        response = self.client.get(reverse("user-list"))

        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_filter_users_by_role(self):
        user = User.objects.create_user(
            user="manager@school.edu.mx",
            name="Manager",
            password="password",
        )
        manager_group = Group.objects.create(name="gerente")
        user.groups.add(manager_group)
        self.client.force_authenticate(user=user)

        response = self.client.get(reverse("user-list"), {"role": "gerente"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [user.id])


class UserPermissionsTests(APITestCase):
    """RF-02 RN-23: restricciones de permisos para administración de usuarios."""

    @classmethod
    def setUpTestData(cls):
        cls.school = School.objects.create(
            full_name="Test School", short_name="TS", domain_address="test.edu.mx"
        )
        cls.other_school = School.objects.create(
            full_name="Other School", short_name="OS", domain_address="other.edu.mx"
        )

        cls.gerente_group, _ = Group.objects.get_or_create(name="gerente")
        cls.cliente_group, _ = Group.objects.get_or_create(name="cliente")
        cls.empleado_group, _ = Group.objects.get_or_create(name="empleado")
        Group.objects.get_or_create(name="admin_escolar")

        cls.gerente = User.objects.create_user(
            user="gerente@test.edu.mx", name="Gerente", password="password"
        )
        cls.gerente.groups.add(cls.gerente_group)

        cls.company = Company.objects.create(name="Co A", owner=cls.gerente)
        cls.branch = Branch.objects.create(
            name="Sucursal A", company=cls.company, school=cls.school
        )

        cls.employee = User.objects.create_user(
            user="empleado@test.edu.mx", name="Empleado", password="password",
            branch=cls.branch, school=cls.school,
        )
        cls.employee.groups.add(cls.empleado_group)

        cls.client_user = User.objects.create_user(
            user="cliente@test.edu.mx", name="Cliente", password="password",
            school=cls.school,
        )
        cls.client_user.groups.add(cls.cliente_group)

        cls.other_gerente = User.objects.create_user(
            user="gerente2@test.edu.mx", name="Gerente2", password="password"
        )
        cls.other_gerente.groups.add(cls.gerente_group)

        cls.other_company = Company.objects.create(name="Co B", owner=cls.other_gerente)
        cls.other_branch = Branch.objects.create(
            name="Sucursal B", company=cls.other_company, school=cls.other_school
        )
        cls.other_employee = User.objects.create_user(
            user="otro_emp@test.edu.mx", name="OtroEmp", password="password",
            branch=cls.other_branch, school=cls.other_school,
        )
        cls.other_employee.groups.add(cls.empleado_group)

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_cliente_cannot_list_users(self):
        self._auth(self.client_user)
        response = self.client.get(reverse("user-list"))
        self.assertEqual(response.status_code, 403)

    def test_cliente_cannot_update_another_user(self):
        self._auth(self.client_user)
        response = self.client.patch(
            reverse("user-detail", args=[self.employee.id]),
            {"name": "Hacked"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_gerente_can_list_users_in_scope(self):
        self._auth(self.gerente)
        response = self.client.get(reverse("user-list"))
        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.data]
        self.assertIn(self.employee.id, ids)

    def test_gerente_cannot_see_users_from_other_company(self):
        self._auth(self.gerente)
        response = self.client.get(reverse("user-list"))
        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.data]
        self.assertNotIn(self.other_employee.id, ids)

    def test_gerente_cannot_deactivate_self(self):
        self._auth(self.gerente)
        response = self.client.delete(reverse("user-detail", args=[self.gerente.id]))
        self.assertEqual(response.status_code, 403)

    def test_gerente_cannot_deactivate_another_gerente(self):
        self._auth(self.gerente)
        response = self.client.delete(reverse("user-detail", args=[self.other_gerente.id]))
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_cannot_list(self):
        response = self.client.get(reverse("user-list"))
        self.assertEqual(response.status_code, 401)
