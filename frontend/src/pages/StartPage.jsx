import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Start page — the first screen. Enter age (plus a couple of details) and get
 * vaccine guidance. Minimal mono + electric-blue theme, India-specific.
 * Ported from the approved design canvas.
 */
export default function StartPage() {
  const navigate = useNavigate();
  const [age, setAge] = useState('');
  const [travel, setTravel] = useState(null);

  const ageHint = useMemo(() => {
    if (age === '') return '';
    const n = parseInt(age, 10);
    if (Number.isNaN(n)) return '';
    if (n < 18) return "We'll check the schedule for under-18s.";
    if (n >= 65) return "We'll include vaccines recommended from 65+.";
    if (n >= 50) return "We'll include vaccines recommended from 50+.";
    return "We'll check the adult schedule for you.";
  }, [age]);

  function handleSubmit(e) {
    e.preventDefault();
    navigate('/age-groups');
  }

  return (
    <div className="start-page" style={S.page}>
      <style>{css}</style>

      <header style={S.header}>
        <Link to="/" style={S.brand} aria-label="VaxWise home">
          <svg width="34" height="18" viewBox="0 0 34 18" aria-hidden="true">
            <line x1="7" y1="9" x2="27" y2="9" stroke="var(--rule-strong)" strokeWidth="2" />
            <circle cx="7" cy="9" r="5" fill="var(--accent)" />
            <circle cx="17" cy="9" r="5" fill="var(--accent)" />
            <circle cx="27" cy="9" r="5" fill="var(--paper)" stroke="var(--rule-strong)" strokeWidth="2" />
          </svg>
          <span style={S.wordmark}>VaxWise</span>
        </Link>
        <Link to="/home" style={S.navlink}>Explore the guide</Link>
      </header>

      <div style={S.grid}>
        <section style={S.formCol}>
          <div style={{ maxWidth: 560 }}>
            <span className="pill" style={S.pill}>Free · no account needed</span>
            <h1 style={S.h1}>
              Which vaccines do <span style={{ color: 'var(--accent)' }}>you</span> need?
            </h1>
            <p style={S.lede}>
              Enter a few details and get a personal list in under two minutes — with the
              reason and source for each.
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
              <div style={S.ageRow}>
                <div>
                  <label htmlFor="age" style={S.label}>Your age</label>
                  <input
                    id="age"
                    type="number"
                    min="0"
                    max="120"
                    inputMode="numeric"
                    placeholder="e.g. 34"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{ ...S.input, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}
                  />
                </div>
                <p className="data" style={S.ageHint}>{ageHint}</p>
              </div>

              <div style={S.twoCol}>
                <div>
                  <label htmlFor="sex" style={S.label}>Sex at birth</label>
                  <select id="sex" style={S.input} defaultValue="Female">
                    <option>Female</option>
                    <option>Male</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="region" style={S.label}>Where you live</label>
                  <select id="region" style={S.input} defaultValue="India">
                    <option>India</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label style={S.label}>Planning to travel abroad in the next year?</label>
                <div className="seg" style={S.seg}>
                  <button type="button" aria-pressed={travel === true} onClick={() => setTravel(true)}>Yes</button>
                  <button type="button" aria-pressed={travel === false} onClick={() => setTravel(false)}>No / not sure</button>
                </div>
              </div>

              <button type="submit" className="cta" style={S.cta}>
                Get my recommendations
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <p className="data" style={S.fine}>
                Based on India&rsquo;s NIS, IAP &amp; WHO 2026 schedules · guidance, not a diagnosis · your answers stay private.
              </p>
            </form>
          </div>
        </section>

        <aside style={S.imageCol}>
          <img
            src={`${import.meta.env.BASE_URL}images/doctor-consult.jpg`}
            alt="A doctor talking with a patient at a desk"
            style={S.image}
          />
          <div style={S.imageCard}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Checked against real clinical schedules</p>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              Every result links to its source and when it was last reviewed — and tells you when to see a professional.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)', color: 'var(--ink)' },
  header: { flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--rule)' },
  brand: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' },
  wordmark: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.03em' },
  navlink: { fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', textDecoration: 'none' },
  grid: { flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(320px, 520px)', minHeight: 0 },
  formCol: { padding: 'clamp(32px, 5vw, 56px)', overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  pill: { display: 'inline-block', fontFamily: 'var(--font-data)', fontSize: 13, letterSpacing: '0.04em', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '6px 12px', borderRadius: 999 },
  h1: { margin: '20px 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4vw, 46px)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.03em' },
  lede: { margin: '16px 0 0', fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.5 },
  ageRow: { display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, alignItems: 'end' },
  twoCol: { marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, margin: '0 0 7px', color: 'var(--ink-2)' },
  input: { width: '100%', fontFamily: 'var(--font-body)', fontSize: 16, padding: '13px 14px', border: '1px solid var(--rule-strong)', borderRadius: 8, background: 'var(--surface)', color: 'var(--ink)' },
  ageHint: { margin: '0 0 4px', fontSize: 14, color: 'var(--ink-3)', minHeight: 20 },
  seg: { display: 'flex', gap: 10, borderRadius: 8 },
  cta: { marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 17, padding: '16px 28px', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)' },
  fine: { margin: '18px 0 0', fontSize: 13, color: 'var(--ink-3)' },
  imageCol: { position: 'relative', background: 'var(--paper-2)' },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imageCard: { position: 'absolute', left: 28, right: 28, bottom: 28, background: 'var(--surface)', border: '1px solid var(--rule)', borderRadius: 14, padding: '18px 20px', boxShadow: 'var(--shadow-panel)' },
};

const css = `
.start-page input::placeholder{color:var(--ink-3)}
.start-page input:focus-visible,.start-page select:focus-visible,.start-page .cta:focus-visible,.start-page a:focus-visible,.start-page .seg button:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.start-page .cta:hover{background:var(--accent-hover)}
.start-page .navlink:hover{color:var(--accent)}
.start-page .seg button{flex:1;padding:12px;font-size:15px;font-weight:600;border:1px solid var(--rule-strong);background:var(--surface);color:var(--ink-2);border-radius:8px;cursor:pointer;font-family:var(--font-body)}
.start-page .seg button[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-hover)}
@media (max-width: 860px){
  .start-page > div:last-child{grid-template-columns:1fr !important}
  .start-page aside{min-height:280px;order:-1}
}
`;
