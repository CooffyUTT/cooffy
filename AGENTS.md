# AGENTS.md

Guidance for AI Agents sessions (ClaudeCode, OpenCode, GithubCopilot) working in the Cooffy repo (school project: Django + Next.js cafeteria ordering system). Verify against the codebase before trusting; this file is a shortcut, not a spec.

## Repo shape

Monorepo, two pnpm-ish packages plus a Django app:

- `backend/` — Django 6.0.7 + DRF + SimpleJWT, run via `uv` (Python 3.14, `requires-python = ">=3.14"` in `pyproject.toml`). Entry package is `config` (`config.settings`, `config.urls`); apps live under `backend/apps/`. Dependencies live in `backend/pyproject.toml`; the resolved lockfile `backend/uv.lock` is **committed** for reproducible installs. There is no `requirements.txt` — adding/removing deps is done in `pyproject.toml` (or with `uv add` / `uv remove`) followed by `uv lock`.
- `frontend/` — Next.js 16 (App Router) + React 19 + Tailwind 4, its own `package.json` and `pnpm-lock.yaml`.
- `bruno/` — versioned API request collections (Bruno CLI is a devDependency at root).
- `docs/` — requirements, architecture, DB diagram (`docs/database/`). No codegen.

There are **two pnpm lockfiles** (root and `frontend/`). Use `pnpm install:all` (or `pnpm install && pnpm front:install && pnpm back:install`), not a single `pnpm install`.

## Running things — use the root pnpm scripts, do not `cd` manually

All commands run from repo root on `package.json`. Backend is invoked through `uv --directory backend`, so CWD for Django is `backend/` even though you run from root.

- `pnpm init:all` — install everything, up Postgres, migrate, seed, start dev servers (one-shot first run).
- `pnpm dev` — start backend + frontend together (via `concurrently`).
- `pnpm front` / `pnpm back` — start one side. `pnpm back` = `manage.py runserver`.
- `pnpm front:lint` / Execute two checks: the lint on frontend side (replace `pnpm --dir frontend lint`) and execute `tsc --noEmit`.
- `pnpm front:typecheck` / Validate TS types with `pnpm --dir frontend typecheck` (`tsc --noEmit`).
- `pnpm back:manage <args>` — proxy for `python manage.py <args>` (e.g. `pnpm back:manage makemigrations`).
- `pnpm front:install` — run `pnpm install` on `frontend/` directory.
- `pnpm back:install` — runs `uv sync` in `backend/`: creates `backend/.venv` if missing, installs the exact versions from `uv.lock`, and prunes anything not in `pyproject.toml`. Use `uv add <pkg>` / `uv remove <pkg>` (or edit `pyproject.toml` and run `pnpm back:lock`) to change deps.

Postgres is required and runs only via `docker compose up -d` (docker-compose.yml at root). The backend cannot start without it.

## Environment

`.env` lives at the **repo root and is gitignored**. Copy from `.env.example`. Do not create `backend/.env` — `python-decouple` (`AutoConfig`) searches from CWD upward, so when backend runs via `uv --directory backend` it still resolves the root `.env`.

Key vars: `DJANGO_ENV` (controls `DEBUG` and CORS behavior), `POSTGRES_*`, `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`, consumed by `frontend/src/lib/api.ts`). In non-dev, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS` must be set.

## Backend notes

- **Entry**: `config/` package; `INSTALLED_APPS` wires `apps.users`, `apps.products`, `apps.branches`, `apps.orders` (still working).
- **URL prefixes** (`config/urls.py`): `/admin/`, `/api/auth/` (login, refresh, register, user list), `/api/menu/products/`, `/api/branches/`, `/api/orders/`. Media served under `/media/` in dev only (not in prod — expect a reverse proxy/CDN).
- **Custom user model** `apps.users.User`, `AUTH_USER_MODEL = 'users.User'`, with `USERNAME_FIELD = 'user'` (a single string field — email or username), **not** email. The `User` manager keys on `user=`. `is_active` is a `@property` over the `active` boolean field.
- **Groups** (created by `seed_users`): `gerente`, `cliente`, `empleado`. `apps.branches.views.IsManagerPermission` only allows `gerente`; `apps.orders.views.OrderViewSet` filters by `client_id` unless user is staff.
- **DRF defaults**: JWT auth, `IsAuthenticated` global, page size 20, access token 30 min, refresh 14 days.
- **Product model** converts uploaded images to WEBP (800×800, quality 85) on `save()` and uses `ArrayField` for `modifiers` (Postgres-only). Don't write a SQLite test setup without changing that.
- Seeds are **dev-only** (guarded by `DJANGO_ENV == 'development'`, they abort otherwise):
  - `pnpm back:manage seed` → consolidated: runs `seed_users` + `seed_branches` + `seed_products` and other seeds (`--force` to recreate users).
  - `seed_users` → groups + users: `admin`/`admin123` (gerente, superuser), `cocina1`/`admin123` (empleado), `cliente1`/`admin123` (cliente), `admin_escolar1`/`admin123` (admin_escolar).
  - `seed_branches` → 2 companies (El Circulo, Cooffy) and 3 branches; requires the `admin` user to exist (run `seed_users` first if calling individually).
  - `seed_products` → 10 demo products. **Downloads product images from `images.unsplash.com` at seed time** — needs network; will skip image on failure.
- **No backend lint/format/test config exists.** `apps/*/tests.py` are empty stubs from the Django startapp template and are not currently being implemented. Don't invent pytest/ruff configs. The only test runner is Django's default: `pnpm back:manage test` (nothing meaningful to run yet).

## Frontend notes

- Next 16 with **React Compiler enabled** (`reactCompiler: true`) and Turbopack. App Router under `frontend/src/app` (route dirs: `menu`, `kitchen`, `manager`, `register`).
- Path alias `@/*` → `./src/*` (tsconfig). Use it; don't write relative paths past `src`.
- UI: **shadcn/ui** with style `base-nova` and `neutral` base color; aliases defined in `frontend/components.json` (`@/components`, `@/components/ui`, `@/lib`, `@/hooks`). Add components via `shadcn` CLI, not by hand.
- State/data: TanStack Query, Zustand, react-hook-form + zod. HTTP via the axios instance in `frontend/src/lib/api.ts` (uses `NEXT_PUBLIC_API_URL`, `withCredentials: true`, attaches `Authorization: Bearer <accessToken>` from `localStorage`, clears storage and redirects to `/login` on 401).
- Local state: `src/context/CartContext.tsx` (cart items, 8% tax, subtotal/total). `src/hooks/useLoginForm.ts` and `useRegisterForm.ts` use react-hook-form + zod.
- **Mock data**: `src/lib/menu-data.ts` is hardcoded — not yet wired to the backend `/api/menu/products/` endpoint. Don't assume the menu page reads from the API unless you check `MenuView.tsx`.
- Lint: `pnpm --dir frontend lint` (flat eslint config, Next + TS rules). **No `typecheck` and no test scripts** are defined — `tsc --noEmit` is the only typecheck path and isn't wired in.
- Next `next.config.ts` whitelists specific image remote hostnames (`lh3.googleusercontent.com`, `images.unsplash.com`); new external image domains must be added there or `<Image>` will refuse them.
- `frontend/pnpm-workspace.yaml` allows specific native build deps (sharp, unrs-resolver); root `pnpm-workspace.yaml` allows `protobufjs`. Don't blanket-approve build scripts.

## Git workflow

- Base integration branch is **`develop`**, not `main`. Branch off `develop` with `feature/`, `fix/`, `docs/`, `chore/`, `refactor/`, `hotfix/` prefixes; PRs target `develop`.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`). PR template (`/.github/pull_request_template.md`) requires `Closes #<issue>` (note: the template field is `RF #` — fill both, the field is the in-flight RF tracking id).
- `CONTRIBUTING.md` describes the RF-XX issue model: one issue per requirement, sub-tasks become separate PRs with branch naming `<prefix>/rf-XX-brief-desc`.

## Things agents get wrong here

- Creating `backend/.env` or assuming secrets live in the backend dir.
- Running `cd backend && ...` instead of `pnpm back:*` (breaks env resolution and script expectations).
- Expecting pytest/mocha/jest — there is no test framework set up on either side, and tests are out of scope for now.
- Committing `.env` or `backend/media/` (both gitignored).
- Adding image hosts to `<Image>` without also whitelisting them in `frontend/next.config.ts` `images.remotePatterns`.
