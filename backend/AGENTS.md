# Backend Rules

## Stack and commands

- Django 6.0.7, Django REST Framework and SimpleJWT.
- Python `>=3.14`, managed with `uv`; dependencies are in `pyproject.toml` and
  the committed `uv.lock`. There is no `requirements.txt`.
- Run backend commands from the repository root through `pnpm back:*`.
- Use `pnpm back:manage makemigrations`, `migrate`, `seed` and `test` as needed.
- PostgreSQL is required. Do not use SQLite test setups because products use
  PostgreSQL `ArrayField`.
- `DJANGO_ENV` controls development behavior; `POSTGRES_*` configures the
  database. Non-development deployments require `DJANGO_SECRET_KEY`,
  `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.

## Application

- Django entry package: `config/`; apps: `apps.users`, `apps.products`,
  `apps.branches`, `apps.orders` and `apps.schools`.
- API prefixes: `/api/auth/`, `/api/menu/`, `/api/branches/`, `/api/orders/`
  and `/api/schools/`. Admin is at `/admin/`.
- Development media is served at `/media/`; production expects a proxy or CDN.
- DRF defaults use JWT authentication, global `IsAuthenticated`, page size 20,
  30-minute access tokens and 14-day refresh tokens.

## Users and authorization

- Custom model is `apps.users.User`; `AUTH_USER_MODEL` is `users.User`.
- `USERNAME_FIELD` is `user`, not email. The manager also uses `user=`.
- `is_active` is a property over the `active` field.
- Seed groups include `gerente`, `cliente`, `empleado` and `admin_escolar`.
- Branch manager permissions allow only `gerente`; order views restrict clients
  by `client_id` unless the user is staff.
- Product management endpoints use `IsManagerOrSupervisor`
  (`apps/products/permissions.py`), which allows `gerente` or `supervisor`; the seed does not create a `supervisor` group.
- School endpoints require authentication; school viewset querysets scope
  non-staff users to schools whose `admin_id` matches their user id.

## Products and seeds

- Product saves convert uploaded images to WEBP at 800x800, quality 85.
- Product management CRUD lives at `/api/menu/manage/products/`
  (`ProductManageViewSet`); it includes a `PATCH /{id}/toggle-active/` action
  to enable/disable products.
- Seeds are development-only and require `DJANGO_ENV=development`.
- `pnpm back:manage seed` runs users, branches and products; use `--force` to
  recreate users.
- Product seeding downloads images from Unsplash and may skip images offline.

## Constraints

- `.env` is at the repository root; never create `backend/.env`.
- No backend lint, formatter or meaningful test suite is configured. Do not
  invent pytest or ruff configuration.
