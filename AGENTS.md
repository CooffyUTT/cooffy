# Cooffy

Monorepo for a Django + Next.js cafeteria ordering system.

## Structure

- `backend/` - Django + DRF. See `backend/AGENTS.md`.
- `frontend/` - Next.js + React. See `frontend/AGENTS.md`.
- `bruno/` - versioned API request collections.
- `docs/` - requirements, architecture and database diagrams.

## Commands

Run commands from the repository root. Use the existing `pnpm` scripts; do not
run `cd backend` manually.

- `pnpm init:all` - install, start PostgreSQL, migrate, seed and run both apps.
- `pnpm install:all` - install root, frontend and backend dependencies.
- `pnpm dev` - run backend and frontend together.
- `pnpm front` / `pnpm back` - run one application.
- `pnpm front:lint` - lint and typecheck the frontend.
- `pnpm front:typecheck` - run the frontend TypeScript check.
- `pnpm back:manage <command>` - run a Django management command.
- `pnpm back:install` / `pnpm back:lock` - sync or update backend dependencies.

PostgreSQL is required and runs with `docker compose up -d`.

## Environment and safety

- Keep `.env` at the repository root; never create `backend/.env`.
- Do not read or commit secrets, `.env` files or `backend/media/`.
- Check the relevant area-specific instructions before changing backend or
  frontend code.
- Do not invent lint, format or test configuration that is not in the repo.

## Git

- The integration branch is `develop`, not `main`.
- Use `feature/`, `fix/`, `docs/`, `chore/`, `refactor/` or `hotfix/` branches.
- Use Conventional Commits.
- PRs target `develop` and follow the RF-XX conventions in `CONTRIBUTING.md`.
