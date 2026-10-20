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
1. Create a free account at **https://resend.com**.
2. Go to **API Keys → Create API Key**, copy it (starts with `re_`).
3. (For emailing *real* patient addresses) add and verify your sending domain
   under **Domains**. Until you verify a domain, Resend only lets you email
   **your own** account address — fine for testing, not for real patients.

### 2. Add environment variables in Netlify
**Site configuration → Environment variables → Add a variable:**

| Key              | Value | Needed for |
|------------------|-------|------------|
| `RESEND_API_KEY` | your `re_...` key | sending email |
| `ADMIN_TOKEN`    | any long random secret you choose | protecting `announce` |
| `ALERT_FROM`     | e.g. `SmartVax India <alerts@yourdomain.in>` | the "from" address (must be a verified Resend domain). Omit to use Resend's test sender `onboarding@resend.dev`. |
| `SITE_URL`       | e.g. `https://your-site.netlify.app` | links inside the email |

Then **redeploy** so the functions pick up the variables.

> Collecting subscribers works **without any key**. Email is only *sent* once
> `RESEND_API_KEY` is set — until then, `announce` still saves the update and the
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
