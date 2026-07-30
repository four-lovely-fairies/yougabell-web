---
name: yougabell-ui
description: Use when editing, creating, reviewing, or implementing UI in yougabell-web. Ensures Codex checks DESIGN.md and app/globals.css Tailwind theme tokens before choosing colors, radii, spacing, typography, safe-area layout, or component styling.
---

# Yougabell UI

## Required Context

Before changing UI in this repo, read the closest applicable `AGENTS.md`, then read `DESIGN.md` and `app/globals.css`.

Treat these files as the source of truth:

- `DESIGN.md`: design-system intent, layout rules, colors, typography, radius, spacing, elevation.
- `app/globals.css`: actual Tailwind `@theme` token mapping used by class names.

Do not assume Tailwind default token values. This repo overrides tokens. Confirm mappings in `app/globals.css` before translating pixel specs into `rounded-*`, `text-*`, `bg-*`, `shadow-*`, spacing, or font utilities.

Current radius mapping:

- `rounded-xs` = 4px
- `rounded-sm` = 8px
- `rounded-md` = 12px
- `rounded-lg` = 16px
- `rounded-xl` = 20px
- `rounded-full` = 999px

If a requested value is not represented by a token, prefer the closest design-system token. Use arbitrary values such as `rounded-[20px]` only when the design calls for a value that is not exposed through Tailwind utilities or existing code already uses that exact exception.

## Workflow

1. Inspect nearby components and existing page patterns before editing.
2. Check `DESIGN.md` for semantic guidance and `app/globals.css` for actual utility mappings.
3. Use existing shared components, assets, and repo-local utilities first.
4. Preserve mobile WebView constraints: safe areas, fixed headers/footers where required, stable dimensions, and no text overlap.
5. Verify with `pnpm lint` and `pnpm build` for web UI changes unless the task asks for a narrower check.
