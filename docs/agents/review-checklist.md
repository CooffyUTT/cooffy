# Review checklist (Cooffy)

You are the **reviewer** for the Cooffy repo. Review PRs/diffs read-only against this checklist; do not edit code. Use this when reviewing PRs / diffs. Repo-specific. Pair with `AGENTS.md`. Skip anything not applicable; flag anything that violates these.

## Scope & assumptions
- **`apps/orders/` is not wired** (no `apps.py`, not in `INSTALLED_APPS`, no URL include). If a PR references orders endpoints, models, or imports from `apps.orders`, verify the PR also wires the app — otherwise it's broken.
- Don't approve changes that treat `apps/orders` as a working app without the wiring.

## Environment & secrets
- No `backend/.env` — env lives at **repo root** (`python-decouple` `AutoConfig` walks up from CWD). Reject any new `backend/.env`.
- `.env` and `backend/media/` are gitignored. Flag if they show up in a diff.
- Non-dev changes must set `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` (default is only `localhost,127.0.0.1`), and `CORS_ALLOWED_ORIGINS` (default points at port **8000**, not the frontend's 3000). Flag missing/wrong origins.

## Django / DRF
- Run via `pnpm back:*` / `uv --directory backend ...` from root — **never** `cd backend && ...`. Flag scripts/README edits that teach `cd backend`.
- Custom `User` (`apps/users/models.py:39`): `USERNAME_FIELD = 'user'` (string), `is_active` is a **`@property` over `active`** (`:62`). Flag code that sets `is_active` directly or assumes an `is_active` DB column.
- Roles are Django **`Group`** ("cliente"); no Role model. Flag any invented Role/RoleEnum model.
- Create-client registration requires `.edu.mx` email (`apps/users/serializers.py:41`). Flag regex changes that loosen this.
- `LoginView` returns **401** on bad creds (not 400). `CreateClientView` returns 201 and **auto-issues tokens** — don't add a separate login step after register.
- `Product` `save()` re-encodes every image to WEBP 800x800 (`apps/products/models.py:34`). Flag bulk re-saves / `save()` calls in loops (quality loss + uuid churn). Original files are discarded.
- `ArrayField` (`apps/products/models.py:18`) is **Postgres-only** — flag any change that assumes SQLite works.
- `requirements.txt` is **exact `==` pinned** for all 16 packages incl. transitives. Flag loosened pins (`>=`, `~=`) unless intentional.
- Seed commands (`seed_dev`, `seed_products`) are **dev-only** (guard on `DJANGO_ENV`). Flag any change that removes the guard or runs them in prod flows. `seed_products` downloads from Unsplash — flag offline-test assumptions.
- No pytest/ruff/black config exists. Flag any claim that those run. Tests use Django's `TestCase` and `pnpm back:manage test`.

## Next.js / React
- Path alias `@/*` → `./src/*`. Flag relative imports past `src`.
- React Compiler is **on** (`next.config.ts`). Flag gratuitous `useMemo`/`useCallback`; prefer letting the compiler optimize.
- Add shadcn components **via CLI**, not by hand (`components.json`). Flag hand-written `components/ui/*` additions.
- New external image domains must be added to `next.config.ts` `remotePatterns` (currently only `lh3.googleusercontent.com` and `images.unsplash.com`). Flag `<Image>`/raw `<img>` using unlisted hosts.
- Flag new **raw `<img>`** usages (Next `@next/next/no-img-element` violation). Existing ones (`Header.tsx`, `menu/page.tsx`, `CartSheet.tsx`) are legacy; encourage switching to `next/image`.
- Mixed exports: `home/*` default; `login/`/`kitchen/`/`manager/*View` named; `ui/*` named. Flag import mismatches that would break the build.
- `<html lang="en">` but UI is Spanish. Flag accidental mass translation unless intended.
- No `typecheck`/`test` scripts wired. Flag CI claims that invoke nonexistent commands. Manual typecheck: `pnpm --dir frontend exec tsc --noEmit`.
- `pnpm --dir frontend lint` must pass. `prettier` is a devDep only, not enforced.
- Mock-first: `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod` are installed but unused; `src/lib/api.ts` is unused by features. Flag PRs that pretend the backend is wired when they're still hitting `data/mock*` or `setTimeout` stubs — encourage the `TODO` cleanup.

## Git & commits
- PRs target **`develop`**, not `main`. PR template requires `Closes #<issue>`.
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`. Flag non-conventional messages.
- Branch prefixes: `feature/`, `fix/`, `docs/`, `chore/`, `refactor/`, `hotfix/` off `develop`.

## Verify, don't trust
- Re-read the actual diff before approving a checklist-based comment.
- Run `pnpm --dir frontend lint` for frontend changes.
- For backend changes, suggest `pnpm back:manage check` and `pnpm back:manage migrate --plan` if migrations are involved.
- Don't assume tests exist — `pnpm back:manage test` collects zero tests today.