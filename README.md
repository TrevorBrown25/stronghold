# Stronghold Steward

A Next.js dashboard for managing a D&D-inspired stronghold turn sequence. Track resources, projects, recruitment, missions, captains, troops, and events with automatic local persistence.

## Getting Started

```bash
npm install
npm run dev
```

The app persists state to `localStorage`. Use the **Export JSON** button to download a backup of your campaign progress.

## Features

- Phase-based workflow matching the Stronghold turn structure (Income, Projects, Recruitment, PC Actions, Missions, Events)
- Resource tracker with Work Order and Training capacity summaries, festival action, and intel management
- Project and recruitment management with cost enforcement, rush construction mechanic, and progress tracking
- Mission planner with captain/troop assignments, 2d12 rolls, intel-powered rerolls, and outcome logging
- Troop roster with veterancy tracking and status management
- Event log and PC action journal for session notes
- End-of-turn summary modal and JSON export/reset utilities

## Deploying to GitHub Pages

The project is configured for static export so it can be hosted on [GitHub Pages](https://pages.github.com/). Follow these steps after pushing the repository to GitHub:

1. **Ensure the workflow file is present.** The repo includes `.github/workflows/deploy.yml`, which builds the static site and publishes it to Pages whenever you push to the `main` branch.
2. **Enable GitHub Pages.** In your repository settings, open **Pages** and set the source to **GitHub Actions**. GitHub automatically provisions the `github-pages` environment that the workflow uses.
3. **Trigger the deployment.** Push (or re-push) the latest changes to `main`. The `Deploy static site to Pages` workflow installs dependencies, runs `npm run build` (which emits a static export in `out/`), and uploads the result to the `gh-pages` branch GitHub maintains for Pages.
4. **Wait for the workflow to finish.** When the workflow completes you’ll see a deployment link in the Actions run summary and on the repository home page. The published site will be available at `https://<username>.github.io/<repository>/`.

### Local production preview

GitHub Pages serves the app from a sub-path named after the repository. To reproduce the same base path locally you can build with:

```bash
NEXT_PUBLIC_BASE_PATH="/<repository>" npm run build
npx serve out
```

Replace `<repository>` with the actual repository name (for example `stronghold`). The first command generates the static site inside `out/`, and the second previews it locally with any static file server.
