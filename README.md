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

Requirements: Python 3.11+ and Node 20+. The app uses SQLite locally; optional email alerts require an SMTP service configured by the operator.

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
- Patient accounts can opt in to in-app and email vaccine-update alerts. Email requires SMTP configuration; it is disabled until configured. Password-reset emails are not connected yet.
- Alert updates are curated in `frontend/src/data/updates.json`. An entry must have a unique `id`, `type` (`new` or `updated`), ISO `date`, ISO `reviewedAt`, HTTPS `sourceUrl`, `jurisdiction`, `engineVaccineId`, `title`, and `summary`. Its engine ID and jurisdiction must match the patient’s assessment. Add entries only after checking the official source, product status, and country guideline. The feed is empty until reviewed entries are ready; older entries without evidence metadata were removed.
- The signed-in account checks the feed as it is used. To also deliver alerts while patients are signed out, schedule this one-shot job every 15 minutes on the backend host (run from the backend directory): `python -m app.notification_worker`. On Windows, configure Task Scheduler; on Linux, use a cron timer. Run one worker instance at a time.
- India adult assessment currently covers Td vaccination during pregnancy only. Other Indian adult vaccine-market announcements will not produce personalized alerts until their country-specific assessment rules are added and reviewed.

## Configuration (environment variables)

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///backend/data/app.db` | Database |
| `DEMO_MODE` | `true` | Show labelled demo provider data |
| `CORS_ORIGINS` | `http://localhost:5173,…` | Allowed browser origins |
| `COOKIE_SECURE` | `false` | Set `true` when served over HTTPS |
| `FRONTEND_URL` | `http://localhost:5173` | Used in password-reset links |
| `SMTP_HOST` | empty | SMTP host for opt-in patient update alerts |
| `SMTP_PORT` | `587` | SMTP port (STARTTLS) |
| `SMTP_USERNAME` | empty | Optional SMTP username |
| `SMTP_PASSWORD` | empty | Optional SMTP password |
| `SMTP_FROM` | empty | Verified sender address; required to enable email alerts |

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
