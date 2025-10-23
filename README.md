# Stronghold Steward

A Next.js dashboard for managing a D&D-inspired stronghold turn sequence. Track resources, projects, recruitment, missions, captains, troops, and events with Supabase-backed persistence.

## Getting Started

```bash
npm install
npm run dev
```

The app stores campaign state in Supabase. Use the **Update Campaign** button to push your latest changes, the **Export JSON** button to download a backup of your campaign progress, and the **Import JSON** control to restore a saved snapshot. After importing a backup, review the dashboard to confirm every resource, project, and assignment looks correct before continuing play.

## Features

- Phase-based workflow matching the Stronghold turn structure (Income, Projects, Recruitment, PC Actions, Missions, Events)
- Resource tracker with Work Order and Training capacity summaries, plus a festival action for balancing Wealth, Supplies, and Loyalty once the Town Square is built (campaigns begin at 2 Wealth, 2 Supplies, 1 Loyalty)
- Project and recruitment management with cost enforcement, rush construction mechanic, and progress tracking
- Mission planner with captain/troop assignments, 2d12 rolls, and outcome logging
- Troop roster with status management and mission tracking
- Event log and PC action journal for session notes
- End-of-turn summary modal and JSON import/export/reset utilities
- Optional Supabase-backed realtime sync with a read-only `/viewer` page for your players

## Supabase realtime sync (optional)

You can keep the DM dashboard in sync with a read-only player view by connecting the app to Supabase.

1. Create a table named `campaign_states` with this structure:

   ```sql
   create table if not exists public.campaign_states (
     id text primary key,
     state jsonb not null,
     updated_at timestamptz default timezone('utc', now()) not null
   );

   alter table public.campaign_states enable row level security;
   create policy "Allow anon read" on public.campaign_states for select using (true);
   create policy "Allow anon upsert" on public.campaign_states for insert with check (true);
   create policy "Allow anon update" on public.campaign_states for update using (true);
   ```

   > ⚠️ Adjust the policies to match your security expectations. The example above allows anyone with the anon key to read and write the campaign record. For production use you should scope the policies to the specific `id` value you plan to use.

2. Enable [Realtime](https://supabase.com/docs/guides/realtime/postgres-changes) for the table in the Supabase dashboard.
3. Copy `.env.example` to `.env.local` and fill in your Supabase URL, anon key, and (optionally) a custom `NEXT_PUBLIC_SUPABASE_CAMPAIGN_ID` if you want to maintain multiple campaigns in the same project.
4. Start the dev server with `npm run dev`. The DM dashboard (`/`) will publish every change to Supabase while the `/viewer` route streams the updates in real time.

When the Supabase variables are not configured the app continues to use local-only persistence.

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
