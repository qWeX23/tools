# AGENTS.md

## Project Type
Static GitHub Pages site — no build system, no package manager, no tests. Each folder with an `index.html` becomes a route.

## Adding or Editing a Tool
- Create a folder in the repo root (folder name = URL route).
- Add `index.html` inside it.
- Reference shared styles with `../styles.css`.
- **Manually add a card** in root `index.html` or the tool will not be discoverable from the landing page.

## Deployment
- Pushes to `main` trigger GitHub Actions (`/.github/workflows/deploy.yml`).
- No build step; artifact is the repo root (`path: '.'`).
- Custom domain is set via `CNAME` (`tools.qwex.co`). Do not delete or rename this file.
- `workflow_dispatch` is enabled for manual re-runs.

## Shared Assets
- `styles.css` lives at the repo root and is shared across all tools.
- Individual tools may include inline `<style>` blocks or additional CSS files in their own folders.

## Constraints
- No server-side code; everything must run client-side in the browser.
- Because there is no build step, inline large dependencies or use CDNs rather than expecting a bundler.
