---
name: surface-command-token-fallback
description: Critical StorySection dark backgrounds need a fallback for the surface-command token
metadata:
  type: reference
updated_at: 2026-06-02
last_verified_scope: StorySection rendered CDP checks in local Next dev server and production build
---

Use `var(--color-surface-command, #08111F)` for critical StorySection dark-area backgrounds instead of relying on `var(--color-surface-command)` alone.

**Why:** During the StorySection dark narrative verification, the source token existed in `src/app/globals.css`, but the rendered Next/Tailwind CSS bundle omitted `--color-surface-command` while keeping other surface tokens. Without a fallback, `#section-story` computed to transparent and visually inherited the light wrapper background.
**How to apply:** For dark StorySection or dawn-break backgrounds that must remain opaque, keep the token fallback and verify rendered `backgroundColor` has RGB channels below 35 with alpha >= 0.99.
