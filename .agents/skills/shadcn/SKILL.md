---
name: shadcn
description: Use only when adding, composing, debugging, or styling shadcn/ui components, Tailwind CSS v4 theme tokens, or the shadcn CLI in this project.
---

# shadcn/ui and Tailwind CSS v4

Use the existing design system before writing custom UI. This project uses
Next.js, not Vite.

## Project context

- Style: `base-nova`.
- Base color: `neutral`.
- Tailwind CSS: v4 with CSS variables in `frontend/src/app/globals.css`.
- `components.json` has CSS variables enabled, RSC enabled and `lucide` icons.
- Imports: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.
- Package runner: use `pnpm dlx shadcn@latest`.

## Component rules

- Check installed components before adding or replacing one.
- Prefer composition and existing variants over custom markup.
- Use semantic color tokens such as `bg-primary` and
  `text-muted-foreground`, not hard-coded colors.
- Use `cn()` for conditional classes, `gap-*` instead of `space-*` and
  `size-*` when width and height are equal.
- Dialogs, sheets and drawers require an accessible title.
- Keep menu items inside their corresponding groups.
- Use `sonner` for toasts, `Skeleton` for loading states and `Separator` for
  separators.
- Follow the configured component API. Do not assume Radix APIs when the
  project uses Base UI primitives.

## Tailwind v4 rules

- Keep theme tokens in `frontend/src/app/globals.css`.
- Preserve the shadcn CSS variable architecture and semantic token names.
- Use the v4 `@theme inline` pattern when exposing CSS variables to utilities.
- Do not add a `tailwind.config.*` file unless a documented migration requires
  it.
- Do not add manual `dark:` overrides when a semantic theme token exists.
- Inspect `components.json`, `globals.css` and PostCSS before changing build
  configuration.
- Do not introduce Vite-specific setup.

## Workflow

1. Inspect project state with `pnpm dlx shadcn@latest info` when needed.
2. Search the registry before creating a custom component.
3. Preview changes with `--dry-run` or `--diff`.
4. Read generated files and verify imports, accessibility and composition.
5. Run `pnpm front:lint` and `pnpm front:typecheck`.

Load detailed guidance only when needed from `rules/`, `cli.md` or
`customization.md` in this skill directory.
