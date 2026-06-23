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

The anon key is designed to be public, but the Row Level Security policies in `schema.sql` are what keep it limited to inserts only.

## Owner Account And Order Tracking

1. Open the live site and create your account with the email you want to use as the IC Educate owner.
2. In Supabase SQL Editor, mark that profile as the owner:

```sql
update public.profiles
set preferences = jsonb_set(coalesce(preferences, '{}'::jsonb), '{role}', '"owner"', true)
where email = 'YOUR_OWNER_EMAIL@example.com';
```

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
