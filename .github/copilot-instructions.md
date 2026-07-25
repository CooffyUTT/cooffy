# Copilot instructions — Cooffy

You are working in the **Cooffy** repo: a Django 6 (DRF + SimpleJWT) + Next.js 16 school project. Before suggesting code, read `AGENTS.md` and the relevant `docs/agents/*.md` file for full context.

## Critical guardrails
- **Run from repo root via `pnpm` scripts.** Never `cd backend` — backend runs via `uv --directory backend`.
- **`.env` lives at repo root only.** No `backend/.env`.
- **`apps/orders/` is NOT wired** — no models, not in `INSTALLED_APPS`, no URL include.
- **Custom `User`**: `USERNAME_FIELD = 'user'` (a string, not email). `is_active` is a `@property` over `active` — never set `is_active` directly. Roles = Django `Group` ("cliente").
- **`Product.save()` re-encodes all images to WEBP 800x800** — avoid bulk re-saves. `ArrayField` is Postgres-only.
- **Frontend is mock-first**: `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod` are installed but unused; `src/lib/api.ts` is unused by any feature.
- **No pytest/jest/ruff** configured on either side. Backend tests: Django `TestCase` + `pnpm back:manage test`. Frontend: `pnpm --dir frontend lint`.
- **PRs target `develop`** (not `main`). Conventional Commits required. Branch prefixes: `feature/`, `fix/`, `docs/`, `chore/`, `refactor/`, `hotfix/`.
- **New external image domains** must be added to `next.config.ts` `remotePatterns`. Avoid raw `<img>` — use `next/image` `<Image>`.

## Docs
- `docs/agents/backend-guide.md` — Django/DRF patterns & quirks.
- `docs/agents/frontend-guide.md` — Next 16 / App Router / shadcn + mock-first reality.
- `docs/agents/architecture.md` — Current topology & planned seams.
- `docs/agents/review-checklist.md` — Repo-specific PR checklist.