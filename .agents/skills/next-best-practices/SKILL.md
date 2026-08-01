---
name: next-best-practices
description: Use only for Next.js App Router, React Server Components, async APIs, route handlers, performance, metadata, images, fonts, or bundling.
---

# Next.js and React

Apply these rules only when the task involves Next.js, React or frontend
performance. Read the existing code and configuration before changing it.

## Project context

- Next.js 16 App Router with React 19 and the React Compiler.
- Routes live under `frontend/src/app`.
- Use the `@/*` TypeScript alias.
- Prefer the Node.js runtime unless the task has a clear Edge requirement.

## App Router rules

- Keep browser-only state, effects and event handlers in Client Components.
- Keep Server Component props serializable and as small as practical.
- Treat Server Actions and Route Handlers as public endpoints: validate input,
  authenticate and authorize inside the handler.
- Use the current async APIs for `params`, `searchParams`, `cookies()` and
  `headers()`.
- Use the standard file conventions for `loading.tsx`, `error.tsx`,
  `not-found.tsx` and `generateMetadata`.
- Add a Suspense boundary when an isolated async section should stream without
  blocking the surrounding UI.

## Performance rules

- Start independent requests together with `Promise.all` and defer requests
  that are needed only on conditional paths.
- Avoid Server Component data waterfalls by composing async components or
  starting promises before awaiting them.
- Dynamically load heavy, non-critical client components.
- Avoid barrel imports when they materially increase the bundle.
- Do not keep request-specific mutable data at module scope.
- Derive values during render instead of syncing derived state in effects.
- Put interaction side effects in event handlers, not state-triggered effects.
- Use functional state updates when the next value depends on previous state.
- Use `startTransition` or `useDeferredValue` for expensive non-urgent UI work.
- Respect React Compiler; do not add `useMemo`, `useCallback` or `memo` without
  a measured reason or an existing project convention.

## Assets and styling

- Prefer `next/image` and configure new remote hosts in `next.config.ts`.
- Use `next/font` for application fonts.
- Keep CSS imports and Tailwind configuration aligned with the existing setup.

## Workflow

1. Identify whether the task is routing, RSC boundaries, data fetching,
   performance, hydration, assets or bundling.
2. Read the relevant implementation and configuration.
3. Make the smallest correct change.
4. Check loading, error, authorization and hydration behavior.
5. Run `pnpm front:lint` and `pnpm front:typecheck`.

Load detailed guidance only when needed from the reference files in this skill
directory, especially `async-patterns.md`, `data-patterns.md`,
`rsc-boundaries.md`, `bundling.md` and `hydration-error.md`.
