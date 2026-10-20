/**
 * POST /.netlify/functions/announce   (admin only)
 *
 * The trigger for "a new vaccine arrived in the market": an admin announces it,
 * and every subscriber is emailed automatically. The announcement is also saved
 * to the shared updates feed (Netlify Blobs) so the website's "What's new"
 * section shows it without a redeploy.
 *
 * Auth: send header  x-admin-token: <ADMIN_TOKEN env var>
 * Body: { "title": "...", "summary": "...", "type": "new"|"updated",
 *         "vaccineId": "hpv" (optional), "url": "https://..." (optional) }
 *
 * Email sending requires the RESEND_API_KEY env var (free Resend account).
 * Without it, the announcement is still saved and shown on the site; the
 * response reports emailConfigured:false so you know email was skipped.
 */
import { getStore } from '@netlify/blobs';
import { Resend } from 'resend';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function emailHtml(update, siteUrl) {
  const link = update.vaccineId && siteUrl ? `${siteUrl}/vaccine-library/${update.vaccineId}` : siteUrl || '#';
  const kind = update.type === 'new' ? 'New vaccine available in India' : 'Vaccine guidance updated';
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#0f172a">
    <div style="background:#1e3a8a;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <strong style="font-size:18px">SmartVax India</strong>
      <div style="font-size:12px;opacity:.85">Adult Immunisation Awareness</div>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      <p style="font-size:12px;font-weight:bold;color:#2563eb;text-transform:uppercase;letter-spacing:.5px;margin:0 0 8px">${kind}</p>
      <h1 style="font-size:20px;margin:0 0 12px">${update.title}</h1>
      <p style="font-size:14px;line-height:1.6;color:#334155">${update.summary}</p>
      <a href="${link}" style="display:inline-block;margin-top:16px;background:#2563eb;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 20px;border-radius:8px">View on SmartVax</a>
      <p style="font-size:12px;color:#64748b;margin-top:24px;line-height:1.5">
        This is educational information based on Indian guidance (MoHFW / NTAGI / API / WHO India).
        It is not a diagnosis. Whether a vaccine is right for you is a decision for your registered doctor.
      </p>
      <p style="font-size:11px;color:#94a3b8">You received this because you subscribed to SmartVax vaccine-update alerts.</p>
    </div>
  </div>`;
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const token = req.headers.get('x-admin-token');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return json({ error: 'Unauthorized. Set ADMIN_TOKEN and send it as the x-admin-token header.' }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const title = String(body?.title || '').trim();
  const summary = String(body?.summary || '').trim();
  if (!title || !summary) return json({ error: 'title and summary are required.' }, 400);

  const update = {
    id: `u-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    type: body?.type === 'updated' ? 'updated' : 'new',
    title,
    summary,
    vaccineId: body?.vaccineId ? String(body.vaccineId) : null,
    url: body?.url ? String(body.url) : null,
  };

  const store = getStore('smartvax');
  const updates = (await store.get('updates', { type: 'json' })) || [];
  updates.unshift(update);
  await store.setJSON('updates', updates.slice(0, 50));

  const subscribers = (await store.get('subscribers', { type: 'json' })) || [];

  let sent = 0;
  let failed = 0;
  const emailConfigured = Boolean(process.env.RESEND_API_KEY);

  if (emailConfigured && subscribers.length) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.ALERT_FROM || 'SmartVax India <onboarding@resend.dev>';
    const siteUrl = (process.env.SITE_URL || process.env.URL || '').replace(/\/$/, '');
    const html = emailHtml(update, siteUrl);

    for (const s of subscribers) {
      try {
        await resend.emails.send({ from, to: s.email, subject: `SmartVax: ${title}`, html });
        sent += 1;
      } catch {
        failed += 1;
      }
      // Stay under Resend's free-tier rate limit (2 requests/sec).
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return json({ ok: true, update, subscribers: subscribers.length, sent, failed, emailConfigured });
};
