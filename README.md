# ImmunoGuard: guided vaccination guidance

A guided web app that helps an adult understand which vaccinations may be relevant to them, why, what safety
considerations apply, and where they might get them.

The journey: **sign in → intake (profile, location, health, vaccination history, safety) → review → assessment →
explained results → vaccine details → providers, availability and cost → record a dose → after-care → reminders and history.**
The home page is an overview, not a dashboard of every feature.

## Run it

Double-click `start.bat`, or run the two servers yourself:

```
cd backend  && python -m uvicorn app.main:app --port 8000
cd frontend && npm run dev
```

Then open http://localhost:5173 and create an account.

Requirements: Python 3.11+ and Node 20+. Everything is free and local: SQLite database, OpenStreetMap tiles, no paid APIs.

## Tests

```
cd backend  && python -m pytest -q        # 67 tests: engine rules, API journey, security
cd frontend && npm run build && npm run lint
cd frontend && node e2e/journey.mjs       # 23-step browser journey (needs both servers running and Microsoft Edge)
```

## How recommendations are made

- **Deterministic rules, not AI.** `backend/engine/` evaluates versioned rule files in `data/knowledge/` using
  three-valued logic (yes / no / unknown). The same answers always give the same result, and "not sure" is never treated as "no".
- **Every rule is traceable:** rule → guideline section → source URL → publication date → date retrieved. The loader
  refuses to start if a rule lacks a source.
- **Jurisdictions:** United States (CDC Adult Immunization Schedule, "Addendum updated July 2, 2025") and India
  (MoHFW National Immunization Schedule, Td in pregnancy). Other countries get an explicit "no guideline" result;
  countries' guidance is never mixed.
- **Statuses:** Recommended · May be appropriate · Talk to a healthcare professional · Not recommended right now
  (contraindication) · More information needed · Up to date · Not currently indicated.

To update medical guidance, edit the JSON under `data/knowledge/<set>/`, update `last_verified` and the source
`retrieved_at` dates, and run the tests.

## Data honesty

- Provider, availability and price data is **demo data** (`data/demo/providers.json`), labelled everywhere it
  appears. With `DEMO_MODE=false` the app shows "provider data unavailable" instead.
- There is no booking integration, so the app offers contact information and never shows a fake "Book" button.
- No email service is connected. In demo mode the password-reset link is shown on screen.

## Configuration (environment variables)

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///backend/data/app.db` | Database |
| `DEMO_MODE` | `true` | Show labelled demo provider data |
| `CORS_ORIGINS` | `http://localhost:5173,…` | Allowed browser origins |
| `COOKIE_SECURE` | `false` | Set `true` when served over HTTPS |
| `FRONTEND_URL` | `http://localhost:5173` | Used in password-reset links |

## Project layout

```
backend/app/        FastAPI app: auth, intake, assessments, providers, reminders, account
backend/engine/     Rule engine (facts, logic, series timing, evaluation)
data/knowledge/     Versioned guideline rules with sources
data/demo/          Demo provider data
frontend/src/       React app (routes.jsx is the map of every page)
design.md           Locked design system
SESSION_SUMMARY.txt What was built and why
```

The previous single-page prototype is still reachable at `/legacy` for comparison.
