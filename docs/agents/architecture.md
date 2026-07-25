# Architecture — Cooffy

You are the **architect** for the Cooffy repo. Produce plans and design guidance read-only; do not edit code. Current state + the planned seams. Read-only planning doc. Pair with `AGENTS.md`, `backend-guide.md`, `frontend-guide.md`. Verify against the codebase before trusting.

## Current topology

```
┌─────────────────────────┐         ┌─────────────────────────────┐
│  Next 16 (frontend)     │         │  Django 6 + DRF (backend)   │
│  mock-first             │         │  Postgres-only              │
│                         │         │                             │
│  Routes:                │         │  URL prefixes:              │
│  /        (login/home)  │  HTTP   │  /admin/                    │
│  /menu    (client menu) │ ──NOT──>│  /api/auth/ (users)         │
│  /kitchen (kanban, mock)│  wired  │  /api/menu/ (products, RO)  │
│  /manager (branches mock)         │  /media/ (dev only)         │
│  /register              │         │                             │
└─────────────────────────┘         └─────────────────────────────┘
        │                                       │
        └─ src/lib/api.ts (axios) exists but     └─ apps/orders/ scaffolded
           is imported by NO feature.              but NOT wired (no apps.py,
        └─ data/mockOrders.ts, mockBranches.ts      not installed, no URLs).
           and inline arrays feed the UI.
```

Key facts an architect must internalize:
- **Frontend↔backend link is not built.** Frontend runs on mocks (`data/mock*`, inline arrays) and `setTimeout` stubs in `useLoginForm`/`useRegisterForm`. `api.ts` is scaffolding.
- **`apps.orders` is scaffolded only** — just a `migrations/` dir. No models, no serializers, no views, no URLs, not installed.
- Backend is **Postgres-only** (`ArrayField` in products; no SQLite fallback). Database hardcoded in `config/settings.py:94`.
- Auth is **SimpleJWT** (access 30m, refresh 14d, **no rotation/blacklist**). Custom `User` with `USERNAME_FIELD='user'` (string, email or username); `is_active` is a property over `active`. Roles = Django `Group` ("cliente").
- Products API is **read-only** (`ReadOnlyModelViewSet` list/retrieve). Writes happen only via Django admin. `Product.save()` auto-converts images to WEBP.
- Frontend has **no provider wrapping** (`layout.tsx` renders children raw); no `QueryClientProvider`, no auth provider. TanStack Query / Zustand / rhf+zod are installed but unused.
- Two pnpm lockfiles (root + `frontend/`). Backend run via `uv --directory backend` from root; `.env` at root only.

## Architectural seams / where to open the next fronts

### 1. Wire `apps.orders` (backend)
Order is the natural next app — the kitchen kanban and cart checkout both depend on it.
- Folder already at `backend/apps/orders/` (only `migrations/`). Add `__init__.py`, `apps.py` (`AppConfig`, `name='apps.orders'`, `default_auto_field`), `models.py`, `serializers.py`, `views.py`, `urls.py`, `admin.py`, `tests.py`.
- Register in `INSTALLED_APPS` (`config/settings.py:42`).
- Include URLs in `config/urls.py` under `api/orders/`.
- Follow existing patterns: `ReadOnlyModelViewSet` where read-only, per-action serializers, `IsAuthenticated` (global default unless overridden), Spanish error messages, `Group`-based roles (a `"cocina"` group for kitchen staff? `"gerente"` for managers?).
- Suggested model shape (align with `docs/database/database.dbml` — read it first): `Order`, `OrderItem`, `OrderItemModifier` (types exist at `frontend/src/types/kitchen.ts`). Reuse the `OrderStatus` flow already implied by the kitchen kanban: *pending → preparing → ready → delivered*. Use Postgres features freely; keep `CheckConstraint`s like products does.
- Add a `seed_orders` dev-only management command mirroring `seed_products` (guard on `DJANGO_ENV`, `--clear` flag, no network dependency ideally — use product FKs by name).

### 2. Frontend↔backend integration (frontend)
See `frontend-guide.md` "Roadmap" for the checklist. Architect-level decisions:
- **Token storage**: decide httpOnly cookie vs `localStorage`. Backend uses `withCredentials: true` + `CORS_ALLOW_CREDENTIALS = True` already; SimpleJWT access in `Authorization: Bearer`. Pick one and keep the refresh strategy consistent. If you enable `ROTATE_REFRESH_TOKENS` backend-side, route 401 → refresh → retry in an axios response interceptor.
- **Where the `QueryClientProvider` lives**: wrap children in `layout.tsx`, instantiate `QueryClient` in a client boundary. Add an `app/providers.tsx` so server-component `layout.tsx` stays clean.
- **Data fetching convention**: TanStack Query for server state, Zustand only for ephemeral UI state if needed (cart currently lives in `CartContext` — decide whether to keep it as Context or move to Zustand as the app grows; don't over-engineer for MVP).
- **Forms**: when migrating `useLoginForm`/`useRegisterForm` to real API calls, opportunistically move to `react-hook-form` + `zod` (already installed) to retire the bespoke validators. Keep the `.edu.mx` regex consistent with `apps/users/serializers.py:41`.
- **Image domains**: any new product image source must be added to `next.config.ts` `remotePatterns`. Backend `Product.save()` normalizes uploads to WEBP — frontend can rely on `/media/products/<uuid>.webp` URLs.
- **i18n**: UI is Spanish, `<html lang="en">` — open a small task to set `lang="es"` and document the choice, or introduce `next-intl` if multi-language is a goal (probably out of scope for MVP).

### 3. Manager module (backend + frontend)
`/manager` currently runs on `mockBranches.ts`. The backend has no `Branch` model. Decisions to make before building:
- Multi-branch is in the product requirements (read `docs/requerimientos.md`, `docs/mvp_1.md`); pick whether `Branch` owns `Product`s (per-branch menu) or products stay global and branch is just on the order. Check `docs/database/database.dbml` for the intended design.
- Manager endpoints likely need a `"gerente"` Group + `IsAuthenticated` + a custom permission (e.g. `IsManagerGroup`). Don't roll a custom Role model; reuse `Group`.

### 4. Non-dev environments
- `DJANGO_ENV` controls DEBUG + CORS. Staging/prod need `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (don't forget to add the frontend origin, e.g. `http://localhost:3000` / prod domain). SimpleJWT `ROTATE_REFRESH_TOKENS` / `BLACKLIST_AFTER_ROTATION` (and add `rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS`) should be decided before prod.
- Media in prod is served by a reverse proxy / CDN, not Django — don't ship `static(MEDIA_URL, ...)` to prod.
- `DEBUG = True` falls back to `CORS_ALLOW_ALL_ORIGINS=True` — never deploy with `DJANGO_ENV=development`.

## Test strategy (currently zero tests on both sides)
- Backend: use Django's `TestCase` + `pnpm back:manage test`. Start with `apps.users` (login/register token issuance, `.edu.mx` acceptance, `is_active` property behavior) and `apps.products` (read-only endpoints, `ArrayField`, `save()` WEBP behavior with a tiny fixture). Don't introduce pytest without team agreement.
- Frontend: no framework chosen. Decide (Vitest + Testing Library is the Next-16-aligned pick) and add config + a `test` script before writing tests — don't sprinkle test files without a runner.
- Integration: Bruno collections (`bruno/collections/Auth`, `Products`) exist; wire `bru` runs into CI as a smoke test before adding unit tests everywhere.

## What NOT to over-build (school project guardrails)
- Don't introduce microservices, separate repos, or codegen layers. Monorepo is fine.
- Don't add pytest/ruff/black, Cursor rules, or other tool configs the team hasn't agreed on — keep the toolchain minimal.
- Don't migrate state management globally until something forces it; the mock-first stage is acceptable for MVP.
- Don't build a custom Role/Permission model; Django `Group` is the intended pattern.
- Don't loosen `requirements.txt` exact pins or add `psycopg` v3 alongside `psycopg2-binary` without a migration plan.

## Reference docs in this repo
- `docs/database/db_tables.md`, `docs/database/database.dbml` — intended DB design (source of truth for model shapes).
- `docs/mvp_1.md`, `docs/requerimientos.md`, `docs/requerimientos/` — product requirements.
- `bruno/collections/` — versioned API requests (Auth, Products).