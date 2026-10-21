# Automatic email alerts to patients — setup

This is how patients automatically receive an email when a **new vaccine arrives
in the market**. It runs entirely on Netlify's **free** tier.

## How it works

```
Patient subscribes  →  subscribe function  →  email list (Netlify Blobs)
Admin announces a    →  announce function   →  emails ALL subscribers (Resend)
new vaccine                                 →  adds it to the "What's new" feed
Website "What's new" →  updates function    →  shows announcements live
```

Three serverless functions (in `frontend/netlify/functions/`):

| Function   | URL                                | Who       | Does |
|------------|------------------------------------|-----------|------|
| `subscribe`| `/.netlify/functions/subscribe`    | public    | saves a patient's email |
| `announce` | `/.netlify/functions/announce`     | admin     | emails everyone + saves the update |
| `updates`  | `/.netlify/functions/updates`      | public    | returns the live update feed |

The subscriber list lives in **Netlify Blobs** (free, built in — no account).
Email is sent with **Resend** (free tier: 3,000 emails/month).

## One-time setup

### 1. Get a free Resend API key
You can send email two ways. **Option A (Gmail SMTP) is recommended** because it
delivers to **any** email address (your teacher's, a patient's) with no domain.

### Option A — Gmail (sends to ANY address, free, no domain) ✅
1. Use a Gmail account. Turn on **2-Step Verification**: Google Account →
   Security → 2-Step Verification.
2. Create an **App Password**: Google Account → Security → **App passwords** →
   app "Mail" → it gives a **16-character password** (e.g. `abcd efgh ijkl mnop`).
   Copy it (remove the spaces).
3. In **Netlify → Site configuration → Environment variables**, add:

| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | your full Gmail address |
| `SMTP_PASS` | the 16-character app password (no spaces) |
| `ALERT_FROM` | `SmartVax India <your-gmail@gmail.com>` |
| `ADMIN_TOKEN` | any long secret you choose |

4. **Redeploy** (Deploys → Trigger deploy). Done — emails now reach any address.

> Brevo works the same way: `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`,
> `SMTP_USER`/`SMTP_PASS` from Brevo's SMTP settings.

### Option B — Resend (only your own address until you verify a domain)
1. Create a free account at **https://resend.com**, make an API key (`re_...`).
2. In Netlify add `RESEND_API_KEY`, `ADMIN_TOKEN`, optional `ALERT_FROM`/`SITE_URL`.
3. Without a verified domain, Resend only delivers to **your own** Resend email.

If **both** SMTP and Resend are set, SMTP (Option A) is used.

> Collecting subscribers works **without any key**. Email is only *sent* once a
> provider is configured — until then, `announce` still saves the update and the
> website shows it, and the response says `emailConfigured: false`.

### 3. Announce a new vaccine (this triggers the emails)
Send one request whenever a new vaccine arrives. From a terminal:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/announce \
  -H "content-type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "new",
    "title": "New dengue vaccine now available in India",
    "summary": "A dengue vaccine has been approved for adults in India. Discuss suitability with your doctor.",
    "vaccineId": "dengue"
  }'
```

Every subscriber is emailed automatically, and the announcement appears in the
site's **Vaccine Update Reminders → What's new** section immediately.

Response example:
```json
{ "ok": true, "subscribers": 42, "sent": 42, "failed": 0, "emailConfigured": true }
```

## Costs & limits (all free tier)
- Netlify Functions: 125k invocations/month free.
- Netlify Blobs: free.
- Resend: 3,000 emails/month, 100/day free. The `announce` function paces sends
  to stay under Resend's rate limit.

## Notes
- This email list is **separate** from patient login accounts (those live only
  in each patient's browser, so a server can't read them). Patients opt in to
  email on the **Vaccine Update Reminders** page.
- Keep `ADMIN_TOKEN` secret — anyone with it can send emails to your list.
