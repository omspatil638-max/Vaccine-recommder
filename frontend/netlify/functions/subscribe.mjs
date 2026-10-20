/**
 * POST /.netlify/functions/subscribe
 *
 * Stores a patient's email in a server-side list (Netlify Blobs) so they can be
 * emailed automatically when a new vaccine is announced. This is the piece a
 * static site cannot do on its own: localStorage accounts live only in the
 * patient's browser, so the email list must live on the server.
 *
 * Free: Netlify Functions + Netlify Blobs are included in Netlify's free tier.
 * No API key is needed just to collect subscribers (only to send email later).
 *
 * Body: { "email": "you@example.com", "ageGroup": "50-64" (optional) }
 */
import { getStore } from '@netlify/blobs';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const ageGroup = body?.ageGroup ? String(body.ageGroup).slice(0, 10) : null;
  if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);

  const store = getStore('smartvax');
  const subscribers = (await store.get('subscribers', { type: 'json' })) || [];

  if (!subscribers.some((s) => s.email === email)) {
    subscribers.push({ email, ageGroup, subscribedAt: new Date().toISOString() });
    await store.setJSON('subscribers', subscribers);
  }

  return json({ ok: true, subscribed: email, total: subscribers.length });
};
