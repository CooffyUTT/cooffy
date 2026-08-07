from django.urls import reverse
from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company
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
