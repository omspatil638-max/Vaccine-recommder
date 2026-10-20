/**
 * In-browser mock backend.
 *
 * The real service is a FastAPI app + database that is NOT deployed on Netlify
 * (only the frontend is). To keep accounts working on a free, static host with
 * no server, this module reproduces the API the UI needs, backed by the
 * browser's localStorage. It is enabled by default and can be turned off with
 * VITE_USE_MOCK=false when a real backend is reachable (see api.js).
 *
 * IMPORTANT, and surfaced to users in the UI: accounts created here live only
 * in THIS browser on THIS device. There is no server, no sync between devices,
 * and this is not real security — suitable for a demo / educational project,
 * never for real patient data.
 *
 * Response shapes mirror the FastAPI backend so no UI component needs changing.
 */
import vaccines from '../data/vaccines.json';
import { ApiError } from './api';

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const NS = 'smartvax.v1';
const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(`${NS}.${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(`${NS}.${key}`, JSON.stringify(value));
  } catch {
    /* private mode / quota — the session still works in memory for this page */
  }
}

function uid() {
  return (crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/-/g, '');
}

// A deliberately lightweight, NON-cryptographic hash. localStorage is readable
// on the device anyway, so this only avoids storing the password verbatim.
function weakHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return `h${h.toString(16)}`;
}

const today = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();

// users: { [email]: {id, email, passwordHash, createdAt, onboardingCompletedAt} }
const getUsers = () => read('users', {});
const setUsers = (u) => write('users', u);
const getSession = () => read('session', null); // userId or null
const setSession = (id) => write('session', id);

// Per-user bundle of everything else.
function blankBundle() {
  return {
    profile: null,
    location: null,
    health: null,
    history: null,
    safety: null,
    records: [],
    reminders: [],
    saved: [],
    activity: [],
    assessments: [],
    notifications: [],
    notificationPref: { inAppUpdates: true, emailUpdates: false },
    resets: {}, // token -> {expires}
  };
}
const getBundle = (id) => ({ ...blankBundle(), ...read(`user.${id}`, {}) });
const setBundle = (id, b) => write(`user.${id}`, b);

function userById(id) {
  const users = getUsers();
  return Object.values(users).find((u) => u.id === id) || null;
}

function audit(bundle, entity, action, fields = []) {
  bundle.activity.unshift({ id: uid(), at: nowIso(), entity, action, fields });
  bundle.activity = bundle.activity.slice(0, 100);
}

// ---------------------------------------------------------------------------
// Catalog (answer vocabularies), derived where possible from vaccines.json
// ---------------------------------------------------------------------------

const SET_ID = 'in-uip';

const GUIDELINE = {
  id: SET_ID,
  name: 'India — MoHFW / NTAGI / API adult immunisation',
  version: '2026.1',
  last_verified: today(),
  publisher: 'MoHFW / NTAGI / Association of Physicians of India',
  scope_note: 'Adult immunisation guidance for India. We never mix other countries’ recommendations.',
  jurisdiction: 'IN',
};

const CONDITION_LABELS = {
  diabetes: 'Diabetes',
  respiratory: 'Asthma, COPD or another long-term lung condition',
  cardiovascular: 'Heart disease',
  kidney: 'Chronic kidney disease',
  liver: 'Chronic liver disease',
  asplenia: 'No spleen, or a spleen that doesn’t work',
};

// Only genuine long-term medical conditions belong on the Health step. Other
// tags in vaccines.json (general-adult, healthcare, travel, regional-endemic,
// animal-exposure, reproductive-health) are circumstances, not conditions.
// Pregnancy (profile) and weakened immune system (its own question) are asked
// separately, so they are excluded here too.
const CONDITIONS = (() => {
  const present = new Set();
  for (const v of vaccines) for (const c of v.healthConditions || []) present.add(c);
  return Object.keys(CONDITION_LABELS)
    .filter((code) => present.has(code))
    .map((code) => ({ code, label: CONDITION_LABELS[code] }));
})();

const SAFETY_QUESTIONS = [
  { code: 'moderate_severe_illness_today', label: 'Are you unwell with a moderate or severe illness today?' },
  { code: 'guillain_barre_history', label: 'Have you ever had Guillain-Barré syndrome?' },
  { code: 'recent_blood_product', label: 'Have you had blood, plasma or immunoglobulin in the last year?' },
  { code: 'recent_live_vaccine', label: 'Have you had a live vaccine in the last 4 weeks?' },
];

const ALLERGY_CATEGORIES = ['vaccine_component', 'medication', 'food', 'other'];
const ALLERGY_SEVERITIES = ['anaphylaxis', 'non_severe', 'unsure'];
const ALLERGY_SUBSTANCES = [
  { code: 'egg', label: 'Egg' },
  { code: 'gelatin', label: 'Gelatin' },
  { code: 'neomycin', label: 'Neomycin or other antibiotics' },
  { code: 'latex', label: 'Latex' },
  { code: 'yeast', label: 'Yeast' },
  { code: 'previous_vaccine', label: 'A previous vaccine or its contents' },
  { code: 'other', label: 'Something else' },
];
const REACTION_KINDS = [
  { code: 'allergic', label: 'An allergic reaction' },
  { code: 'fever_seizure', label: 'A fever with a seizure' },
  { code: 'fainting', label: 'Fainting' },
  { code: 'other', label: 'Another reaction' },
];

const IN_REGIONS = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
];

function shortNameOf(v) {
  return v.name.replace(/\s*\([^)]*\)/g, '').replace(/\s*Vaccine$/i, '').trim() || v.name;
}

const VACCINE_LIST = vaccines.map((v) => ({
  id: v.id,
  name: v.name,
  shortName: shortNameOf(v),
  protectsAgainst: v.prevention,
}));

const PRODUCTS = {}; // no product sub-choices in the mock

function catalog() {
  return {
    jurisdictions: [
      {
        code: 'IN',
        name: 'India',
        guideline: {
          name: GUIDELINE.name,
          publisher: GUIDELINE.publisher,
          version: GUIDELINE.version,
          scope_note: GUIDELINE.scope_note,
        },
        regions: IN_REGIONS,
        regionLabel: 'State / Union Territory',
      },
      { code: 'OTHER', name: 'Another country', guideline: null, regions: [], regionLabel: 'Region' },
    ],
    conditions: CONDITIONS,
    safetyQuestions: SAFETY_QUESTIONS,
    allergyCategories: ALLERGY_CATEGORIES,
    allergySeverities: ALLERGY_SEVERITIES,
    allergySubstances: ALLERGY_SUBSTANCES,
    reactionKinds: REACTION_KINDS,
    products: PRODUCTS,
    vaccinesBySet: { [SET_ID]: VACCINE_LIST },
  };
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

const STEPS = ['profile', 'location', 'health', 'history', 'safety', 'review'];

function progressOf(user, bundle) {
  const done = {};
  for (const s of STEPS.slice(0, -1)) done[s] = bundle[s] != null;
  done.review = user.onboardingCompletedAt != null;
  const completed = STEPS.filter((s) => done[s]);
  const nextStep = STEPS.find((s) => !done[s]) ?? null;
  return { completed, nextStep, onboardingComplete: done.review };
}

function me(user, bundle) {
  return { user: { id: user.id, email: user.email }, progress: progressOf(user, bundle) };
}

// ---------------------------------------------------------------------------
// The assessment ("recommendation engine"), India-focused, from vaccines.json
// ---------------------------------------------------------------------------

function ageFrom(birthDate) {
  const b = new Date(birthDate);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age -= 1;
  return age;
}

function ageGroupOf(age) {
  if (age <= 29) return '18-29';
  if (age <= 49) return '30-49';
  if (age <= 64) return '50-64';
  return '65+';
}

function assess(bundle) {
  const loc = bundle.location;
  if (!loc || loc.country_code !== 'IN') {
    return {
      outcome: 'NO_GUIDELINE',
      guidelineSet: null,
      message:
        'We currently provide assessments for India only. Your information is saved, but we won’t apply another country’s guidance to you. Please speak to a healthcare professional where you live.',
      missing: [],
      counts: {},
      results: [],
    };
  }

  const p = bundle.profile || {};
  const h = bundle.health || {};
  const hist = bundle.history || {};
  const age = p.birth_date ? ageFrom(p.birth_date) : null;
  const group = age != null ? ageGroupOf(age) : null;
  const pregnant = p.pregnancy_status === 'pregnant';
  const conditions = h.conditions || {};
  const immunocompromised = h.immunocompromised === 'yes';
  const recordIds = new Set((bundle.records || []).map((r) => r.vaccine_id));

  const matchedConditionLabels = (v) =>
    (v.healthConditions || [])
      .filter((c) => conditions[c] === 'yes' || (c === 'immunocompromised' && immunocompromised) || (c === 'pregnancy' && pregnant))
      .map((c) => (c === 'pregnancy' ? 'Pregnancy' : c === 'immunocompromised' ? 'Weakened immune system' : CONDITION_LABELS[c] || c));

  const results = vaccines.map((v) => {
    const shortName = shortNameOf(v);
    const received = hist.answers?.[v.id] === 'received' || recordIds.has(v.id);
    const ageGroups = v.applicableAgeGroups || [];
    const ageMatch = ageGroups.length === 0 || (group && ageGroups.includes(group));
    const matched = matchedConditionLabels(v);
    const condMatch = matched.length > 0;
    const routine = /Routine Annual/i.test(v.category || '');
    const coreRoutine = /Routine|Senior|Pregnancy|Catch-?Up/i.test(v.category || '');

    let status;
    if (received) status = 'UP_TO_DATE';
    else if (!ageMatch && !condMatch) status = 'NOT_INDICATED';
    else if (routine || condMatch || (ageMatch && coreRoutine)) status = 'RECOMMENDED';
    else status = 'MAY_BE_APPROPRIATE';

    let timing = null;
    if (status === 'RECOMMENDED' || status === 'MAY_BE_APPROPRIATE') {
      timing = { state: 'DUE', nextDose: 1, dosesRequired: 1, dosesCounted: 0, dueNow: true, earliestDate: today() };
    } else if (status === 'UP_TO_DATE') {
      timing = { state: 'COMPLETE', nextDose: null, dosesRequired: 1, dosesCounted: 1, dueNow: false };
    }

    const sources = (v.officialSources || []).map((s, i) => ({
      id: `${v.id}-s${i}`,
      name: s.title,
      url: s.url,
      publisher: s.title,
      published: v.lastReviewed,
      retrieved_at: v.lastReviewed,
    }));

    const basedOn = [
      { factor: 'age', label: 'Your age', value: age != null ? `${age} years (${group})` : 'Not given' },
      { factor: 'conditions', label: 'Health conditions', value: matched.length ? matched.join(', ') : 'None reported' },
    ];
    if (pregnant) basedOn.push({ factor: 'pregnancy', label: 'Pregnancy', value: 'Pregnant' });

    const headlineByStatus = {
      RECOMMENDED: (v.whoMayBenefit || v.ageConsiderations || 'Recommended for adults in your situation.').split('. ')[0] + '.',
      MAY_BE_APPROPRIATE: 'This may be appropriate for you — worth discussing with your doctor.',
      UP_TO_DATE: 'Your answers show you’ve already had this.',
      NOT_INDICATED: 'Not part of your recommended schedule right now, based on your answers.',
    };

    const reasons =
      status === 'RECOMMENDED' || status === 'MAY_BE_APPROPRIATE'
        ? [
            {
              ruleId: `${v.id}.indication`,
              text: v.whoMayBenefit || v.ageConsiderations || 'Indicated for adults per Indian guidance.',
              sourceId: sources[0]?.id,
              section: 'Who may benefit',
            },
          ]
        : [];

    return {
      vaccineId: v.id,
      shortName,
      name: v.name,
      protectsAgainst: v.prevention,
      status,
      headline: headlineByStatus[status],
      timing,
      basedOn,
      reasons,
      sources,
      ruleIds: [`${v.id}.indication`],
      safety: [],
      missing: [],
    };
  });

  const counts = results.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  return { outcome: 'COMPLETE', guidelineSet: GUIDELINE, message: null, missing: [], counts, results };
}

function runOut(run) {
  return {
    id: run.id,
    createdAt: run.createdAt,
    trigger: run.trigger,
    outcome: run.result.outcome,
    guidelineSetId: run.result.guidelineSet?.id ?? null,
    guidelineVersion: run.result.guidelineSet?.version ?? null,
    engineVersion: run.engineVersion,
    result: run.result,
  };
}

function runAssessment(user, bundle, trigger) {
  const result = assess(bundle);
  const run = { id: uid(), createdAt: nowIso(), trigger, engineVersion: 'mock-1.0', result };
  bundle.assessments.unshift(run);
  bundle.assessments = bundle.assessments.slice(0, 20);
  // Regenerate schedule reminders from the result.
  bundle.reminders = bundle.reminders.filter((r) => r.origin !== 'schedule' || r.status !== 'open');
  for (const res of result.results || []) {
    if ((res.status === 'RECOMMENDED' || res.status === 'MAY_BE_APPROPRIATE') && res.timing?.dueNow) {
      bundle.reminders.push({
        id: uid(),
        kind: 'due_now',
        vaccineId: res.vaccineId,
        title: `${res.shortName}: a dose is due`,
        detail: 'You can get this now. Discuss with your doctor.',
        dueDate: null,
        origin: 'schedule',
        ruleId: res.ruleIds[0] ?? null,
        status: 'open',
        createdAt: nowIso(),
      });
    }
  }
  audit(bundle, 'assessment', 'run', [trigger]);
  return run;
}

// ---------------------------------------------------------------------------
// Request router
// ---------------------------------------------------------------------------

function requireUser() {
  const id = getSession();
  const user = id ? userById(id) : null;
  if (!user) throw new ApiError(401, 'Please sign in.');
  return user;
}

function reminderOut(r) {
  return { ...r };
}

// Matches a path against a template like 'intake/records/:id'; returns params or null.
function match(template, segments) {
  const t = template.split('/');
  if (t.length !== segments.length) return null;
  const params = {};
  for (let i = 0; i < t.length; i += 1) {
    if (t[i].startsWith(':')) params[t[i].slice(1)] = decodeURIComponent(segments[i]);
    else if (t[i] !== segments[i]) return null;
  }
  return params;
}

/**
 * Handle one API call. `path` is like '/auth/login' or '/providers?vaccine=x'.
 * Returns the response body (or null for 204-style), or throws ApiError.
 */
export async function mockRequest(method, rawPath, body) {
  // Tiny delay so loading states behave like a network call.
  await new Promise((r) => setTimeout(r, 60));

  const [pathOnly, queryStr] = rawPath.replace(/^\//, '').split('?');
  const segments = pathOnly.split('/');
  const query = Object.fromEntries(new URLSearchParams(queryStr || ''));
  const M = method.toUpperCase();

  // ---- Public ----
  if (pathOnly === 'meta') {
    return {
      version: '1.0.0-demo',
      demoMode: true,
      disclaimer: 'Information to support a conversation with a healthcare professional. Not a diagnosis or prescription.',
    };
  }
  if (pathOnly === 'health') return { status: 'ok' };
  if (pathOnly === 'catalog') return catalog();
  if (pathOnly === 'guidelines') {
    return [{ ...GUIDELINE, sources: [], vaccines: VACCINE_LIST.map((v) => v.shortName) }];
  }

  // ---- Auth ----
  if (pathOnly === 'auth/me') {
    const id = getSession();
    const user = id ? userById(id) : null;
    if (!user) return { user: null, progress: null };
    return me(user, getBundle(user.id));
  }
  if (pathOnly === 'auth/signup' && M === 'POST') {
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    if (!emailRe.test(email)) throw new ApiError(422, 'Enter an email address like name@example.com.', { email: 'Enter an email address like name@example.com.' });
    if (password.length < 10) throw new ApiError(422, 'Use at least 10 characters.', { password: 'Use at least 10 characters.' });
    const users = getUsers();
    if (users[email]) throw new ApiError(409, 'An account with this email already exists. Try signing in instead.');
    const user = { id: uid(), email, passwordHash: weakHash(password), createdAt: nowIso(), onboardingCompletedAt: null };
    users[email] = user;
    setUsers(users);
    const bundle = blankBundle();
    audit(bundle, 'account', 'created');
    setBundle(user.id, bundle);
    setSession(user.id);
    return me(user, bundle);
  }
  if (pathOnly === 'auth/login' && M === 'POST') {
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const user = getUsers()[email];
    if (!user || user.passwordHash !== weakHash(password)) {
      throw new ApiError(401, "That email and password don't match an account.");
    }
    setSession(user.id);
    return me(user, getBundle(user.id));
  }
  if (pathOnly === 'auth/logout' && M === 'POST') {
    setSession(null);
    return null;
  }
  if (pathOnly === 'auth/forgot' && M === 'POST') {
    const email = String(body?.email || '').trim().toLowerCase();
    const message = "If an account exists for that email, we've sent a link to reset the password.";
    const user = getUsers()[email];
    if (!user) return { message };
    const token = uid();
    const bundle = getBundle(user.id);
    bundle.resets[token] = { expires: Date.now() + 3600_000 };
    setBundle(user.id, bundle);
    // No email service in the browser — the demo returns the link directly.
    return { message, demoResetLink: `/reset-password?token=${token}` };
  }
  if (pathOnly === 'auth/reset' && M === 'POST') {
    const token = String(body?.token || '');
    const password = String(body?.password || '');
    if (password.length < 10) throw new ApiError(422, 'Use at least 10 characters.', { password: 'Use at least 10 characters.' });
    const users = getUsers();
    for (const user of Object.values(users)) {
      const bundle = getBundle(user.id);
      const row = bundle.resets[token];
      if (row && row.expires > Date.now()) {
        user.passwordHash = weakHash(password);
        users[user.email] = user;
        setUsers(users);
        delete bundle.resets[token];
        audit(bundle, 'account', 'password_reset');
        setBundle(user.id, bundle);
        setSession(user.id);
        return me(user, bundle);
      }
    }
    throw new ApiError(400, 'This reset link has expired or already been used. Request a new one.');
  }

  // ---- Everything below needs a signed-in user ----
  const user = requireUser();
  const bundle = getBundle(user.id);
  const save = () => setBundle(user.id, bundle);
  const respondProgress = (extra = {}) => ({ progress: progressOf(user, bundle), ...extra });

  // ---- Intake ----
  if (pathOnly === 'intake' && M === 'GET') {
    return {
      profile: bundle.profile,
      location: bundle.location,
      health: bundle.health,
      history: bundle.history,
      safety: bundle.safety,
      records: bundle.records,
      guideline: bundle.location?.country_code === 'IN' ? GUIDELINE : null,
      progress: progressOf(user, bundle),
    };
  }
  if (pathOnly === 'intake/profile' && M === 'PUT') {
    const name = String(body?.full_name || '').trim();
    if (!name) throw new ApiError(422, 'Enter your name.', { full_name: 'Enter your name.' });
    if (!body?.birth_date) throw new ApiError(422, 'Enter your date of birth.', { birth_date: 'Enter your date of birth.' });
    const age = ageFrom(body.birth_date);
    if (age < 18) throw new ApiError(422, 'This service is for adults aged 18 and over.', { birth_date: 'This service is for adults aged 18 and over.' });
    bundle.profile = { ...body, full_name: name, updated_at: nowIso() };
    audit(bundle, 'profile', 'updated');
    save();
    return respondProgress();
  }
  if (pathOnly === 'intake/location' && M === 'PUT') {
    const names = { IN: 'India', US: 'United States' };
    const country_name = body.country_code === 'OTHER' ? body.country_name : names[body.country_code] ?? body.country_name;
    const guideline = body.country_code === 'IN' ? GUIDELINE : null;
    bundle.location = { ...body, country_name, guideline_set_id: guideline?.id ?? null, updated_at: nowIso() };
    audit(bundle, 'location', 'updated');
    save();
    return respondProgress({ guideline });
  }
  if (pathOnly === 'intake/health' && M === 'PUT') {
    bundle.health = { ...body, updated_at: nowIso() };
    audit(bundle, 'health', 'updated');
    save();
    return respondProgress();
  }
  if (pathOnly === 'intake/history' && M === 'PUT') {
    bundle.history = { answers: body.answers || {}, immunity: body.immunity || {}, updated_at: nowIso() };
    audit(bundle, 'vaccination_history', 'updated');
    save();
    return respondProgress();
  }
  if (pathOnly === 'intake/safety' && M === 'PUT') {
    bundle.safety = { ...body, updated_at: nowIso() };
    audit(bundle, 'safety', 'updated');
    save();
    return respondProgress();
  }
  if (pathOnly === 'intake/complete' && M === 'POST') {
    const prog = progressOf(user, bundle);
    const missing = STEPS.slice(0, -1).filter((s) => !prog.completed.includes(s));
    if (missing.length) throw new ApiError(409, `Finish these steps first: ${missing.join(', ')}.`);
    if (!user.onboardingCompletedAt) {
      const users = getUsers();
      user.onboardingCompletedAt = nowIso();
      users[user.email] = user;
      setUsers(users);
      audit(bundle, 'onboarding', 'completed');
    }
    const run = runAssessment(user, bundle, 'user');
    save();
    return { assessmentId: run.id, progress: progressOf(user, bundle) };
  }
  if (pathOnly === 'intake/records' && M === 'POST') {
    const record = {
      id: uid(),
      vaccine_id: body.vaccine_id,
      product: body.product ?? null,
      date: body.date ?? null,
      date_precision: body.date_precision ?? 'day',
      dose_number: body.dose_number ?? null,
      provider_text: body.provider_text ?? null,
      notes: body.notes ?? null,
      data_status: 'USER_REPORTED',
      created_at: nowIso(),
    };
    bundle.records.push(record);
    if (bundle.history && bundle.history.answers?.[body.vaccine_id] !== 'received') {
      bundle.history.answers = { ...(bundle.history.answers || {}), [body.vaccine_id]: 'received' };
    }
    audit(bundle, 'vaccination_record', 'added', ['vaccine_id', 'date']);
    const run = user.onboardingCompletedAt ? runAssessment(user, bundle, 'dose_recorded') : null;
    save();
    return { record, assessmentId: run?.id ?? null };
  }
  {
    const p = match('intake/records/:id', segments);
    if (p) {
      const idx = bundle.records.findIndex((r) => r.id === p.id);
      if (idx === -1) throw new ApiError(404, 'Record not found.');
      if (M === 'GET') return { record: bundle.records[idx] };
      if (M === 'PATCH') {
        bundle.records[idx] = { ...bundle.records[idx], ...body };
        audit(bundle, 'vaccination_record', 'edited');
        const run = user.onboardingCompletedAt ? runAssessment(user, bundle, 'dose_recorded') : null;
        save();
        return { record: bundle.records[idx], assessmentId: run?.id ?? null };
      }
      if (M === 'DELETE') {
        bundle.records.splice(idx, 1);
        audit(bundle, 'vaccination_record', 'deleted');
        const run = user.onboardingCompletedAt ? runAssessment(user, bundle, 'dose_recorded') : null;
        save();
        return { deleted: true, assessmentId: run?.id ?? null };
      }
    }
  }

  // ---- Assessments ----
  if (pathOnly === 'assessments' && M === 'POST') {
    if (!user.onboardingCompletedAt) throw new ApiError(409, 'Finish and review your information before running an assessment.');
    const run = runAssessment(user, bundle, 'user');
    save();
    return runOut(run);
  }
  if (pathOnly === 'assessments/latest' && M === 'GET') {
    const run = bundle.assessments[0];
    return run ? runOut(run) : null;
  }
  if (pathOnly === 'assessments' && M === 'GET') {
    return bundle.assessments.map((r) => {
      const o = runOut(r);
      delete o.result;
      return { ...o, counts: r.result.counts };
    });
  }
  {
    const p = match('assessments/:id', segments);
    if (p && M === 'GET') {
      const run = bundle.assessments.find((r) => r.id === p.id);
      if (!run) throw new ApiError(404, 'Assessment not found.');
      return runOut(run);
    }
  }

  // ---- Providers (static, India) ----
  if (pathOnly === 'providers' && M === 'GET') {
    const sample = [
      { id: 'p1', name: 'Government District Hospital — Immunisation OPD', type: 'Government', address: 'District HQ', jurisdiction: 'IN', distanceKm: null, offers: query.vaccine ? [query.vaccine] : [] },
      { id: 'p2', name: 'Primary Health Centre (PHC)', type: 'Government', address: 'Local PHC', jurisdiction: 'IN', distanceKm: null, offers: query.vaccine ? [query.vaccine] : [] },
      { id: 'p3', name: 'Private Multispeciality Clinic', type: 'Private', address: 'City centre', jurisdiction: 'IN', distanceKm: null, offers: query.vaccine ? [query.vaccine] : [] },
    ];
    return { providers: sample, hasLocation: bundle.location?.lat != null };
  }
  {
    const p = match('providers/:id', segments);
    if (p && M === 'GET') {
      return { id: p.id, name: 'Government District Hospital — Immunisation OPD', type: 'Government', address: 'District HQ', jurisdiction: 'IN', distanceKm: null, phone: null, offers: [] };
    }
  }

  // ---- Reminders ----
  if (pathOnly === 'reminders' && M === 'GET') {
    const rows = [...bundle.reminders].sort((a, b) => (a.status !== 'open') - (b.status !== 'open'));
    return rows.map(reminderOut);
  }
  if (pathOnly === 'reminders' && M === 'POST') {
    const r = { id: uid(), kind: 'custom', vaccineId: body.vaccine_id ?? null, title: body.title, detail: body.detail ?? null, dueDate: body.due_date ?? null, origin: 'user', ruleId: null, status: 'open', createdAt: nowIso() };
    bundle.reminders.push(r);
    audit(bundle, 'reminder', 'added');
    save();
    return reminderOut(r);
  }
  {
    const p = match('reminders/:id', segments);
    if (p && M === 'PATCH') {
      const r = bundle.reminders.find((x) => x.id === p.id);
      if (!r) throw new ApiError(404, 'Reminder not found.');
      r.status = body.status;
      audit(bundle, 'reminder', body.status);
      save();
      return reminderOut(r);
    }
  }

  // ---- Notifications ----
  if (pathOnly === 'notifications/preferences' && M === 'GET') {
    return { inAppUpdates: bundle.notificationPref.inAppUpdates, emailUpdates: bundle.notificationPref.emailUpdates, emailAvailable: false, email: user.email };
  }
  if (pathOnly === 'notifications/preferences' && M === 'PUT') {
    if (body.email_updates) throw new ApiError(503, 'Email alerts are not configured on this service yet. In-app alerts are still available.');
    bundle.notificationPref = { inAppUpdates: !!body.in_app_updates, emailUpdates: false };
    audit(bundle, 'notification_preferences', 'updated');
    save();
    return { inAppUpdates: bundle.notificationPref.inAppUpdates, emailUpdates: false, emailAvailable: false, email: user.email };
  }
  if (pathOnly === 'notifications' && M === 'GET') {
    const unread = bundle.notifications.filter((n) => !n.readAt).length;
    return { items: bundle.notifications, unreadCount: unread };
  }
  if (pathOnly === 'notifications/sync' && M === 'POST') {
    const unread = bundle.notifications.filter((n) => !n.readAt).length;
    return { items: bundle.notifications, unreadCount: unread };
  }
  {
    const p = match('notifications/:id', segments);
    if (p && M === 'PATCH') {
      const n = bundle.notifications.find((x) => x.id === p.id);
      if (!n) throw new ApiError(404, 'Notification not found.');
      n.readAt = body.read ? nowIso() : null;
      save();
      return { id: n.id, read: n.readAt != null };
    }
  }

  // ---- Saved ----
  if (pathOnly === 'saved' && M === 'GET') {
    return bundle.saved.map((s) => ({ id: s.id, kind: s.kind, ref: s.ref, createdAt: s.createdAt }));
  }
  if (pathOnly === 'saved' && M === 'POST') {
    const existing = bundle.saved.find((s) => s.kind === body.kind && s.ref === body.ref);
    if (existing) return { id: existing.id, kind: existing.kind, ref: existing.ref };
    const s = { id: uid(), kind: body.kind, ref: body.ref, createdAt: nowIso() };
    bundle.saved.push(s);
    audit(bundle, `saved_${body.kind}`, 'added');
    save();
    return { id: s.id, kind: s.kind, ref: s.ref };
  }
  {
    const p = match('saved/:id', segments);
    if (p && M === 'DELETE') {
      const idx = bundle.saved.findIndex((s) => s.id === p.id);
      if (idx === -1) throw new ApiError(404, 'Not found.');
      const [removed] = bundle.saved.splice(idx, 1);
      audit(bundle, `saved_${removed.kind}`, 'removed');
      save();
      return { deleted: true };
    }
  }

  // ---- Activity ----
  if (pathOnly === 'activity' && M === 'GET') {
    return bundle.activity.slice(0, 100);
  }

  // ---- Account delete ----
  if (pathOnly === 'account/delete' && M === 'POST') {
    if (user.passwordHash !== weakHash(String(body?.password || ''))) throw new ApiError(403, "That password isn't correct.");
    const users = getUsers();
    delete users[user.email];
    setUsers(users);
    try {
      localStorage.removeItem(`${NS}.user.${user.id}`);
    } catch { /* ignore */ }
    setSession(null);
    return { deleted: true };
  }

  // ---- Legacy recommend (kept for completeness) ----
  if (pathOnly === 'recommend' && M === 'POST') {
    return { recommendations: assess(bundle).results };
  }

  throw new ApiError(404, 'This feature is not available in the offline demo.');
}
