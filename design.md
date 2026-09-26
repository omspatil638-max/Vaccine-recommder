# Design — Vaccination guidance

The locked design system for this app. Every page reads this file before any UI
code is written. Extend or amend it here; never improvise per page.

Method adapted from the Hallmark design discipline (structure first, locked
tokens, honest copy, eight interaction states). No Hallmark branding, copy or
assets are used.

Revision 3 adds a second reference (a clean portfolio-style product site): large
confident headings, generous whitespace, a restrained palette, one obvious action
per view, and vertical storytelling. Taken as principles only — no layout, colour
or copy from it.

## Brief

- **Audience** — adults deciding about their own vaccinations, often on a phone,
  sometimes anxious, rarely medically trained.
- **Use case** — understand which vaccinations may be relevant, why, whether
  anything needs a professional's review, and what to do next.
- **Tone** — utilitarian-editorial. Calm, clinical, typographic. Trust over flash.
- **Genre** — editorial.

## Structure by page type

| Page type | Shape | Notes |
| --- | --- | --- |
| Intake wizard (`/start/*`) | Step sequence | One purpose per screen. Progress on top, Back/Continue pinned to the bottom on mobile. No global nav. |
| Recommendations, history | Ledger | A one-line summary of what was checked, an index of status groups with counts, then rows. Groups open with a 2px ink rule; rows are separated by hairlines. Each row: reasoning on the left, a 15rem margin column with status, timing and text-link actions on the right. |
| Vaccine detail | Long document + margin column | 65ch prose on the left; a sticky "At a glance" column on the right (status, timing, type, last checked, the page's only filled button). On mobile the column comes first. |
| After-care, sources | Long document | Single column, 65ch measure, inline section heads, tables for dose data. |
| Providers | List first, map second | The list must work alone on a 320px screen. |
| Home | Overview | At most four regions: next action, timeline, notices, recent activity. |

## Revision 5 — design system (steps 1–2 of the multi-page rebuild)

Live reference: **/design-system**. Tokens: `frontend/src/styles/tokens.css`. Concrete values
taken from the Hallmark reference files (`repo_referernce/hallmark/site/examples/tally/tokens.css`,
`styles.css` `.bench` console pattern, `skills/hallmark/references/layout-and-space.md`).

- **Colour:** primary blue-teal family (`deep`, `accent`, `sky`); one attention accent, amber
  (`attention`, text-safe; `attention-fill` for marks only); neutrals for structure (`ink*`,
  `paper`, `surface`, `paper-2/3`, `rule*`); `ok` green and `stop` red reserved for safety meaning.
- **Type roles:** display h1 36→56 · key figure 40 · h2 28 · h3 22 · lede/questions 18 · body 16 ·
  meta 14 · caption 13 (floor). One size and weight per role.
- **Spacing:** 4pt named scale 2xs 4 · xs 8 · sm 12 · md 16 · lg 24 · xl 32 · 2xl 48 · 3xl 80 · 4xl 128,
  mapped 1:1 to Tailwind 1·2·3·4·6·8·12·20·32. Other numbers are not used. Within a group sm–md,
  between groups lg–xl, between sections 2xl–3xl, uneven (more above than below).
- **Surfaces:** page `paper` → card `surface` (hairline + whisper shadow, 12px radius) → band
  `paper-2` / feature `sky` / brand `deep` (20px radius). Never nest cards or panels.
- **Building blocks** (`components/ui/Surface.jsx`): `Card`, `Band`, `SectionHead` (title left,
  description right, bottom-aligned, stacks on phones), `StatTile` (real counts only),
  `VaccineIcon` (category icon from `lib/vaccineMeta.js`, Lucide only).
- **Routes:** Overview `/home`, Recommendations `/recommendations`, Safety `/safety`, Clinical
  review `/review`, Providers, Schedule, History, Profile — each its own URL with working Back.
  Phones: five tabs + a Menu with every page.

## Journey moments (revision 3)

| Moment | Composition |
| --- | --- |
| Sign-in | Left: one short statement (display size), one supporting sentence, the "How it works" journey figure (four connected nodes; the last is open). Right: the form, with a large Sign in button. Mobile: statement + form only. |
| Intake step | Statement-size title, one-line purpose, sections with 28px titles, 18px questions, large Continue; Back is a quiet text link. Completed progress connectors fill with the accent. |
| Safety | Group related questions; no card per field. A severe allergy gets one restrained red line with an icon, nothing louder. |
| Result | The outcome as a sentence ("5 vaccinations recommended for you"), a one-line "Also: …", a unit strip (one mark per vaccine, status colour, hover names it, legend = index), then Find providers (large primary), Update my answers, Re-check. The ledger follows. |
| Providers | A directory, not a card grid: pin marker · name, type, distance, address · a bordered availability/cost table · hours and one text-link action. |
| Schedule | A vertical timeline: date in the margin, a node on a connecting line (filled = due now, open = later, amber = needs advice), then title, detail and Done / Dismiss. |

## Imagery

No stock photography. The only visuals are hand-built and tied to the task: the
dose-sequence mark, the journey figure, the result strip, dose and schedule timelines.

## Navigation

- **Desktop (≥ 1024px): side rail.** 15rem, `paper-2`, full height, sticky. Wordmark, the five places
  (Today · My vaccines · Find providers · Schedule · History), one action (Record a vaccination),
  then the demo marker and Account pinned to the bottom. The active item uses a `paper-3` fill, not a stripe.
- **Below 1024px:** a slim top bar (wordmark, account, demo line) and a fixed five-tab bottom bar.
- The intake wizard has no global navigation: progress on top, Back / Continue at the bottom.
- The wordmark's mark is a dose sequence (two given, one to come). No medical crosses or syringes as logos.

## Action hierarchy

- One filled primary button per view. Row-level actions are text links with a trailing arrow.
- Record-level objects (a provider, a dose) may be cards with a secondary button.
- Demo data is marked once in the chrome (rail or top line), once per record (badge), and at most
  one plain line per page. Never a boxed banner on top of that.

## Forms

- A field's error disappears as soon as the user changes that field; the step summary clears on the
  next input. Errors never linger under a corrected value.

## Typography

- Display — **Manrope** 700/800, roman, tracking −0.015em (headings) to −0.025em (display).
  Chosen for a clean, confident sans headline; Inter and Poppins are avoided as the most
  over-used defaults.
- Body — **Public Sans** 400/500/600, 16px, line-height 1.6. Ledes 18–20px.
- Data — dates and numbers use the body face with tabular figures (`.data`). **IBM Plex Mono** (`.code`) only for technical identifiers such as rule references and engine versions.
- Sizes — `text-display` (page titles, 36→56px fluid), `text-statement` (wizard titles and
  in-flow statements, 32→48px fluid), then 28 · 22 · 18 · 16 · 14 · 13.
- Wizard questions are 18px bold display; section titles above them are 28px, so a
  section always outranks its questions.
- Prose measure capped at 65ch. Sentence case everywhere. No decorative eyebrows.

## Colour

All colours are OKLCH tokens in `frontend/src/styles/tokens.css`. Components use
token names only (Tailwind classes `bg-paper`, `text-ink`, `border-rule`, ...).

- **Revision 4 (user direction: "too dull")** — colour now has three layers:
  1. **Brand surface, deep ocean blue (`deep`, h245).** The desktop side rail, the mobile top bar
     and the sign-in feature panel. Text on it is `on-deep` / `on-deep-muted`; links and focus
     rings switch to `accent-bright` so contrast holds.
  2. **Action teal (`accent`, h212).** Buttons, links, progress. `accent-bright` (a light
     aqua) is used only on the brand surface: the logo mark, the highlighted word in the
     sign-in statement, journey nodes.
  3. **Feature panels, sky (`sky`).** One tinted, rounded panel per page for its key moment:
     the result header, Home's next step, a vaccine's "At a glance". Never nested, never a
     panel on every section.
- Paper keeps a visible cool tint; the wizard header sits on `paper-2`.
- Status colours are richer but keep their meaning: green = fine to proceed, amber = check
  first, red = genuine safety issue only. Always with an icon and a label.
- Solid colour only. Still no gradients, glass or pure black/white.

| Status token | Meaning |
| --- | --- |
| `ok` | Recommended · up to date · available |
| `caution` | Talk to a healthcare professional · precaution · limited |
| `stop` | Not recommended right now (contraindication identified) · unavailable |
| `info` | More information needed · not verified · data unavailable (ink-blue, not a new hue) |
| `neutral` | Not currently indicated |
| `demo` | Simulated data: slate, dashed outline, always labelled "Demo data" (pattern + words, no extra hue) |

## Space, shape, depth

- 4px spacing scale (Tailwind default units). Section gaps 48–64px desktop, 32px mobile.
- Radius: 6px controls, 10px containers, 16px for the one feature panel per page. No pills except status badges.
- Depth comes from hairline rules and paper steps, not shadows. One shadow token
  exists for overlays (menus, drawers) only.
- Cards only for real objects (a provider, a dose record). Never card-in-card.

## Interaction

- Every control ships 8 states: default, hover, focus-visible, active, disabled,
  loading, error, success.
- Focus ring: 2px `--focus` outline, 2px offset, appears instantly.
- Touch targets ≥ 44×44px.
- Labels above inputs; placeholders show format only; validate on blur; error
  text replaces hint text and is linked with `aria-describedby`.
- Motion: opacity/transform only, ≤ 200ms, `--ease-out`. Reduced motion → none.

## Copy rules

- No invented numbers, clinicians, reviews, stock, prices or "live" indicators.
- Missing data is shown as a named state ("Price not available",
  "Availability could not be verified"), never as an empty space or a guess.
- Every medical statement shows its source and when it was last checked.
- Say "may be relevant" and "talk to a healthcare professional", never "you must".

## Banned (revision 2 additions)

- The horizontal "wordmark · centred links · account" top nav on desktop.
- More than one filled button per view; repeated identical button pairs on list rows.
- Lists that repeat another list on the same page (e.g. reminders duplicating "due now" rows).

## Banned

Gradient backgrounds or text, glassmorphism, side-stripe alert cards, stat-counter
strips, icon-above-heading feature grids, hover-lift on static content, italic
headings, colour-only status, repeated full-width disclaimers on every page.
