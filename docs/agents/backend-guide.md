# Backend guide — Django + DRF

You are the **backend** specialist for the Cooffy repo (Django 6 + DRF + SimpleJWT, Postgres-only). Implement Django/DRF work; follow this guide exactly. Quick, repo-specific cheatsheet. Pair with `AGENTS.md` for run commands and repo shape. Verify against the codebase before trusting — this is a shortcut, not a spec.

## Structure
- Entry package: `config` (`config.settings`, `config.urls`). CWD = `backend/` when run via `uv --directory backend`.
- Apps live under `backend/apps/<name>/`, each with the standard `models.py / serializers.py / views.py / urls.py / admin.py / tests.py / migrations/` + optional `management/commands/`.
- Only `apps.users` and `apps.products` are wired into `INSTALLED_APPS`. **`apps/orders/` exists as a scaffolded empty folder** — not in `INSTALLED_APPS`, no `apps.py`, no models, no URL include. Do not treat it as a working app.

## config/settings.py quirks
- `DJANGO_ENV` (`config/settings.py:20`) is the master toggle. `DEBUG = (DJANGO_ENV == 'development')` — anything else is non-debug.
- `INSTALLED_APPS` (`:42`): includes `django.contrib.postgres` (required by `ArrayField` in products).
- `AUTH_USER_MODEL = 'users.User'` (`:148`).
- DRF defaults (`:151`): only `JWTAuthentication` (no SessionAuth), global `IsAuthenticated`, `PageNumberPagination`, `PAGE_SIZE = 20`. No throttle classes, no default filter backends (set per-view in products).
- SimpleJWT (`:165`): access 30 min, **refresh 14 days**, `AUTH_HEADER_TYPES = ('Bearer',)`. No `ROTATE_REFRESH_TOKENS` / `BLACKLIST_AFTER_ROTATION` — be explicit if you want rotation.
- CORS (`:172`): in dev `CORS_ALLOW_ALL_ORIGINS=True` ignores the env list. Out of dev the env-list default points at **port 8000 (backend)**, not 3000 (frontend) — set `CORS_ALLOWED_ORIGINS` to include the Next origin.
- `AUTH_PASSWORD_VALIDATORS` are the Django defaults but they **only run on built-in flows** (admin, `createsuperuser`, `create_user`). The `CreateClientSerializer` only enforces `min_length=8` + the `.edu.mx` regex — it does NOT get `UserAttributeSimilarityValidator` etc.
- `MEDIA_ROOT = BASE_DIR / 'media'` (`:145`); `backend/media/` is gitignored.
- Database is hardcoded Postgres (`:94`); **no SQLite fallback**.

## config/urls.py routes
| Prefix | Include |
|---|---|
| `admin/` | `admin.site.urls` |
| `api/auth/` | `apps.users.urls` |
| `api/menu/` | `apps.products.urls` |
| `/media/` | dev-only static serve |

No bare `/api/`, no `api/orders/`, no DRF browsable root (routers are at app level).

## apps.users — auth quirks (high trap density)
- Custom `User` (`apps/users/models.py:39`): `USERNAME_FIELD = 'user'` (a single string — email OR username), **not** email. Manager keys on `user=`.
- **`is_active` is a `@property` returning `self.active`** (`models.py:62`). There is no `is_active` DB column. Mutate `active`, never `is_active`. Admin/forms keyed on `is_active` will not work.
- Roles use Django's standard auth **`Group`** (e.g. `"cliente"`), not a Role model. Don't invent a Role model. `CreateClientSerializer.create` (`apps/users/serializers.py:50`) adds new clients to the `"cliente"` group via `get_or_create`.
- `LoginSerializer` (`serializers.py:6`) is not a `ModelSerializer`; it does manual lookup + `check_password`, stores the user on `data['user_obj']`, raises generic `"Credenciales inválidas"`.
- `CreateClientSerializer` (`serializers.py:27`): `user` is an **EmailField** with a strict `.edu.mx` regex (`:41`): `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.mx$`. Only institutional emails register as clients.
- Views (`apps/users/views.py`): both override global `IsAuthenticated`/JWT with `permission_classes=[AllowAny]`, `authentication_classes=[]`.
  - `LoginView` `POST /api/auth/login/` → returns 401 (not 400) on bad credentials, `{message, access, refresh, user}` on success.
  - `CreateClientView` `POST /api/auth/register/` → 201 and **auto-issues tokens** (newly registered users are logged in).
  - `POST /api/auth/refresh/` → SimpleJWT `TokenRefreshView`.
- Responses and error messages are in **Spanish**. Keep that convention.

## apps.products — models & API
- `Product` (`apps/products/models.py:11`): standard model, **no FK relationships**, no owner/created_by (products are global).
  - `modifiers = ArrayField(CharField(max_length=50), null=True, blank=True)` (`:18`) — `django.contrib.postgres.fields.ArrayField`. **Postgres-only; will not run on SQLite.**
  - Two `CheckConstraint`s in Meta (`:25`): `price > 0` and (`max_per_order > 0` OR null).
  - **`save()` silently re-encodes every image to WEBP 800x800 (LANCZOS, quality 85)** (`:34-57`), renamed to `uuid4().webp`. The original file/format is **discarded**. Re-saving an existing Product re-runs this conversion (quality loss + new uuid). Be careful with bulk re-saves.
- Serializers (`apps/products/serializers.py`): `ProductMenuListSerializer` (id/name/price/image) and `ProductMenuDetailSerializer` (adds description/modifiers). **No write serializer** — products are read-only through the API.
- `ProductMenuView` (`apps/products/views.py:10`): `ReadOnlyModelViewSet` → only `list` + `retrieve`. `queryset = Product.objects.filter(active=True)` (inactive hidden at ORM level). `filter_backends = [SearchFilter, OrderingFilter]`, `search_fields=['name','description']`, `ordering_fields=['name','price','created_at']`, default `ordering=['name']`. `get_serializer_class` (`:21`) returns a different serializer per action.
- Routes (`apps/products/urls.py`): `DefaultRouter` registers `products` → `product-menu` basename. Endpoints: `GET /api/menu/products/` (paginated 20, searchable, orderable), `GET /api/menu/products/{id}/`. No create/update/delete — those only exist via Django admin.

## Admin
- `apps/users/admin.py`: custom `UserAdmin(BaseUserAdmin)`, `readonly_fields=('created_at','updated_at')`, `ordering=('-created_at',)`. The add form uses `password1`/`password2` and does **not** include `school_id`.
- `apps/products/admin.py`: `ProductAdmin(ModelAdmin)`, `readonly_fields=('created_at','updated_at')`. **Admin `save()` triggers the PIL→WEBP conversion too** — admin uploads are also normalized.

## Management commands (dev-only)
Both abort unless `DJANGO_ENV == 'development'`.
- `pnpm back:manage seed_dev` → `admin / admin123` (`--force` recreates).
- `pnpm back:manage seed_products` → 10 demo products. **Downloads images from `images.unsplash.com`** via the `requests` lib at seed time (`seed_products.py:102`). On failure, skips the image but still creates the product. Offline seeding silently drops images.

## Dependencies
- `requirements.txt` is **exact `==` pinned** for all 16 packages incl. transitives (asgiref, sqlparse, urllib3, certifi, idna, charset-normalizer, tzdata). Preserve exact versions when bumping; don't switch to ranges.
- Notable deps with real usage:
  - `pillow` — `Product.save()` WEBP conversion.
  - `requests` — only used by `seed_products` to fetch Unsplash images.
  - `python-decouple` — `AutoConfig` reads `.env` from CWD upward (root `.env` only — don't create `backend/.env`).
  - `psycopg2-binary` (legacy v2, not `psycopg` v3).

## Tests & lint
- `apps/*/tests.py` are 3-line stubs. Only runner: `pnpm back:manage test` (collects zero tests today).
- **No pytest, no ruff, no black, no coverage config.** Don't invent them. If you add tests, use Django's `TestCase` and the `pnpm back:manage test` runner.

## When wiring new apps (e.g. `apps.orders`)
1. Add `apps.py` with an `AppConfig`, set `name='apps.orders'` (and `default_auto_field`).
2. Add `__init__.py` (and one inside `migrations/`).
3. Register in `INSTALLED_APPS` (`config/settings.py:42`).
4. Add `urls.py` and `include('apps.orders.urls')` in `config/urls.py` under a new prefix (e.g. `api/orders/`).
5. `pnpm back:manage makemigrations orders && pnpm back:manage migrate`.
6. Models using `ArrayField` etc. are Postgres-only; keep that in mind.
7. Follow the existing serializer/view patterns (`ReadOnlyModelViewSet`, per-action serializers, Spanish error messages, `Group`-based roles).