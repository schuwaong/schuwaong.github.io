# IC Educate Production Setup

The GitHub Pages site is static. It can collect demo data in `localStorage`, but real leads, paper requests, and shared mistake memory need an external backend. The cheapest practical setup is Supabase Free for data capture, then Stripe later for paid checkout.

## Free Supabase Setup

1. Create a free Supabase project.
2. Open SQL Editor.
3. Run [`supabase/schema.sql`](./supabase/schema.sql).
4. Go to Project Settings -> API.
5. Copy the Project URL and anon public key.
6. Copy `config.example.js` to `config.js`.
7. Fill in:

```js
window.IC_EDUCATE_SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
window.IC_EDUCATE_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

The anon key is designed to be public. Row Level Security in `schema.sql` limits anonymous access to approved public teacher profiles, lead capture, and the secure tutor-request RPC.

## Marketplace Backend Coverage

Run the latest [`supabase/schema.sql`](./supabase/schema.sql) before deploying the marketplace pages. It now provides:

- `profiles`: signed-in student name, level, and subject preferences.
- `ic_educate_leads`: tutor requests, selected tutor, booking slot, venue, budget, and admin status.
- `save_ic_educate_tutor_request(...)`: secure create/update for anonymous and signed-in requests.
- `ic_educate_teacher_profiles`: public teacher directory fields without private phone numbers.
- `ic_educate_saved_tutors`: per-account tutor shortlist.
- `ic_educate_marketplace_messages`: request-linked student/operator messages.

Anonymous tutor requests use a random private edit token stored only in that browser. The RPC stores only its SHA-256 hash, so a later booking update can modify the same request without allowing public table updates. After sign-in, the request is claimed by `auth.uid()` and becomes available across devices.

The tutor marketplace account uses the same `icEducateSupabaseSession` session as the main learning dashboard. Configure Supabase Auth email/password and set your preferred email-confirmation behavior in the Supabase dashboard.

Teacher promo media and friend/social demo entries remain device-local. Publishing those globally requires authenticated teacher ownership, media storage limits, and moderation rules; anonymous public uploads are intentionally not enabled.

### Public Teacher Directory Cache Gate

The frontend flag `IC_EDUCATE_PUBLIC_TEACHER_PROFILES_ENABLED` should remain `false` until the live Supabase REST endpoint can read:

```text
/rest/v1/ic_educate_teacher_profiles?select=id&limit=1
```

If the endpoint returns `PGRST205` / `Could not find the table ... in the schema cache`, the PostgREST schema cache still needs to be reloaded from the Supabase dashboard or a direct database session. After that endpoint returns `200`, set the flag to `true` so approved teacher profiles with `status = 'published'` can load into Tutor Finder and Discover.

## Account Deletion Endpoint

Store submission now expects a real in-app delete path, not a support-only note. This repo includes a Supabase Edge Function at `supabase/functions/delete-account/index.ts`.

Deploy it after applying the latest schema:

```bash
./deploy_backend.sh
```

The web app derives the default endpoint automatically from `IC_EDUCATE_SUPABASE_URL` as:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-account
```

If you need to override it, set:

```js
window.IC_EDUCATE_DELETE_ACCOUNT_ENDPOINT = "https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-account";
```

The function deletes the signed-in auth user, removes linked tutor requests and teacher profiles that should not remain public, and writes an internal audit row before deletion.

The repo now includes `deploy_backend.sh`, which:

- copies the current `supabase/schema.sql` into a release migration file
- runs `supabase db push` against the `SUPABASE_DB_URL` you provide
- sets `CORS_ALLOWED_ORIGINS` for `functions/delete-account` when you provide that env var
- deploys `functions/delete-account` when `SUPABASE_ACCESS_TOKEN` is available

## External Integrations Still Required

These are provider/deployment dependencies rather than missing database code:

- Apply `supabase/schema.sql` to the live Supabase project.
- Deploy the `delete-account` Edge Function for the account deletion page and in-app delete flow.
- Configure a real checkout provider and populate `IC_REVENUE_CHECKOUT_LINKS` for payments.
- Deploy the worksheet/study-pack API or run the local bridge for generation, OCR, and marking.
- Configure Supabase Storage before making teacher profile photos cross-device; local photos stay in the submitting browser today.

## Public Policy URLs

The app now includes public policy and support pages that are suitable for Play Store listing URLs:

- `./privacy.html`
- `./terms.html`
- `./support.html`
- `./delete-account.html`

When you publish the site, use the full live URLs in the store console, for example:

```text
https://YOUR_DOMAIN/ic-educate/privacy.html
https://YOUR_DOMAIN/ic-educate/delete-account.html
```

## iOS App Shell

This repo now also includes an iOS wrapper at `../ic-educate-ios-app`.

Use it when you are preparing the App Store build:

- `ic-educate-ios-app/sync_site_assets.sh` copies the latest IC Educate web app into the iOS bundle.
- `ic-educate-ios-app/generate_project.rb` regenerates `ICEducate.xcodeproj` if you need to rebuild the Xcode project file.
- `ic-educate-ios-app/archive_release.sh` archives the release build once full Xcode and signing are available.

The local environment here only has Apple Command Line Tools, so archive/upload still must be completed on a Mac with full Xcode installed.

## Owner Account And Order Tracking

1. Open the live site and create your account with the email you want to use as the IC Educate owner.
2. In Supabase SQL Editor, add that lowercase email to the server-side admin allowlist:

```sql
insert into public.ic_educate_admin_allowlist (email, role)
values ('your_owner_email@example.com', 'owner')
on conflict (email) do update
set role = excluded.role,
    updated_at = timezone('utc', now());
```

Use `role = 'admin'` for staff who should moderate or manage orders without owner status.

3. Sign out and sign back in. The Orders tab will then be able to read and update all paper requests allowed by the admin RLS policies.

Payment tracking is stored on `ic_educate_paper_requests`:

- `amount_cents`
- `currency`
- `checkout_reference`
- `payment_status`
- `generation_status`
- `paid_at`
- `pdf_url`

Until Stripe/PayPal/Wise is connected, use the Orders tab as a manual board: mark requests as `paid`, move production to `generating`, then `delivered`.

## Frontend Endpoint Hooks

Set these globals before `app.js` loads, or inject them through a small config script:

```html
<script>
  window.IC_EDUCATE_SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
  window.IC_EDUCATE_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
  window.IC_EDUCATE_LEAD_ENDPOINT = "https://your-api.example.com/api/ic-educate/leads";
  window.IC_EDUCATE_PAPER_REQUEST_ENDPOINT = "https://your-api.example.com/api/ic-educate/paper-requests";
  window.IC_EDUCATE_API_BASE = "https://your-generation-api.example.com";
  window.IC_EDUCATE_OWNER_EMAILS = ["owner@example.com"];
  window.IC_REVENUE_CHECKOUT_LINKS = {
    "ic-educate-single-paper": "https://checkout.example.com/single-paper",
    "ic-educate-revision-bundle": "https://checkout.example.com/revision-bundle",
    "ic-educate-monthly-coach": "https://checkout.example.com/monthly"
  };
</script>
```

`window.IC_EDUCATE_OWNER_EMAILS` is optional UI copy/config for the current frontend. It does not grant admin or owner access. Production authority comes from `public.ic_educate_admin_allowlist` on the server side.

If Supabase or custom endpoints are not configured, the site stores demo data locally in the browser.

## Lead Payload

```json
{
  "email": "student@example.com",
  "name": "Student or parent",
  "level": "P6",
  "subject": "Mathematics",
  "source": "free-7-day-plan",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "page": "https://schuwaong.github.io/ic-educate/"
}
```

## Personalized Paper Request Payload

```json
{
  "email": "parent@example.com",
  "level": "P6",
  "subject": "Mathematics",
  "topic": "Fractions",
  "targetMarks": 40,
  "tier": "single",
  "productLabel": "Single full paper",
  "amountCents": 2900,
  "currency": "MYR",
  "paymentStatus": "awaiting_payment",
  "generationStatus": "brief_ready",
  "weaknesses": "Careless denominator changes",
  "mistakeMemory": {
    "summary": {
      "count": 3,
      "topTopics": ["Fractions"]
    },
    "recent": []
  },
  "source": "personalized-exam-pdf-request",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "page": "https://schuwaong.github.io/ic-educate/"
}
```

## Suggested Backend Tables

### `ic_educate_leads`

- `id`
- `email`
- `name`
- `level`
- `subject`
- `source`
- `created_at`
- `utm_source`
- `utm_campaign`
- `status`

### `ic_educate_paper_requests`

- `id`
- `lead_id`
- `email`
- `level`
- `subject`
- `topic`
- `target_marks`
- `tier`
- `weaknesses`
- `mistake_memory_snapshot`
- `payment_status`
- `generation_status`
- `pdf_url`
- `created_at`

### `ic_educate_mistakes`

- `id`
- `student_id`
- `topic`
- `type`
- `severity`
- `source`
- `note`
- `origin`
- `created_at`
- `resolved_at`

## Free Tier Rules

- One 7-day starter plan per email.
- Three preview generations per week.
- Full PDFs, answer keys, saved history, and mistake memory require account/payment.
- Use the free plan to identify serious learners, not to deliver the full product.
