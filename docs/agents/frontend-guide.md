# Frontend guide — Next.js + React

You are the **frontend** specialist for the Cooffy repo (Next.js 16 + React 19 + Tailwind 4 + shadcn/ui). Implement Next/React work; follow this guide exactly. Quick, repo-specific cheatsheet. Pair with `AGENTS.md` for run commands and repo shape. Verify against the codebase before trusting — this is a shortcut, not a spec.

## Structure (`frontend/src/`)
| Dir | Purpose |
|---|---|
| `app/` | App Router entry: `layout.tsx`, `page.tsx` (login/home), route dirs `menu/`, `kitchen/`, `manager/`, `register/` |
| `components/` | Feature-grouped: `home/`, `login/`, `register/`, `kitchen/`, `manager/` + `ui/` (shadcn) |
| `components/ui/` | shadcn primitives (avatar, badge, button, card, dialog, dropdown-menu, form, input, label, separator, sheet, table) |
| `context/` | `CartContext.tsx` — only active global state |
| `data/` | **Static/mock fixtures** (`mockOrders.ts`, `mockBranches.ts`) — NOT backend data |
| `hooks/` | `useLoginForm.ts`, `useRegisterForm.ts` (bespoke form logic) |
| `lib/` | `api.ts` (axios instance), `utils.ts` (`cn()`) |
| `types/` | `auth.ts`, `kitchen.ts`, `manager.ts` |
| `utils/` | `kitchenHelpers.ts`, `formatters.ts` (`formatCurrency` es-MX/MXN) |

No `services/`, no `store/` dir.

## App Router routes
- Root `layout.tsx`: server component, loads Geist fonts, sets metadata template `%s | Cooffy`, mounts `<Toaster position="top-right" richColors closeButton />` (sonner) at body level. **No providers wrap children** (no `QueryClientProvider`, no auth provider) — children pass through raw.
- `page.tsx` (`/`): server, renders `<LoginView />`.
- `menu/page.tsx` (`/menu`): **`"use client"`** — manages `selectedCategory` + cart, wraps content in `<CartProvider>`. Contains inline hardcoded `CATEGORIES` + `PRODUCTS` arrays (3 items, `lh3.googleusercontent.com` images).
- `kitchen/page.tsx`, `manager/page.tsx`, `register/page.tsx`: server, render their respective `*View`.

Route `page.tsx` files are server components **except `menu/page.tsx`** (client). Interactivity lives in `*View` children marked `"use client"` (`KitchenView.tsx`, `ManagerView.tsx`, `LoginView.tsx`, `RegisterView.tsx`).

## Next 16 / React 19 conventions
- `next.config.ts` has `reactCompiler: true` — **React Compiler is on**. Avoid manual `useMemo`/`useCallback` unless the compiler can't help. Don't fight it.
- Turbopack root pinned to `__dirname`.
- Image `remotePatterns` are **whitelisted**: only `lh3.googleusercontent.com` and `images.unsplash.com` (pathname `/**`). Add any new external image domain here or `<Image>` refuses it.
- Path alias `@/*` → `./src/*` (tsconfig). Use it; don't write relative imports past `src`.
- TypeScript: `strict: true`, `noEmit`, `isolatedModules`, `moduleResolution: "bundler"`. Note: app code relaxes in spots (`product: any` in `CartContext`, untyped `catch`) — strict is on but code isn't fully typed. Tighten when you touch.

## UI: shadcn/ui
- `components.json`: `style: "base-nova"`, `baseColor: "neutral"`, `cssVariables: true`, `rsc: true`, `iconLibrary: lucide`.
- Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- **Add components via `shadcn` CLI, not by hand.** Existing 12 are under `src/components/ui/`.
- `globals.css` uses Tailwind 4 (`@import "tailwindcss"`, `tw-animate-css`, `shadcn/tailwind.css`) with Cooffy brand tokens in `@theme inline` (café `--primary`, gold `--primary-container`, blue `--secondary`) — warning comment says it can override shadcn component styling.
- Icons: `lucide-react` primary; Google icon via `react-icons/fc` (`FcGoogle`).
- Animations: `framer-motion` (login/register/kitchen: staggered `variants`, `AnimatePresence` in kanban).

## State & data — current state is **mock-first**
- `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod` are all **installed but NOT used anywhere**. No `QueryClientProvider`, no `useQuery`/`useMutation`, no `create(...)` stores, no schema definitions.
- The only active global state is `src/context/CartContext.tsx` (`CartProvider` + `useCart()`): `useState`-backed `CartItem[]`, derived `subtotal`/`tax` (8%)/`total`/`totalItems`/`isCartOpen`. Throws if `useCart` used outside provider.
- `src/lib/api.ts` is `axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL, withCredentials: true })` exported as `api`, with **no interceptors, no auth token handling, no refresh logic**. And **`api` is imported by no feature component** — the frontend is not wired to the backend yet.
- Forms use bespoke hooks, not react-hook-form+zod:
  - `useLoginForm`: `formData{user,password}`, per-field `validateField` (email regex + password min 6), `handleCredentialsLogin` **simulates** the API with `await new Promise(setTimeout, 2000)` (explicit `TODO: REEMPLAZAR… LLAMADA AL SERVIDOR REAL`). `handleSSOLogon` shows `toast.warning`.
  - `useRegisterForm`: `formData{name,lastname,user,password,confirmPassword,acceptedTerms,school_id:'1'}`, email regex, password min 6 + confirm match, `getPasswordStrength` (0-4), `getPasswordRequirements` (len/upperLower/number/special), `acceptedTerms` gates `isFormValid`, simulated 1.5s delay, `router.push('/menu')` on success.
- Toasts: `sonner` `<Toaster>` mounted once in root `layout.tsx`. `toast.{success,error,info,warning}` called from hooks.
- `data/mockOrders.ts` (`INITIAL_ORDERS`), `mockBranches.ts` (`INITIAL_BRANCHES`) feed the kitchen/manager views — no backend calls anywhere.

## Conventions
- **`"use client"`** at top of any component using hooks/interactivity. shadcn primitives are generated with it.
- File naming: components **PascalCase** (`LoginView.tsx`, `ProductCard.tsx`); hooks **camelCase `use*`**; types/data/utils **camel/kebab**; route dirs lowercase per App Router.
- **Exports are inconsistent**: `home/*` use default exports; `login/`, `kitchen/`, `manager/*View` use named exports. shadcn `ui/*` use named. Check before importing.
- `<html lang="en">` but UI strings and comments are in **Spanish**. Known mismatch — keep UI strings Spanish unless asked otherwise.
- **Raw `<img>` usage**: `Header.tsx` (profile avatar), `menu/page.tsx` (product images), `CartSheet.tsx` (cart thumbnails) use plain `<img>` with `lh3.googleusercontent.com` URLs — this is a Next lint/`@next/next/no-img-element` violation. When touching these, switch to `next/image` `<Image>` (the hostnames are already whitelisted).

## Lint / typecheck / tests
- Lint: `pnpm --dir frontend lint` runs `eslint` (flat config, `eslint-config-next` core-web-vitals + typescript, no custom rules).
- **No `typecheck` and no `test` scripts.** Only typecheck path is `tsc --noEmit` (not wired) — run `pnpm --dir frontend exec tsc --noEmit` manually when you need it.
- No jest/vitest config, no `__tests__`. Don't invent a test framework; if you add tests, surface a config and a script first.
- `prettier` + `prettier-plugin-tailwindcss` are devDeps but **not wired to a script**. Formatter is not enforced.

## Roadmap: wiring the backend
When integrating the real API:
1. Add a `QueryClientProvider` in `layout.tsx` (wrap children) and set up `QueryClient`.
2. Finish auth in `lib/api.ts`: request interceptor to attach the JWT access token from storage; response interceptor for 401 → refresh + retry, else redirect to `/`.
3. Replace `useLoginForm.handleCredentialsLogin` (`setTimeout` stub) with a `useMutation` → `POST /api/auth/login/` (returns `{access,refresh,user}`). Store tokens; redirect `/menu`.
4. Replace `useRegisterForm.handleRegister` with a `useMutation` → `POST /api/auth/register/` (auto-issues tokens on 201).
5. Add `.edu.mx` institutional-email validation matching `apps/users/serializers.py:41` (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.mx$`).
6. Replace inline `PRODUCTS` in `menu/page.tsx` with `useQuery` → `GET /api/menu/products/` (paginated, `?search=`, `?ordering=`).
7. Replace `data/mockOrders.ts` and `data/mockBranches.ts` with real endpoints once `apps.orders` and manager endpoints exist on the backend.
8. Keep `withCredentials: true` (already set) — backend has `CORS_ALLOW_CREDENTIALS = True`. Out of dev, set `CORS_ALLOWED_ORIGINS` backend-side to `http://localhost:3000`.