# OkadaGo

OkadaGo is a motorcycle ride-hailing and operations prototype for Abeokuta, Ogun State, Nigeria. It includes passenger booking, a driver workflow, and an operations dashboard.

## Requirements

- Bun (recommended; the repository includes `bun.lock`)
- Node.js 20.19+ or 22.12+ if using npm, compatible with the installed Vite version

## Getting started

```bash
bun install
cp .env.example .env
bun run dev
```

The app can run in demo mode without Supabase credentials. To configure the optional Supabase client, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Vite development server |
| `bun run build` | Create a production build in `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run the TypeScript no-emit check |
| `bun run clean` | Remove the generated `dist/` directory |

## Project structure

- `src/components/passenger` — passenger booking and ride experience
- `src/components/driver` — driver workflow and wallet UI
- `src/components/admin` — operations dashboard and reviews
- `src/services` — ride service and Supabase client
- `src/data` — local landmark data
- `src/utils` — shared utilities such as fare calculations
- `public/` — app icons and web app manifest

## Important prototype notes

The current ride service includes demo data and simulated ride behaviour. Demo authentication, simulated driver movement, and displayed payment options should not be treated as production integrations. Review backend persistence, identity verification, payment processing, dispatch, and emergency escalation before a live launch.

Never commit real credentials or private driver/customer information. Keep local environment files out of version control; only the example template belongs in the repository.
