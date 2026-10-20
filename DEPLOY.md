# Deploy checklist (Vercel + Supabase)

Do these in order. Total time: about 30 minutes.

## 1. Replace your GitHub files
Replace everything in your `not-lost-soul/TSA` repo with the contents of this folder
(do NOT upload `node_modules`, `.next` or any `.env` file), then:

    git add -A
    git commit -m "Fix build errors and bugs"
    git push

## 2. Supabase
1. Create a project at supabase.com.
2. SQL Editor: run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Project Settings -> API: copy the Project URL, anon key and service_role key.
4. Authentication -> Providers -> Google: enable it and paste your Google client ID/secret
   (created in Google Cloud Console -> OAuth Client ID -> Web application).
   Add the Supabase callback URL shown there to Google's "Authorized redirect URIs".

## 3. Make your admin secrets (on your own computer, in this folder)
    npm install
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Copy the output -> that is ADMIN_DEPLOYMENT_SECRET. Then:

    ADMIN_DEPLOYMENT_SECRET='PASTE_SECRET' node scripts/hash-admin-code.mjs 'your-long-access-code-16+chars'
Copy the printed `scrypt$...` line -> that is ADMIN_ACCESS_CODE_HASH.
(Windows PowerShell:  $env:ADMIN_DEPLOYMENT_SECRET='PASTE_SECRET'; node scripts/hash-admin-code.mjs 'your-long-access-code')

## 4. Vercel -> Project -> Settings -> Environment Variables
Add these for Production (and Preview if you want):

| Name | Value |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | from Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | from Supabase |
| SUPABASE_SERVICE_ROLE_KEY | from Supabase (secret!) |
| NEXT_PUBLIC_SITE_URL | https://YOUR-PROJECT.vercel.app (no trailing slash) |
| ADMIN_IDENTITY | your email/name label |
| ADMIN_ACCESS_CODE_HASH | the scrypt$... line, pasted exactly as printed |
| ADMIN_DEPLOYMENT_SECRET | the 64-character hex secret |
| GROQ_API_KEY | from console.groq.com |
| RADAR_API_KEY | optional |
| GROQ_MODEL | optional, defaults to llama-3.3-70b-versatile |

## 5. Redeploy
Vercel -> Deployments -> latest -> "..." -> Redeploy (env vars only apply to NEW builds).

## 6. Connect the live URL to Supabase
Supabase -> Authentication -> URL Configuration:
- Site URL: your Vercel URL
- Redirect URLs: add `https://YOUR-PROJECT.vercel.app/auth/callback`

## 7. Test
- `/private-console` -> unlock with your access code -> add Classes and Subjects.
- `/programs` shows them. `/contact` form saves an inquiry.
- `/sign-in` -> Google login -> "Study help" button appears bottom-right.
