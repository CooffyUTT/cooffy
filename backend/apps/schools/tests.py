from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company, CompanySchool
from apps.schools.models import School
from apps.users.models import User


class SchoolScopeTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.school_admin = User.objects.create_user(
            user="admin-one@example.com",
            name="School Admin",
            password="password",
        )
        cls.other_admin = User.objects.create_user(
            user="admin-two@example.com",
            name="Other Admin",
            password="password",
        )
        admin_group = Group.objects.create(name="admin_escolar")
        cls.school_admin.groups.add(admin_group)
        cls.other_admin.groups.add(admin_group)

        cls.school = School.objects.create(
            admin=cls.school_admin,
            full_name="First School",
            short_name="First",
        )
        cls.other_school = School.objects.create(
            admin=cls.other_admin,
            full_name="Second School",
            short_name="Second",
        )

    def test_school_admin_only_lists_active_schools_they_administer(self):
        School.objects.create(
            admin=self.school_admin,
            full_name="Inactive School",
            short_name="Inactive",
            active=False,
        )
        self.client.force_authenticate(user=self.school_admin)

        response = self.client.get(reverse("school-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"][0]["id"], self.school.id)

    def test_school_admin_cannot_see_another_admins_school(self):
        self.client.force_authenticate(user=self.school_admin)

        response = self.client.get(
            reverse("school-detail", args=[self.other_school.id]),
        )

        self.assertEqual(response.status_code, 404)


class BranchScopeTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.school_admin = User.objects.create_user(
            user="branch-admin@example.com",
            name="Branch Admin",
            password="password",
        )
        cls.manager = User.objects.create_user(
            user="branch-manager@example.com",
            name="Branch Manager",
            password="password",
        )
        admin_group = Group.objects.create(name="admin_escolar")
        manager_group = Group.objects.create(name="gerente")
        cls.school_admin.groups.add(admin_group)
        cls.manager.groups.add(manager_group)

        cls.school = School.objects.create(
            admin=cls.school_admin,
            full_name="Branch School",
            short_name="Branch",
        )
        cls.company = Company.objects.create(name="Coffee Company", owner=cls.manager)
        CompanySchool.objects.create(company=cls.company, school=cls.school)
        cls.branch = Branch.objects.create(
            name="Main Branch",
            company=cls.company,
            school=cls.school,
        )

    def test_school_admin_can_create_branch_for_linked_company(self):
        self.client.force_authenticate(user=self.school_admin)

        response = self.client.post(
            reverse("branch-list"),
            {
                "name": "Second Branch",
                "company": self.company.id,
                "location": "North building",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            Branch.objects.filter(
                name="Second Branch",
                school=self.school,
                company=self.company,
            ).exists()
        )

    def test_manager_sees_only_active_branches_of_owned_company(self):
        self.branch.active = False
        self.branch.save(update_fields=["active"])
        self.client.force_authenticate(user=self.manager)

        response = self.client.get(reverse("branch-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_school_admin_can_deactivate_branch(self):
        self.client.force_authenticate(user=self.school_admin)

        response = self.client.delete(
            reverse("branch-detail", args=[self.branch.id]),
        )

        self.assertEqual(response.status_code, 200)
        self.branch.refresh_from_db()
        self.assertFalse(self.branch.active)
