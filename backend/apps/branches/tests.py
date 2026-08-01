from django.contrib.auth.models import Group

from rest_framework.test import APITestCase

from apps.branches.models import Branch, Company, CompanySchool
from apps.schools.models import School
from apps.users.models import User


def create_group(name):
    group, _ = Group.objects.get_or_create(name=name)
    return group


class BranchPermissionsTests(APITestCase):
    def setUp(self):
        manager_group = create_group('gerente')
        school_admin_group = create_group('admin_escolar')
        client_group = create_group('cliente')

        self.school_admin = User.objects.create_user(
            user='school_admin_test', password='admin123', name='María'
        )
        self.school_admin.groups.set([school_admin_group])
        self.other_school_admin = User.objects.create_user(
            user='other_school_admin_test', password='admin123', name='Pedro'
        )
        self.other_school_admin.groups.set([school_admin_group])
        self.manager = User.objects.create_user(
            user='manager_test', password='admin123', name='Juan'
        )
        self.manager.groups.set([manager_group])
        self.customer = User.objects.create_user(
            user='client_test', password='admin123', name='Ana'
        )
        self.customer.groups.set([client_group])

        self.school = School.objects.create(
            admin=self.school_admin,
            full_name='Universidad de Prueba',
            short_name='UP',
        )
        self.other_school = School.objects.create(
            admin=self.other_school_admin,
            full_name='Otra Universidad',
            short_name='OU',
        )
        self.company = Company.objects.create(name='Café Prueba', owner=self.manager)
        self.other_company = Company.objects.create(
            name='Otra Empresa', owner=self.manager
        )
        CompanySchool.objects.create(company=self.company, school=self.school)
        CompanySchool.objects.create(
            company=self.other_company, school=self.other_school
        )

        self.branch = Branch.objects.create(
            name='Cafetería Central', company=self.company, school=self.school
        )
        self.inactive_branch = Branch.objects.create(
            name='Cafetería Antigua',
            company=self.company,
            school=self.school,
            active=False,
        )
        self.other_branch = Branch.objects.create(
            name='Cafetería Otra',
            company=self.other_company,
            school=self.other_school,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_school_admin_sees_only_own_school_branches_including_inactive(self):
        self.authenticate(self.school_admin)
        response = self.client.get('/api/branches/')
        self.assertEqual(response.status_code, 200)
        ids = [branch['id'] for branch in response.json()]
        self.assertIn(self.branch.id, ids)
        self.assertIn(self.inactive_branch.id, ids)
        self.assertNotIn(self.other_branch.id, ids)

    def test_school_admin_lists_only_linked_companies(self):
        self.authenticate(self.school_admin)
        response = self.client.get('/api/branches/companies/')
        self.assertEqual(response.status_code, 200)
        ids = [company['id'] for company in response.json()['results']]
        self.assertIn(self.company.id, ids)
        self.assertNotIn(self.other_company.id, ids)

    def test_school_admin_filter_by_linked_and_unlinked_company(self):
        self.authenticate(self.school_admin)
        linked = self.client.get(f'/api/branches/?company_id={self.company.id}')
        unlinked = self.client.get(
            f'/api/branches/?company_id={self.other_company.id}'
        )
        self.assertEqual(linked.status_code, 200)
        self.assertIn(self.branch.id, [branch['id'] for branch in linked.json()])
        self.assertEqual(unlinked.status_code, 404)

    def test_manager_sees_only_active_branches_of_owned_companies(self):
        self.authenticate(self.manager)
        response = self.client.get('/api/branches/')
        self.assertEqual(response.status_code, 200)
        ids = [branch['id'] for branch in response.json()]
        self.assertIn(self.branch.id, ids)
        self.assertIn(self.other_branch.id, ids)
        self.assertNotIn(self.inactive_branch.id, ids)

    def test_school_admin_can_create_branch_for_linked_company(self):
        self.authenticate(self.school_admin)
        response = self.client.post(
            '/api/branches/',
            {
                'name': 'Nueva Cafetería',
                'company': self.company.id,
                'location': 'Edificio C',
                'schedule': '09:00 - 17:00',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        created = Branch.objects.get(id=response.data['id'])
        self.assertEqual(created.school_id, self.school.id)
        self.assertTrue(created.active)

    def test_school_admin_cannot_create_branch_for_unlinked_company(self):
        self.authenticate(self.school_admin)
        response = self.client.post(
            '/api/branches/',
            {'name': 'Sucursal no autorizada', 'company': self.other_company.id},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_school_admin_can_update_branch(self):
        self.authenticate(self.school_admin)
        response = self.client.patch(
            f'/api/branches/{self.branch.id}/',
            {'name': 'Sucursal actualizada'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.branch.refresh_from_db()
        self.assertEqual(self.branch.name, 'Sucursal actualizada')

    def test_school_admin_can_deactivate_branch(self):
        self.authenticate(self.school_admin)
        response = self.client.delete(f'/api/branches/{self.branch.id}/deactivate/')
        self.assertEqual(response.status_code, 200)
        self.branch.refresh_from_db()
        self.assertFalse(self.branch.active)

    def test_manager_cannot_create_branch(self):
        self.authenticate(self.manager)
        response = self.client.post(
            '/api/branches/',
            {'name': 'Sucursal gerente', 'company': self.company.id},
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_client_cannot_access_branches(self):
        self.authenticate(self.customer)
        response = self.client.get('/api/branches/')
        self.assertEqual(response.status_code, 403)
