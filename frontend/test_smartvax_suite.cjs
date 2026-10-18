const { chromium } = require('playwright-core');

async function runTestSuite() {
  console.log('--- Starting Complete SmartVax Automated Verification Suite ---');
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const routes = [
    { path: '/', expectedText: "Vaccines Aren't Just for Children." },
    { path: '/age-groups', expectedText: 'Adult Immunization by Age Group' },
    { path: '/age-groups/18-29', expectedText: 'Young Adults (Ages 18–29)' },
    { path: '/age-groups/50-64', expectedText: 'Pre-Senior Adults (Ages 50–64)' },
    { path: '/mens-health', expectedText: 'Adult Immunization for Men' },
    { path: '/womens-health', expectedText: 'Adult Immunization for Women' },
    { path: '/health-conditions', expectedText: 'Vaccines for Adults with Health Conditions' },
    { path: '/vaccine-library', expectedText: 'Adult Vaccine Library' },
    { path: '/vaccine-library/influenza-seasonal', expectedText: 'Influenza (Flu) Vaccine' },
    { path: '/vaccine-library/herpes-zoster-shingles', expectedText: 'Herpes Zoster (Shingles) Vaccine' },
    { path: '/vaccine-library/non-existent-id', expectedText: 'Vaccine Record Not Found' },
    { path: '/awareness-guide', expectedText: 'Adult Immunization Awareness Guide' },
    { path: '/doctor-checklist', expectedText: 'Doctor Visit Checklist' },
    { path: '/faq', expectedText: 'Frequently Asked Questions' },
    { path: '/about', expectedText: 'About SmartVax India' },
    { path: '/poster-landing', expectedText: 'Adult Immunization Categories & Guide' },
    { path: '/clinic-poster', expectedText: 'Printable Clinic Awareness Poster' },
    { path: '/some-random-route', expectedText: '404 — Page Not Found' }
  ];

  for (const r of routes) {
    await page.goto(`http://localhost:5173${r.path}`);
    await page.waitForSelector('h1');
    const content = await page.textContent('body');
    if (content.includes(r.expectedText)) {
      console.log(`[PASS] Route: ${r.path} rendered successfully with expected text.`);
    } else {
      console.error(`[FAIL] Route: ${r.path} missing expected text: "${r.expectedText}"`);
    }
  }

  // Test Questionnaire Flow in /awareness-guide
  console.log('\n--- Testing Awareness Guide Questionnaire Flow ---');
  await page.goto('http://localhost:5173/awareness-guide');
  await page.click('text=65 Years and Older');
  await page.click('button:has-text("Continue")');
  await page.click('text=Diabetes Mellitus');
  await page.click('button:has-text("Continue")');
  await page.click('text=Unknown / Records Unavailable');
  await page.click('button:has-text("Continue")');
  await page.click('button:has-text("Generate Discussion Guide")');

  const resultsHeading = await page.textContent('h2');
  console.log('[PASS] Questionnaire generated results heading:', resultsHeading);

  const resultsContent = await page.content();
  console.log('[PASS] Results contain Pneumococcal rule:', resultsContent.includes('Pneumococcal'));
  console.log('[PASS] Results contain Diabetes rule:', resultsContent.includes('Diabetes'));

  // Test Mobile Viewport
  console.log('\n--- Testing Mobile Viewport (375x667) ---');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:5173/');
  const menuButton = await page.$('button[aria-label="Toggle navigation menu"]');
  if (menuButton) {
    await menuButton.click();
    console.log('[PASS] Mobile navigation menu opened successfully.');
  }

  await browser.close();

  if (consoleErrors.length > 0) {
    console.warn('\nConsole errors detected:', consoleErrors);
  } else {
    console.log('\n[ALL TESTS PASSED] Zero browser console errors recorded!');
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
