# Moving sign-in to Clerk production

The site signed in with Clerk's **development** instance (`pk_test_…`): it shows "Development mode"
under the sign-in form, has development usage limits, and mails codes from `notifications@accounts.dev`.
This is the move to a **production** instance on `ciftcidestek.com.tr`, in the order it has to happen.

Know before starting:

- Production is a separate Clerk instance with its own users. Everyone (Murat, Nezih, test accounts)
  signs up again; `npm run users:remap` (step 7) then links their old profile, posts, listings,
  messages, fields and admin log entries to the new account.
- Clerk was added through the **Vercel Marketplace**, so Vercel manages its keys: the development
  instance serves Vercel's Development and Preview environments, production serves Production.
  Preview deployments keep signing in with the development instance.
- Production keys only work on `ciftcidestek.com.tr` and its subdomains (`www.…`). On
  `tar-m-flame.vercel.app` pages still load, but signing in there stops working; the mobile app's API
  calls there keep working only for builds made after this change, which call `www` anyway.
- `.env.local` keeps the **development** keys: production keys don't work on `localhost`.

## 1. Create the production instance

The instance's domain is the root domain, **`ciftcidestek.com.tr`** (not `www.…`): the site at `www`
and Clerk's own addresses (`clerk.ciftcidestek.com.tr`, `accounts.ciftcidestek.com.tr`) all sit under it.

1. Vercel → the team → **Integrations** (or the project's **Storage** tab) → the Clerk resource →
   **Open in Clerk**. For Marketplace apps, Clerk says the production domain is set from the
   integration's settings in Vercel; if the resource's settings there have a **Production domain**
   field, enter `ciftcidestek.com.tr` there.
2. In the Clerk dashboard, top left: **Development** → **Create production instance** →
   **Clone development instance** (keeps sign-up fields, e-mail code sign-in and the look) → domain
   `ciftcidestek.com.tr`.

SSO connections (Google), integrations and paths are **not** copied; steps 3 and 4 redo them.

## 2. DNS records

Clerk → (production) **Configure → Domains** lists five records, usually CNAMEs named `clerk`,
`accounts`, `clkmail`, `clk._domainkey` and `clk2._domainkey`. The domain uses Vercel's nameservers
(the registrar's panel has no DNS editor), so they go in Vercel → **Domains** →
`ciftcidestek.com.tr` → **DNS Records**, exactly as Clerk shows them (name without the domain part).

- The `*` record Vercel added doesn't get in the way: a named record wins over the wildcard.
- The domain's CAA records allow `letsencrypt.org` and `pki.goog`, the two authorities Clerk uses.
- Back in Clerk: **Verify configuration**, then **Deploy certificates** on the instance's home page
  once all five show as verified (minutes with Vercel DNS; Clerk allows up to 48 hours).

## 3. Google sign-in

Production needs your own Google OAuth client (development used Clerk's shared one).

1. Clerk (production) → **Configure → SSO connections → Add connection → For all users → Google** →
   turn on **Enable for sign-up and sign-in** and **Use custom credentials**. Keep this page open and
   copy the **Authorized Redirect URI** (it should read
   `https://clerk.ciftcidestek.com.tr/v1/oauth_callback`).
2. <https://console.cloud.google.com> → create a project, e.g. "Çiftçi Destek".
3. **Google Auth Platform → Branding**: app name "Çiftçi Destek", your support e-mail, home page
   `https://www.ciftcidestek.com.tr`, privacy policy `https://www.ciftcidestek.com.tr/gizlilik`,
   authorized domain `ciftcidestek.com.tr`, developer contact e-mail. Leave the logo empty unless you
   want to go through Google's brand verification.
4. **Audience**: user type **External** → **Publish app** (status "In production"). In "Testing" only
   listed test users (at most 100) can sign in. Clerk asks only for the basic scopes (`openid`,
   `email`, `profile`), which need no Google review.
5. **Clients → Create client** → type **Web application**, name e.g. "Clerk production":
   - Authorized JavaScript origins: `https://www.ciftcidestek.com.tr` and `https://ciftcidestek.com.tr`
   - Authorized redirect URIs: the URI copied from Clerk in 1.
   - **Create**, then copy the **Client ID** and **Client secret**.
6. Back in Clerk, paste both under **Use custom credentials** → **Save**.

The mobile app signs in with Google through the browser (Clerk's web flow), so this one Web client
serves it too; no Android or iOS client is needed.

## 4. The rest of the Clerk settings

- **Configure → Paths**: sign-in `https://www.ciftcidestek.com.tr/giris`, sign-up
  `https://www.ciftcidestek.com.tr/kayit`, after sign-out `https://www.ciftcidestek.com.tr/`. The site
  sets these itself; this is for links in Clerk's own e-mails and pages.
- **Configure → Native applications** (the mobile app): turn on the **Native API**; add the Android
  app (package `tr.com.ciftcidestek.app`) and, once there is an Apple developer account, the iOS app
  (bundle id `tr.com.ciftcidestek.app` and its Team ID). Under **Allowlist for mobile SSO redirect**
  add `ciftcidestek://`, the app's address after Google sign-in. In Expo Go that address is
  `exp://<computer's IP>:8081` and changes with the network; if Google sign-in there says the redirect
  isn't allowed, add the address it names (e-mail code sign-in needs none of this).
- E-mail codes now come from `notifications@ciftcidestek.com.tr`; the hints under the code box on the
  site (`lib/clerk-localization.ts`) and in the app (`mobile/src/lib/config.ts`) follow the key.

## 5. Keys and deploy

With the Marketplace, creating the production instance should sync `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
(`pk_live_…`) and `CLERK_SECRET_KEY` (`sk_live_…`) into Vercel's **Production** environment. Check
Vercel → project → Settings → Environment Variables: Production should show its own pair, apart from
Development/Preview. If it doesn't, copy them from Clerk → (production) **API keys** into Production
only. Then redeploy production (**Deployments → … → Redeploy**, or the next push to `main`).

Check: `https://www.ciftcidestek.com.tr/giris` shows no "Development mode" badge, and signing up sends
a code from `notifications@ciftcidestek.com.tr`.

## 6. Everyone signs up again

Murat, Nezih and anyone else with content sign up on `https://www.ciftcidestek.com.tr/kayit` **with the
same e-mail address as before** (or "Google ile devam et" with the same Google account). Until step 7
their new account starts empty; nothing old is lost.

## 7. Link old content to the new accounts

```powershell
npm ci
npm i -g vercel
vercel link
vercel env pull .env.local
vercel env pull --environment=production .env.production.local
npm run users:remap
```

`vercel env pull` writes `DATABASE_URL` and the development secret key (`sk_test_…`) to `.env.local`,
and the production one (`sk_live_…`) to `.env.production.local`; both files stay out of git.
`npm run users:remap` pairs each old account with the new one that has the same verified e-mail,
makes every change inside a transaction, prints them, and **rolls back** (a dry run). It lists anyone
it left alone (not signed up again yet, or no matching e-mail). When the list looks right:

```powershell
npm run users:remap -- --apply
```

It's all or nothing, and safe to run again later for people who sign up afterwards. Someone who signed
up with a different e-mail: `npm run users:remap -- --map user_OLD=user_NEW` (ids from Clerk → Users).
Sample members (`demo_…`) are never touched.

## 8. Admins

`ADMIN_EMAILS` (Production and Preview) keeps working: it checks the signed-in account's verified
e-mail, whatever the instance. `ADMIN_USER_IDS` lists development ids; add the new ids the remap
script prints at the end (keep the old ones while Preview still signs in with development), then
redeploy.

## 9. Mobile app

`mobile/src/lib/config.ts` now defaults to `https://www.ciftcidestek.com.tr` and the production key
(`pk_live_Y2xlcmsuY2lmdGNpZGVzdGVrLmNvbS50ciQ`, which encodes `clerk.ciftcidestek.com.tr`). Builds
made before this still use the development instance and `tar-m-flame.vercel.app`; they lose sign-in
once the site's secret key is production, so reinstall or restart Expo Go with the new code.
