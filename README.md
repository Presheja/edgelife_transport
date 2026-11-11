# EdgeLIFE Transportation website

Next.js 15 (App Router) + React 19 + TypeScript, with a Supabase database and a built-in admin area at `/admin`.
Designed for Hostinger Node.js hosting, deployed from GitHub.

The public site always renders, even if the database is down: rates, contact details and towns fall back to the defaults in code.

---

## 1. Set up Supabase (about 10 minutes, once)

1. Create a project at supabase.com. Pick the US East region. Save the database password somewhere safe.
2. **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, click **Run**. This creates the tables and locks them down.
3. **Authentication → Users → Add user → Create new user.** Use the email you will sign in with and a strong password. Tick "Auto Confirm User". Create one user per person who needs admin access.
4. **Project Settings → API.** Copy three values: the Project URL, the `anon` public key, and the `service_role` secret key.
   The service-role key is a master key. It goes only into Hostinger's environment variables. Never paste it into GitHub, a chat, or a screenshot.

## 2. Put the code on GitHub

```
cd edgelife-app-v2
git init
git add .
git commit -m "EdgeLIFE website v2"
git branch -M main
git remote add origin https://github.com/YOURNAME/edgelife-website.git
git push -u origin main
```
`.gitignore` already keeps `.env`, `node_modules` and `.next` out of the repository. Make the repository **private**.

## 3. Deploy on Hostinger

In hPanel choose **Websites → Add website → Node.js Apps** (the wording may differ slightly by plan), then **Import Git repository** and connect GitHub.

| Setting | Value |
|---|---|
| Framework | Next.js |
| Node version | 20 or 22 |
| Build command | `npm run build` |
| Start command | `npm start` |

**Add the environment variables BEFORE the first build.** The two `NEXT_PUBLIC_` values are baked into the site while it builds, so if you add them afterward you must redeploy.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=you@example.com,moses@example.com
SITE_URL=https://www.edgelifetransportation.com
```
Optional, for an email every time someone books or applies (use the mailbox you create in Hostinger):
```
SMTP_HOST=smtp.hostinger.com   SMTP_PORT=465
SMTP_USER=info@edgelifetransport.com   SMTP_PASS=...   NOTIFY_TO=info@edgelifetransport.com
```
Then connect the domain and turn on SSL. Every `git push` to `main` redeploys.

## 4. First visit

Go to `/admin` and sign in. In order:
1. **Settings**: check the phone, email, address, hours and town lists.
2. **Rates**: confirm the numbers.
3. **Bookings → New booking**: enter a test ride, check it appears, then delete it.
4. Submit a test request from the public **Book a Ride** page and confirm it arrives in Bookings.

## What the admin can do

| Screen | Use |
|---|---|
| Dashboard | New requests, today's rides, new applications |
| Bookings | Every request. Set status, quote, driver, vehicle, internal notes. Enter phone bookings. Search. Download CSV |
| Applications | Driver applicants. Track status and notes |
| Rates | Base fare, included miles and per-mile for wheelchair and ambulatory. Updates the pricing page and calculator |
| Settings | Phone, email, address, hours, top-bar message, callback promise, towns served |
| Testimonials | Add real reviews and publish them. The homepage section stays hidden until one is published |

Public changes appear within about a minute.

## Where things live in the code

| What | Where |
|---|---|
| Default rates and the price calculation | `lib/rates.ts` |
| Default contact details and towns | `lib/settings.ts` |
| Services, fleet, ten town pages, safety claims | `lib/content.ts` |
| Database tables | `supabase/schema.sql` |
| Admin screens and actions | `app/admin/` |
| 301 redirects from the old WordPress URLs | `next.config.mjs` (keep them, they protect your Google rankings) |
| Colors and type | `app/globals.css` → `:root` |

## Security notes

- The database tables have Row Level Security on and no public policies. Only the server, using the service-role key, can read or write.
- `/admin` requires a Supabase login **and** an email listed in `ADMIN_EMAILS`. Every admin page and action re-checks this on the server.
- Public forms have a honeypot field and a per-IP rate limit. Login attempts are rate limited.
- Do not ask riders to put medical records, SSNs or card numbers in the forms. Take those by phone.

---

## Before you launch

**Claims the site makes in public. Each must be true on day one, or be deleted from `lib/content.ts`:**
- [ ] Drivers are drug screened before hire and at random after, and after any accident
- [ ] CORI and SORI checks with a seven-year lookback, and the RMV record rules described
- [ ] Every vehicle gets a documented pre-shift inspection
- [ ] No vehicle is over ten years old
- [ ] Brakes and lifts are on a written service schedule
- [ ] "$1.5M commercial liability", "Contracted with MassHealth transportation brokers", "Licensed & insured in Massachusetts"
- [ ] Homepage promises: a text when the driver arrives, "the same driver every week" on standing routes, and live GPS tracking
- [ ] Hours in Admin → Settings (the default is a placeholder)
- [ ] The two fleet descriptions in `lib/content.ts` match the vehicles in the photos

**Pricing:**
- [ ] Confirm with Moses that a round trip is two one-way fares (the calculator assumes this)
- [ ] Decide the wait-time and cancellation rules, then add them to the Rates note

**Content and legal:**
- [ ] Privacy Notice, Terms and Accessibility Statement are drafted in plain language. Have a lawyer review them.
- [ ] Add real testimonials in Admin (the invented one was removed)
- [ ] The email `info@edgelifetransport.com` uses a different domain from the website (`edgelifetransportation.com`). Confirm both are yours and the mailbox exists.

**Search:**
- [ ] After launch, submit `/sitemap.xml` in Google Search Console
- [ ] Open five old WordPress URLs and confirm each redirects
- [ ] Update the Google Business Profile address to 135 Washington St, STE 201, Taunton
