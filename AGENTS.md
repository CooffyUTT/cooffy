# Cooffy

Monorepo for a Django/DRF API and Next.js cafeteria ordering system.

## Boundaries

- `backend/` - Django project (`config/`) with apps for users, products,
  branches, orders and schools. See `backend/AGENTS.md` before backend changes.
- `frontend/` - Next.js App Router application. See `frontend/AGENTS.md` before
  frontend changes.
- `bruno/` contains versioned API collections; `docs/` contains project
  requirements and architecture/database documentation.

## Commands

Run commands from the repository root and use the existing `pnpm` scripts. The
backend scripts invoke `uv` with `backend/`; do not create or activate a manual
virtualenv.

- `cp .env.example .env` then `pnpm init:all` for the full local setup.
- `pnpm init:all` installs dependencies, starts PostgreSQL, migrates, seeds and
  starts both apps.
- `pnpm install:all` installs root, frontend and backend dependencies.
- `pnpm dev`, `pnpm front` and `pnpm back` run both apps, the frontend only or
  the backend only.
- `pnpm back:manage <command>` proxies to `manage.py`; common commands are
  `migrate`, `makemigrations`, `seed` and `test`.
- `pnpm back:test` runs the complete Django test suite non-interactively.
- `pnpm front:test` runs the configured Vitest suite; `pnpm front:test:watch`
  runs it in watch mode.
- `pnpm front:lint` runs only the frontend ESLint check;
  `pnpm front:typecheck` runs only `tsc --noEmit`.
- `pnpm --dir frontend build` creates a production frontend build.
- `pnpm bru:auth` runs the Bruno Auth collection.

PostgreSQL 16 is required; start it with `docker compose up -d` when not using
`pnpm init:all`.

## Constraints

- Keep `.env` at the repository root; never create `backend/.env`. Do not read
  or commit secrets, `.env` files or `backend/media/`.
- Seeds require `DJANGO_ENV=development`; product seeding may download images
  from Unsplash and can skip them offline.
- Do not invent lint, formatter or test configuration; use the scripts and
  config already present in the repository.

## Workflow

- Integrate into `develop`, not `main`. For RF work, branch as
  `<type>/rf-XX-short-description` and keep one PR per subtask.
- Use Conventional Commits and target PRs at `develop`; see `CONTRIBUTING.md`
  for the RF issue and review flow.
