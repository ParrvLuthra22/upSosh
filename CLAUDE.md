# upSosh

## Frontend rules

- Theme: dark "void" background with lime accent. Use Tailwind theme tokens only (no raw hex or arbitrary colours).
- Icons: Tabler icons. No emoji in UI.
- Motion: keep it limited, and honour `prefers-reduced-motion`.

## Before opening any UI PR

1. Run the `web-design-guidelines` skill on the changed files and fix all findings.
2. Run the `vercel-react-best-practices` skill on the changed components.
3. Screenshot the changed screens at 390px and 1280px wide. Use the `@playwright/test` already in `frontend/` (the same version CI runs); do not add a second Playwright.
4. If a skill rule conflicts with the dark-luxury theme, keep the theme and say so in the PR description.
