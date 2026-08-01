# Frontend Rules

## Stack and structure

- Next.js 16 App Router, React 19, Tailwind 4 and Turbopack.
- React Compiler is enabled in `next.config.ts`.
- Routes live under `src/app`: `/` (login), `/menu`, `/kitchen`, `/manager`,
  `/school` and `/register`.
- Use the `@/*` path alias from `tsconfig.json`; avoid long relative imports.

## UI and state

- UI uses shadcn/ui with `base-nova` and `neutral`; use the configured aliases
  in `components.json`.
- Add shadcn components with the CLI rather than copying components manually.
- Existing state/data tools are TanStack Query, Zustand, react-hook-form and
  zod. Follow existing patterns before introducing alternatives.
- Cart state is in `src/context/CartContext.tsx`; it applies 8% tax.
- Login and registration forms use `src/hooks/useLoginForm.ts` and
  `src/hooks/useRegisterForm.ts`.

## API and data

- Use the Axios instance in `src/lib/api.ts`; it reads `NEXT_PUBLIC_API_URL`,
  sends credentials and attaches the stored access token.
- Product and category queries use `src/services/productService.ts` and the
  `/api/menu/` endpoints.
- Manager menu management uses `src/lib/productsApi.ts` against
  `/api/menu/manage/products/` (create, update, delete and toggle-active).
- On a 401, the API client clears local storage and redirects to `/`.
- Kitchen and school views still use mock data; do not assume those screens are
  connected to the backend APIs.

## Verification

- `pnpm front:lint` runs the frontend ESLint check and then
  `pnpm front:typecheck`.
- `pnpm front:typecheck` runs `tsc --noEmit`.
- There are no frontend test scripts.
- `next.config.ts` allows only configured remote image hosts. Add new hosts to
  `images.remotePatterns` before using them with `next/image`.
- Do not blanket-approve native build scripts; workspace allowlists are
  intentional.
