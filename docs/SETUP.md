# Account setup

Three optional services the site is already wired for. Each one switches on
the moment its keys exist in Vercel and stays off (with the site working
normally) until then. After adding or changing any variable, redeploy:
Vercel → Deployments → latest → ⋯ → Redeploy.

Vercel variables live at: Vercel → project **matterpixel** → Settings →
Environment Variables. Tick **Production** (and **Preview** if you want to
test on preview links).

---

## 1. Bot protection — Cloudflare Turnstile (about 3 minutes)

Stops spam bots on the project form and the booking form. Real visitors
almost never see it; Cloudflare only shows a checkbox when unsure.

1. Log in to Cloudflare → left menu **Turnstile** → **Add widget**.
2. Widget name: `Matterpixel forms`.
3. Hostnames: `matterpixel.com`, `www.matterpixel.com`, and `localhost`
   (for local testing).
4. Widget mode: **Managed**. Pre-clearance: **No**.
5. Create. Cloudflare shows a **Site Key** and a **Secret Key**.
6. In Vercel add:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the Site Key
   - `TURNSTILE_SECRET_KEY` = the Secret Key
7. Redeploy.

Check: open the contact page, send a test inquiry. It should go through as
before. In Cloudflare → Turnstile you'll see the widget's traffic graph.

---

## 2. Google Calendar — no double bookings (about 8 minutes)

Hides times you're already busy in the booking calendar, and puts every
booking request on your calendar straight away so nobody else can take it.
Only busy/free times are read; event titles and details never reach the site.

1. Go to <https://console.cloud.google.com> with the Google account whose
   calendar you use. Top bar → project picker → **New project** → name it
   `matterpixel-booking` → Create, then select it.
2. Menu → **APIs & Services** → **Library** → search **Google Calendar API**
   → **Enable**.
3. Menu → **IAM & Admin** → **Service Accounts** → **Create service account**.
   Name `booking`. Skip the optional role and user steps → Done.
4. Click the new service account → **Keys** tab → **Add key** → **Create new
   key** → **JSON** → Create. A `.json` file downloads. Keep it private.
5. Copy the service account's email (looks like
   `booking@matterpixel-booking.iam.gserviceaccount.com`).
6. Open <https://calendar.google.com> → ⚙ Settings → under *Settings for my
   calendars* click your calendar → **Share with specific people or groups**
   → **Add people** → paste the service account email → permission
   **Make changes to events** → Send.
7. In Vercel add (values come from the downloaded JSON file):
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `client_email`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = `private_key` — the whole value,
     from `-----BEGIN PRIVATE KEY-----` to `-----END PRIVATE KEY-----\n`,
     pasted exactly as it appears (the `\n` sequences are fine)
   - `GOOGLE_CALENDAR_ID` = your Gmail address (the calendar you shared)
8. Redeploy, then delete the downloaded JSON file from your computer.

Check: put a test event in your calendar for a bookable slot (e.g. Saturday
8 PM Dhaka time). Reload the contact page → Book a free audit call → that
slot should be gone.

---

## 3. Google Search Console

1. <https://search.google.com/search-console> → **Add property** → choose
   **URL prefix** → `https://www.matterpixel.com/` → Continue.
2. Choose **HTML tag**. Copy only the value inside `content="…"`.
3. In Vercel add `GOOGLE_SITE_VERIFICATION` = that value → Redeploy.
4. Back in Search Console → **Verify**.
5. Left menu → **Sitemaps** → enter `sitemap.xml` → Submit.
6. Optional: **URL inspection** → paste the homepage → **Request indexing**.
   Repeat for the Insights articles.

Results appear over the following days. Check **Pages** and
**Core Web Vitals** in Search Console every few weeks.
