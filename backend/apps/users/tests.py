from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APITestCase

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
