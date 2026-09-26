// End-to-end walk through the whole journey in a real browser (installed Edge).
// Usage: node e2e/journey.mjs [baseUrl] [screenshotDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5173';
const OUT = process.argv[3] ?? 'e2e/screens';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const TIMEOUT = 8000;
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(TIMEOUT);
const problems = [];
page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

const shot = async (name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
const step = async (name, fn) => {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    problems.push(`${name}: ${e.message.split('\n')[0]}`);
    console.log(`FAIL ${name}: ${e.message.split('\n')[0]}`);
    await shot(`FAIL-${name.replace(/\W+/g, '-')}`);
  }
};
const radio = (group, label) => page.getByRole('group', { name: group }).getByLabel(label, { exact: true }).check();
const cont = () => page.getByRole('button', { name: /^(Continue|Save and return)$/ }).click();

const email = `e2e-${Date.now()}@example.com`;

await step('root redirects to login', async () => {
  await page.goto(BASE + '/');
  await page.waitForURL('**/login');
  await shot('01-login');
});

await step('login validation', async () => {
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByText('Enter an email address').waitFor();
});

await step('signup', async () => {
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('correct horse battery');
  await page.getByLabel('Confirm password').fill('correct horse battery');
  await shot('02-signup');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL('**/start/profile');
});

await step('dashboard is blocked before intake', async () => {
  await page.goto(BASE + '/home');
  await page.waitForURL('**/start/profile');
});

await step('cannot skip ahead in wizard', async () => {
  await page.goto(BASE + '/start/safety');
  await page.waitForURL('**/start/profile');
});

await step('profile step', async () => {
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('Some answers need your attention').waitFor();
  await page.getByLabel('Full name').fill('Asha Example');
  await page.getByLabel('Date of birth').fill('1972-04-10');
  await radio('Sex assigned at birth', 'Female');
  await radio('Are you pregnant?', 'No');
  await shot('03-profile');
  await cont();
  await page.waitForURL('**/start/location');
});

await step('location step', async () => {
  await radio('Which country do you live in?', 'United States');
  await page.getByText('The guideline we’ll use').waitFor();
  await page.getByRole('combobox', { name: /^State/ }).selectOption('Texas');
  await page.getByLabel('Town or city').fill('Austin');
  await shot('04-location');
  await cont();
  await page.waitForURL('**/start/health');
});

await step('health step', async () => {
  await page.getByText('Long-term heart disease').waitFor();
  const rows = page.locator('fieldset:has(legend span)');
  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const row = rows.nth(i);
    const label = i === 1 ? 'Yes' : i === 4 ? 'Not sure' : 'No';
    await row.getByText(label, { exact: true }).click();
  }
  await radio('Do you have a weakened immune system?', 'No');
  await radio('Do you work in healthcare?', 'No');
  await page.getByRole('group', { name: /student after high school/ }).getByLabel('No', { exact: true }).check();
  await shot('05-health');
  await cont();
  await page.waitForURL('**/start/history');
});

await step('history step with a dose and unknowns', async () => {
  await page.getByRole('heading', { name: 'Vaccinations you’ve had' }).waitFor();
  await page.getByLabel('I’ve had it').first().waitFor();
  const groups = page.getByRole('group').filter({ has: page.getByLabel('I’ve had it') });
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    const g = groups.nth(i);
    const legend = await g.locator('legend').innerText();
    const pick = legend.startsWith('Hepatitis B') ? 'Not sure' : legend.startsWith('Shingles') ? 'I’ve had it' : 'I haven’t had it';
    await g.getByLabel(pick, { exact: true }).check();
  }
  await page.getByRole('button', { name: 'Add a dose' }).click();
  await page.getByLabel('Date', { exact: true }).fill('2026-08-01');
  await page.getByRole('button', { name: 'Save dose' }).click();
  await page.getByText(/Dose · 1 August 2026/).waitFor();
  await radio('Has a healthcare professional or a blood test confirmed you’re immune to measles, mumps and rubella?', 'No');
  await radio('Has a healthcare professional diagnosed you with chickenpox or shingles, or a blood test shown you’re immune?', 'Yes');
  await shot('06-history');
  await cont();
  await page.waitForURL('**/start/safety');
});

await step('safety step', async () => {
  await page.getByRole('heading', { name: /safety considerations/ }).waitFor();
  await radio('Do you have any known allergies?', 'Yes');
  await page.getByLabel('Type').selectOption('food');
  await page.getByLabel('Allergic to').selectOption('peanut');
  await page.getByLabel('Severe (anaphylaxis)').check();
  await radio('Have you ever had a serious reaction after a vaccine?', 'No');
  const qs = page.getByRole('group').filter({ has: page.getByLabel('Not sure', { exact: true }) });
  const n = await qs.count();
  for (let i = 0; i < n; i++) {
    const g = qs.nth(i);
    const legend = await g.locator('legend').innerText();
    if (/allergies|serious reaction/.test(legend)) continue;
    await g.getByLabel('No', { exact: true }).check();
  }
  await shot('07-safety');
  await cont();
  await page.waitForURL('**/start/review');
});

await step('review and run assessment', async () => {
  await page.getByRole('heading', { name: 'Review your information' }).waitFor();
  await shot('08-review');
  await page.getByRole('button', { name: 'Run vaccination assessment' }).click();
  await page.waitForURL('**/recommendations');
  await page.getByRole('heading', { name: /Recommended for you/ }).waitFor();
});

await step('recommendations explain themselves', async () => {
  await page.getByText('Why am I seeing this?').first().click();
  await page.getByText('Guideline basis').first().waitFor();
  await page.getByText('More information needed').first().waitFor();
  await shot('09-recommendations');
});

await step('vaccine detail tabs', async () => {
  await page.goto(BASE + '/vaccines/zoster');
  await page.getByRole('heading', { name: /Shingles vaccine/ }).waitFor();
  await shot('10-vaccine-overview');
  const tabs = page.getByRole('navigation', { name: 'Vaccine sections' });
  await tabs.getByRole('link', { name: 'Safety' }).click();
  await page.getByText('isn’t proof the vaccine caused it').waitFor();
  await shot('11-vaccine-safety');
  await tabs.getByRole('link', { name: 'Schedule' }).click();
  await page.getByText('Can I have it now?').waitFor();
  await shot('12-vaccine-schedule');
});

await step('providers are demo-labelled', async () => {
  await page.goto(BASE + '/providers?vaccine=zoster');
  await page.getByText('Demo data').first().waitFor();
  await shot('13-providers');
  await page.getByRole('link', { name: 'Details, cost and contact' }).first().click();
  await page.getByText('Estimated total').first().waitFor({ timeout: 5000 }).catch(() => page.getByText('Price not available').first().waitFor());
  await page.getByRole('button', { name: /Save provider/ }).click();
  await page.getByRole('button', { name: /Saved/ }).waitFor();
  await shot('14-provider');
});

await step('record a dose and see after-care', async () => {
  await page.goto(BASE + '/record?vaccine=influenza');
  await page.getByLabel('Date', { exact: true }).fill(new Date().toISOString().slice(0, 10));
  await page.getByLabel('Where you got it').fill('Local pharmacy');
  await page.getByRole('button', { name: 'Record vaccination' }).click();
  await page.waitForURL('**/aftercare');
  await page.getByRole('heading', { name: 'Vaccination recorded' }).waitFor();
  await shot('15-aftercare');
});

await step('schedule shows generated reminders', async () => {
  await page.goto(BASE + '/schedule');
  await page.getByText('Generated from your schedule').first().waitFor();
  await shot('16-schedule');
});

await step('history tabs', async () => {
  await page.goto(BASE + '/history');
  await page.getByText('Local pharmacy').waitFor();
  await page.getByRole('tab', { name: 'Assessments' }).click();
  await page.getByText('(latest)').waitFor();
  await page.getByRole('tab', { name: 'Changes' }).click();
  await page.getByText('not the values themselves').waitFor();
  await shot('17-history');
});

await step('home overview', async () => {
  await page.goto(BASE + '/home');
  await page.getByRole('heading', { name: 'What you need to know today' }).waitFor();
  await shot('18-home');
});

await step('every page is its own route', async () => {
  const pages = [
    ['/home', 'What you need to know today'],
    ['/recommendations', /recommended for you|worth discussing|professional|more information|Nothing needs doing/i],
    ['/safety', 'Safety'],
    ['/review', 'Clinical review'],
    ['/providers', 'Where you may be able to get vaccinated'],
    ['/schedule', 'Your schedule'],
    ['/history', /history/i],
    ['/profile', /profile|your information/i],
  ];
  for (const [path, heading] of pages) {
    await page.goto(BASE + path);
    await page.getByRole('heading', { level: 1, name: heading }).first().waitFor();
    if (!page.url().endsWith(path)) throw new Error(`${path} redirected to ${page.url()}`);
  }
  await shot('20-safety-route');
  // Real history entries: Back returns to the previous page, not a reset view.
  await page.goto(BASE + '/safety');
  await page.goto(BASE + '/review');
  await page.goBack();
  await page.waitForURL('**/safety');
  await page.getByRole('heading', { level: 1, name: 'Safety' }).waitFor();
});

await step('profile edit round trip', async () => {
  await page.goto(BASE + '/profile');
  await page.getByRole('link', { name: 'Edit location' }).click();
  await page.waitForURL('**/start/location?return=profile');
  await page.getByRole('button', { name: 'Save and return' }).click();
  await page.waitForURL('**/profile?updated=1');
  await page.getByRole('button', { name: 'Re-check my vaccinations' }).click();
  await page.waitForURL('**/recommendations');
});

await step('sources page', async () => {
  await page.goto(BASE + '/about/sources');
  await page.getByText('Addendum updated July 2, 2025').first().waitFor();
  await shot('19-sources');
});

await step('mobile layouts', async () => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const [path, name] of [
    ['/home', 'm-home'],
    ['/recommendations', 'm-recommendations'],
    ['/providers?vaccine=zoster', 'm-providers'],
    ['/start/health', 'm-health'],
    ['/vaccines/hepb/schedule', 'm-schedule'],
  ]) {
    await page.goto(BASE + path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) problems.push(`horizontal overflow at 375px on ${path}`);
    await shot(name);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
});

await step('sign out', async () => {
  await page.goto(BASE + '/settings');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL('**/login');
  await page.goto(BASE + '/home');
  await page.waitForURL('**/login?next=%2Fhome');
});

await step('sign back in resumes at home', async () => {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('correct horse battery');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/home');
});

await browser.close();
console.log(problems.length ? `\n${problems.length} problem(s):\n- ${problems.join('\n- ')}` : '\nAll steps passed, no console errors.');
process.exit(problems.length ? 1 : 0);
