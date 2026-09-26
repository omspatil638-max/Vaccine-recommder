import { Bell, CalendarClock, CheckCircle2, ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';
import Notice from '../../components/ui/Notice';
import StatusBadge, { DemoBadge } from '../../components/ui/StatusBadge';
import { STATUS } from '../../components/ui/status';
import { Band, Card, SectionHead, StatTile, VaccineIcon } from '../../components/ui/Surface';
import { VACCINE_CATEGORY } from '../../lib/vaccineMeta';

const COLOURS = [
  { group: 'Primary · blue-teal', items: [['deep', 'Brand surface: rail, top bar, hero panels'], ['accent', 'Actions, links, progress'], ['sky', 'Tinted section / feature panel'], ['accent-soft', 'Icon discs, selected options']] },
  { group: 'Attention · amber', items: [['attention', 'Due now, check first, review (text-safe)'], ['attention-fill', 'Marks and dots only'], ['attention-soft', 'Attention backgrounds']] },
  { group: 'Neutrals · structure', items: [['ink', 'Headings, primary text'], ['ink-2', 'Secondary text'], ['ink-3', 'Meta, captions'], ['rule', 'Hairlines'], ['paper', 'Page'], ['surface', 'Cards'], ['paper-2', 'Section bands']] },
  { group: 'Reserved meaning', items: [['ok', 'Fine to proceed'], ['stop', 'Genuine safety issue only']] },
];

const TYPE = [
  ['text-display', 'Display · h1', '36 → 56px · Manrope 700–800', 'Where you may be able to get vaccinated'],
  ['text-3xl', 'Key figure', '40px · Manrope 700', '5 recommended'],
  ['text-2xl', 'Section title · h2', '28px · Manrope 700', 'Current recommendations'],
  ['text-xl', 'Item title · h3', '22px · Manrope 700', 'Shingles vaccine'],
  ['text-lg', 'Lede, questions', '18px · Public Sans 400', 'Answer a few questions about you.'],
  ['text-base', 'Body', '16px · Public Sans 400 · line-height 1.6', 'One flu vaccine every year is recommended for all adults.'],
  ['text-sm', 'Meta, labels', '14px · Public Sans 500', 'Last checked 25 September 2026'],
  ['text-xs', 'Caption, badge', '13px · Public Sans 500 (floor)', 'Rule reference'],
];

const SPACE = [
  ['2xs', 4, '1'],
  ['xs', 8, '2'],
  ['sm', 12, '3'],
  ['md', 16, '4'],
  ['lg', 24, '6'],
  ['xl', 32, '8'],
  ['2xl', 48, '12'],
  ['3xl', 80, '20'],
  ['4xl', 128, '32'],
];

function Swatch({ token, role }) {
  return (
    <li className="flex items-center gap-3">
      <span className="h-10 w-10 shrink-0 rounded-sm border border-rule" style={{ background: `var(--${token})` }} aria-hidden="true" />
      <span className="min-w-0 text-sm">
        <span className="code block text-ink">{token}</span>
        <span className="text-ink-2">{role}</span>
      </span>
    </li>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-20 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <h1 className="text-display">Design system</h1>
        <p className="prose-measure text-lg text-ink-2">
          The tokens and building blocks every page uses. Values come from <span className="code">styles/tokens.css</span>; the rules live
          in <span className="code">design.md</span>. Sample values on this page are illustrations, not user data.
        </p>
      </header>

      <section aria-labelledby="colour">
        <SectionHead id="colour" title="Colour" description="One primary family, one attention accent, neutrals for structure, and two colours reserved for safety meaning." />
        <div className="grid gap-10 md:grid-cols-2">
          {COLOURS.map((g) => (
            <div key={g.group} className="space-y-3">
              <h3 className="text-lg">{g.group}</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {g.items.map(([token, role]) => (
                  <Swatch key={token} token={token} role={role} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="type">
        <SectionHead id="type" title="Type scale" description="One size and weight per role. Manrope for headings and figures, Public Sans for reading." />
        <ul className="divide-y divide-rule border-y border-rule">
          {TYPE.map(([cls, role, spec, sample]) => (
            <li key={cls} className="grid gap-2 py-5 md:grid-cols-[14rem_minmax(0,1fr)] md:items-baseline md:gap-8">
              <div className="text-sm">
                <p className="font-semibold text-ink">{role}</p>
                <p className="text-ink-3">{spec}</p>
              </div>
              <p className={`${cls} ${cls.match(/display|3xl|2xl|xl$/) && cls !== 'text-lg' ? 'font-display font-bold tracking-tight' : ''} min-w-0`}>{sample}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="space">
        <SectionHead
          id="space"
          title="Spacing"
          description="A 4pt scale. Each named step maps to one Tailwind number; numbers off this list aren’t used."
        />
        <ul className="space-y-2">
          {SPACE.map(([name, px, tw]) => (
            <li key={name} className="grid grid-cols-[4rem_7rem_minmax(0,1fr)] items-center gap-4 text-sm">
              <span className="code text-ink">{name}</span>
              <span className="data text-ink-3">
                {px}px · <span className="code">-{tw}</span>
              </span>
              <span className="h-3 rounded-full bg-accent" style={{ width: `${px}px` }} aria-hidden="true" />
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-2">
          Rhythm: items within a group use sm–md, groups within a section use lg–xl, sections use 2xl–3xl. Section padding is uneven on purpose
          (more above than below).
        </p>
      </section>

      <section aria-labelledby="icons">
        <SectionHead id="icons" title="Icons" description="Lucide only. One icon per vaccine category and per status; status icons always sit next to their words." />
        <div className="grid gap-10 md:grid-cols-2">
          <ul className="space-y-3">
            {Object.entries(VACCINE_CATEGORY).map(([key, c]) => {
              const sample = { respiratory: 'influenza', routine: 'tdap', spread: 'mmr', bloodborne: 'hepb', age: 'zoster' }[key];
              return (
                <li key={key} className="flex items-center gap-3">
                  <VaccineIcon vaccineId={sample} />
                  <span>{c.label}</span>
                </li>
              );
            })}
          </ul>
          <ul className="space-y-3">
            {Object.keys(STATUS).map((s) => (
              <li key={s}>{s === 'DEMO' ? <DemoBadge /> : <StatusBadge status={s} />}</li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="components">
        <SectionHead id="components" title="Building blocks" description="Cards only for real objects. Bands and tinted panels separate sections, never nested." />
        <div className="space-y-10">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">Primary, large</Button>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="quiet">Quiet link</Button>
            <Button disabled>Disabled</Button>
            <Button loading loadingLabel="Saving…">
              Loading
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label="Recommended" value="5" note="Sample value" icon={CheckCircle2} tone="ok" />
            <StatTile label="Due now" value="3" note="Sample value" icon={Bell} tone="attention" />
            <StatTile label="Next dose" value="12 Oct" note="Sample value" icon={CalendarClock} />
          </div>

          <Card className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <VaccineIcon vaccineId="zoster" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl">Card · one object, one unit</h3>
                <StatusBadge status="RECOMMENDED" />
              </div>
              <p className="text-ink-2">Status, reason, timing and source for one vaccine sit together in one card, so nothing has to be reassembled.</p>
              <p className="text-sm text-ink-3">Source line · last checked date</p>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Band tone="paper-2">
              <p className="font-semibold">paper-2 band</p>
              <p className="text-sm text-ink-2">Neutral section separation</p>
            </Band>
            <Band tone="sky">
              <p className="font-semibold">sky panel</p>
              <p className="text-sm text-ink-2">The page’s one key moment</p>
            </Band>
            <Band tone="deep">
              <p className="font-semibold">deep panel</p>
              <p className="text-sm text-on-deep-muted">Hero / brand moments</p>
            </Band>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Notice tone="caution" title="Attention">Needs a professional’s advice first.</Notice>
            <Notice tone="stop" title="Safety issue">
              <span className="inline-flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Reserved for genuine safety findings.
              </span>
            </Notice>
            <Notice tone="info" title="Information">More information would help.</Notice>
            <Notice tone="demo" title="Demo data">Simulated provider information is always labelled.</Notice>
          </div>
        </div>
      </section>
    </div>
  );
}
