# The Solution Academy website

© 2026 The Solution Academy. All rights reserved.

A Next.js App Router + TypeScript website for academy programs, inquiry forms, student Google sign-in, a Groq-powered study helpbox, and a restricted owner console.

## Contents

- Public pages: home, programs, Class 6–10 detail routes, one-day competitive-exam course, about, contact, privacy, student sign-in.
- Supabase-backed class/subject pricing, course content, helpbox messages, coarse session metadata, inquiries and audit log.
- Owner console at `/private-console` with access-code unlock, content editor, student conversation review, and activity log.
- Admin-only pricing API for safe browser-console edits.

## Requirements

- Node.js 20.9+ and npm.
- Supabase project.
- Google OAuth client configured in Supabase Auth.
- Groq API key for the study helpbox.
- Optional Radar API key for approximate IP region resolution.

## Local setup

1. Clone the repository and install packages:
   ```bash
   npm install
   cp .env.example .env.local
   ```
2. Create a Supabase project. In **Project Settings → API**, copy the Project URL, anon/public key, and service-role key into `.env.local`. The service-role key must never be prefixed `NEXT_PUBLIC_` and must never be committed.
3. Generate an admin deployment secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Set `ADMIN_DEPLOYMENT_SECRET` in `.env.local` before hashing the access code. Choose a unique, random owner access code of at least 16 characters, then run:
   ```bash
   ADMIN_DEPLOYMENT_SECRET='your-generated-secret' node scripts/hash-admin-code.mjs 'your-long-random-access-code'
   ```
   Copy the printed `scrypt$...` value to `ADMIN_ACCESS_CODE_HASH`. Never store the raw code in Vercel or source code. `ADMIN_IDENTITY` is the one fixed owner identity shown in logs; admin access is intentionally not Google OAuth.
4. In Supabase **SQL Editor**, run `supabase/schema.sql`, then `supabase/seed.sql`. Only the one-day competitive exam course is seeded. Classes and subjects start empty and are added in the owner console.
5. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and run `npm run dev`.

## Environment variables

| Variable                        | Purpose                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key; RLS still applies                           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only privileged database access                             |
| `NEXT_PUBLIC_SITE_URL`          | Canonical site URL and OAuth callback base                         |
| `ADMIN_IDENTITY`                | Fixed owner identity used in admin session and logs                |
| `ADMIN_ACCESS_CODE_HASH`        | scrypt hash in `scrypt$<salt-hex>$<digest-hex>` format             |
| `ADMIN_DEPLOYMENT_SECRET`       | Random per-deployment secret mixed into code hash and session HMAC |
| `GROQ_API_KEY`                  | Server-only Groq API key                                           |
| `RADAR_API_KEY`                 | Server-only Radar API key for coarse IP geocoding                  |
| `HELPBOX_RATE_LIMIT_PER_MINUTE` | Optional per-student in-memory limit (default 8)                   |

## Google OAuth for students (Supabase)

1. In Google Cloud Console, create/select a project, configure the OAuth consent screen, and create an **OAuth Client ID → Web application**.
2. In Supabase Dashboard → **Authentication → Providers → Google**, enable Google and paste the Google client ID and client secret. These credentials are configured in Supabase, not this app.
3. In Supabase Dashboard → **Authentication → URL Configuration**, set Site URL to your deployed site, e.g. `https://your-domain.vercel.app`. Add redirect URLs for both `http://localhost:3000/auth/callback` and `https://your-domain.vercel.app/auth/callback` (replace with your actual deployment domain).
4. In Google Cloud Console, add the **Supabase-provided callback URL** shown in the Google provider setup as an Authorized redirect URI. It normally resembles `https://<project-ref>.supabase.co/auth/v1/callback`; copy the exact value shown by Supabase.
5. Add the public app URL as an authorized JavaScript origin only if Google Cloud's setup flow requests it. Save the provider configuration and test `/sign-in`.
6. Only Google is offered in the application UI. Do not enable email/password or magic-link login for this flow.

## Groq and Radar

- Create a Groq API key and set `GROQ_API_KEY`. The key is used only in `/api/helpbox` and never sent to the browser.
- Create a Radar API key appropriate for server-side IP geocoding and set `RADAR_API_KEY`. Radar requests are server-side only. The app stores city/region/country strings only; it does not store coordinates. VPN/proxy or unresolvable addresses become `unknown`. Confirm the Radar endpoint and plan permissions against your Radar dashboard before production use.

## Owner console

Visit `/private-console` directly. The route is intentionally absent from public navigation, has `noindex` metadata and an `X-Robots-Tag` header, and is excluded from the sitemap. Security through obscurity is not relied on: the server verifies a hashed access code, rate limits attempts, then issues an HttpOnly, SameSite=Strict, Secure-in-production signed cookie. Every unlock attempt and console action is logged.

The owner session is separate from student Google OAuth. The fixed `ADMIN_IDENTITY` is a configured identity label; this single-owner access-code design does not prove a human's email ownership. Anyone who obtains the access code and deployment secret/hash configuration may be able to impersonate the owner. Keep environment variables private, rotate them if exposed, use Vercel access controls, and use a long random access code.

## Safe browser developer-console pricing API

This API is protected by the same `tsa_admin_session` cookie as the console. It is not an unauthenticated public write API. Run the examples only after unlocking `/private-console` in the same browser tab/session. UUIDs are examples; replace them with real database IDs.

Set a class's pricing model to per-subject:

```js
fetch("/api/admin/pricing", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    operation: "set_model",
    grade: 8,
    pricing_model: "per_subject",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

Set a class's pricing model to bundled:

```js
fetch("/api/admin/pricing", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    operation: "set_model",
    grade: 8,
    pricing_model: "bundled",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

Set a bundled fee (also switches the class to bundled):

```js
fetch("/api/admin/pricing", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    operation: "set_bundle_fee",
    grade: 8,
    amount: 12500.0,
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

Set an individual subject fee:

```js
fetch("/api/admin/pricing", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    operation: "set_subject_fee",
    subject_id: "REPLACE-WITH-SUBJECT-UUID",
    amount: 2500.0,
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

The API validates input and writes audit events. It does not collect payments. Numeric amounts are rupees and are stored to two decimal places.

## Deployment to GitHub and Vercel

1. Create a private GitHub repository (the software is proprietary), extract this project, and push:
   ```bash
   git init
   git add .
   git commit -m "Initial Solution Academy website"
   git branch -M main
   git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
   git push -u origin main
   ```
2. In Vercel, **Add New → Project**, import the GitHub repository. Framework preset should detect Next.js. Use the default build command `npm run build`.
3. Add every required variable from `.env.example` in Vercel Project Settings → Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to the production URL. Generate a production-specific `ADMIN_DEPLOYMENT_SECRET` and hash the access code against that exact secret. Keep Preview secrets separate from Production where possible.
4. Run `supabase/schema.sql` and `supabase/seed.sql` in Supabase before deploying. Configure Google OAuth redirect URLs as above.
5. Deploy, open `/private-console`, add classes and subjects, and test pricing model switching, inquiries, student sign-in, helpbox, activity log and mobile layout.
6. Never commit `.env.local`, service-role keys, Groq/Radar keys, or raw admin access codes. Use a private GitHub repository and restrict Vercel team access.

## Security notes and tradeoffs

- Admin code hashing uses Node.js `scrypt` with a random salt. `ADMIN_DEPLOYMENT_SECRET` is mixed into the derived input, and the resulting code hash is compared with a timing-safe comparison. This avoids storing the code itself. Rotating the deployment secret requires regenerating the hash and invalidates existing sessions.
- The signed admin cookie is an HMAC-authenticated, eight-hour bearer session. It is HttpOnly and SameSite=Strict. This is a single-owner access-code gate, not a general identity provider or hardware-backed MFA. Protect the Vercel account and rotate secrets regularly.
- The in-memory rate limiter works per serverless instance and is not a globally consistent distributed limit. For strict production limits, replace it with a shared durable store (such as a managed Redis/KV) and preserve tests.
- Privileged database operations use the service-role key server-side. RLS is enabled; direct browser writes are not granted for privileged tables. Never expose the service-role key.
- The helpbox scope filter is a lightweight heuristic, not a perfect classifier. The system prompt is additional guidance, not a security boundary. Review abuse reports and tune the classifier as needed.
- Student conversations and approximate IP-derived region are personal data. This build displays a privacy notice, avoids exact coordinates, and records unresolved/VPN-like results as unknown. Because students may be minors, obtain appropriate parent/guardian consent and legal review before production, define a retention/deletion process, and make the monitoring purpose transparent. The map panel intentionally displays only coarse region text/unresolved state rather than a precise map pin.
- Public inquiry records include an IP address for abuse prevention. If this is not needed for your legal/security policy, remove it and the related column.

## Tests

```bash
npm test
npm run typecheck
npm run build
```

Tests cover scrypt access-code validation, signed admin sessions, in-memory rate limiting, and helpbox topic scope/refusal. API behavior is structured for integration testing; a fully isolated database-backed integration suite requires a dedicated Supabase test project and credentials.

## License

Proprietary. No use, copying, modification, or distribution is permitted without written permission. See `LICENSE`.
