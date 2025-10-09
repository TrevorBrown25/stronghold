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
