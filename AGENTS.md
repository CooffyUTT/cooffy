# AGENTS.md

Guidance for AI Agents sessions (ClaudeCode, OpenCode, GithubCopilot) working in the Cooffy repo (school project: Django + Next.js learning project). Verify against the codebase before trusting; this file is a shortcut, not a spec.

## Repo shape

Monorepo, two pnpm-ish packages plus a Django app:

- `backend/` — Django 6.0.7 + DRF + SimpleJWT, run via `uv` (Python 3.14). Entry package is `config` (`config.settings`, `config.urls`); apps live under `backend/apps/`.
- `frontend/` — Next.js 16 (App Router) + React 19 + Tailwind 4, its own `package.json` and `pnpm-lock.yaml`.
- `bruno/` — versioned API request collections (Bruno CLI is a devDependency at root).
- `docs/` — requirements + DB diagram (`docs/database/`). No codegen.

There are **two pnpm lockfiles** (root and `frontend/`). Use `pnpm install:all` (or `pnpm install && pnpm front:install && pnpm back:install`), not a single `pnpm install`.

## Running things — use the root pnpm scripts, do not `cd` manually

All commands run from repo root. Backend is invoked through `uv --directory backend`, so CWD for Django is `backend/` even though you run from root.

- `pnpm init:all` — install everything, up Postgres, migrate, seed, start dev servers (one-shot first run).
- `pnpm dev` — start backend + frontend together (via `concurrently`).
- `pnpm front` / `pnpm back` — start one side. `pnpm back` = `manage.py runserver`.
- `pnpm back:manage <args>` — proxy for `python manage.py <args>` (e.g. `pnpm back:manage makemigrations`).
- `pnpm back:install` — creates `backend/.venv` with `uv venv` and installs `requirements.txt`.

Postgres is required and runs only via `docker compose up -d` (docker-compose.yml at root). The backend cannot start without it.

## Environment

`.env` lives at the **repo root and is gitignored**. Copy from `.env.example`. Do not create `backend/.env` — `python-decouple` (`AutoConfig`) searches from CWD upward, so when backend runs via `uv --directory backend` it still resolves the root `.env`.

Key vars: `DJANGO_ENV` (controls `DEBUG` and CORS behavior), `POSTGRES_*`, `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`, consumed by `frontend/src/lib/api.ts`). In non-dev, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS` must be set.

## Backend notes

- **Custom user model** `apps.users.User`, `AUTH_USER_MODEL = 'users.User'`, with `USERNAME_FIELD = 'user'` (a single string field — email or username), **not** email. The `User` manager keys on `user=`.
- Currently `INSTALLED_APPS` registers only `apps.users` and `apps.products`. `apps/orders/` exists as a scaffolded folder with only a `migrations/` dir — **it is NOT wired into Django** (no `apps.py`, not installed, no URL include). Don't assume orders endpoints exist; confirm before referencing.
- URL prefixes (`config/urls.py`): `/admin/`, `/api/auth/` (users), `/api/menu/` (products). Media served under `/media/` in dev only (not in prod — expect a reverse proxy/CDN).
- DRF defaults: JWT auth, `IsAuthenticated` global, page size 20, access token 30 min.
- Seeds are **dev-only** (guarded by `DJANGO_ENV == 'development'`, they abort otherwise):
  - `pnpm back:manage seed_dev` → admin user `admin` / `admin123` (`--force` to recreate).
  - `pnpm back:manage seed_products` → 10 demo products. **Downloads product images from `images.unsplash.com` at seed time** — needs network; will skip image on failure.
- **No backend lint/format/test config exists.** `apps/*/tests.py` are empty stubs. The only test runner is Django's default: `pnpm back:manage test` (nothing to run yet). Don't invent pytest/ruff configs.

## Frontend notes

- Next 16 with **React Compiler enabled** (`reactCompiler: true`) and Turbopack. App Router under `frontend/src/app` (route dirs: `menu`, `kitchen`, `manager`, `register`).
- Path alias `@/*` → `./src/*` (tsconfig). Use it; don't write relative paths past `src`.
- UI: **shadcn/ui** with style `base-nova` and `neutral` base color; aliases defined in `frontend/components.json` (`@/components`, `@/components/ui`, `@/lib`, `@/hooks`). Add components via `shadcn` CLI, not by hand.
- State/data: TanStack Query, Zustand, react-hook-form + zod. HTTP via the axios instance in `frontend/src/lib/api.ts` (uses `NEXT_PUBLIC_API_URL`, `withCredentials: true`).
- Lint: `pnpm --dir frontend lint` (flat eslint config, Next + TS rules). **No `typecheck` and no test scripts** are defined — `tsc --noEmit` is the only typecheck path and isn't wired in.
- Next `next.config.ts` whitelists specific image remote hostnames (`lh3.googleusercontent.com`, `images.unsplash.com`); new external image domains must be added there or `<Image>` will refuse them.
- `frontend/pnpm-workspace.yaml` allows specific native build deps (sharp, unrs-resolver); root `pnpm-workspace.yaml` allows `protobufjs`. Don't blanket-approve build scripts.

## Git workflow

- Base integration branch is **`develop`**, not `main`. Branch off `develop` with `feature/`, `fix/`, `docs/`, `chore/`, `refactor/`, `hotfix/` prefixes; PRs target `develop`.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`). PR template (`/.github/pull_request_template.md`) requires `Closes #<issue>`.

## Things agents get wrong here

- Treating `apps/orders` as a working app (it isn't wired in yet).
- Creating `backend/.env` or assuming secrets live in the backend dir.
- Running `cd backend && ...` instead of `pnpm back:*` / `uv --directory backend ...` (breaks env resolution and script expectations).
- Expecting pytest/mocha/jest — there is no test framework set up on either side.
- Committing `.env` or `backend/media/` (both gitignored).