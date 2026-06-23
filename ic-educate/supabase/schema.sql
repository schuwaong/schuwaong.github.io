create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name),
        updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  school_name text,
  level text,
  avatar_url text,
  timezone text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ic_educate_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  name text,
  level text,
  subject text,
  source text not null default 'free-7-day-plan',
  page text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ic_educate_leads
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.ic_educate_paper_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  client_request_id text,
  email text not null,
  level text not null,
  subject text not null,
  topic text,
  target_marks integer not null default 20,
  tier text not null default 'sample',
  weaknesses text,
  mistake_memory_snapshot jsonb not null default '{}'::jsonb,
  source text not null default 'personalized-exam-pdf-request',
  amount_cents integer not null default 0,
  currency text not null default 'MYR',
  checkout_reference text,
  payment_status text not null default 'not_started',
  generation_status text not null default 'requested',
  pdf_url text,
  paid_at timestamptz,
  page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ic_educate_paper_requests
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists client_request_id text,
  add column if not exists amount_cents integer not null default 0,
  add column if not exists currency text not null default 'MYR',
  add column if not exists checkout_reference text,
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.is_ic_educate_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and coalesce(preferences ->> 'role', '') in ('owner', 'admin')
  );
$$;

create table if not exists public.ic_educate_mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  topic text not null,
  subtopic text,
  error_type text,
  type text not null default 'Concept gap',
  severity integer not null default 2 check (severity between 1 and 3),
  source text,
  source_question text,
  next_review_at timestamptz,
  note text,
  origin text not null default 'manual',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ic_educate_mistakes
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists subtopic text,
  add column if not exists error_type text,
  add column if not exists source_question text,
  add column if not exists next_review_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.worksheet_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_run_id text not null unique,
  syllabus text,
  level text,
  subject text,
  topic text,
  subtopic text,
  question_count integer not null default 0,
  score numeric(6,2),
  max_score numeric(6,2),
  mistake_count integer not null default 0,
  status text not null default 'generated',
  paper_url text,
  answer_key_url text,
  source_kind text,
  memory_snapshot jsonb not null default '{}'::jsonb,
  notes text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  worksheet_attempt_id uuid not null references public.worksheet_attempts(id) on delete cascade,
  question_number text,
  prompt text,
  student_answer text,
  correct_answer text,
  score numeric(6,2),
  max_score numeric(6,2),
  is_correct boolean not null default false,
  topic text,
  subtopic text,
  error_type text,
  severity integer not null default 1 check (severity between 1 and 3),
  source_question text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.mistake_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  worksheet_attempt_id uuid references public.worksheet_attempts(id) on delete cascade,
  question_attempt_id uuid references public.question_attempts(id) on delete set null,
  topic text not null,
  subtopic text,
  error_type text not null,
  severity integer not null default 2 check (severity between 1 and 3),
  source_question text,
  student_answer text,
  correct_answer text,
  note text,
  memory_snapshot jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revision_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_key text not null,
  topic text not null,
  subtopic text,
  error_type text,
  severity integer not null default 2 check (severity between 1 and 3),
  source_question text,
  card_type text not null default 'notes',
  front text not null,
  back text not null,
  memory_snapshot jsonb not null default '{}'::jsonb,
  review_count integer not null default 0,
  ease_factor numeric(4,2) not null default 2.50,
  last_reviewed_at timestamptz,
  next_review_at timestamptz not null default now(),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, card_key)
);

create table if not exists public.card_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.revision_cards(id) on delete cascade,
  review_result text not null check (review_result in ('got_it', 'again', 'unsure')),
  rating integer not null default 2 check (rating between 0 and 3),
  reviewed_at timestamptz not null default now(),
  next_review_at timestamptz,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ic_educate_leads_email_idx on public.ic_educate_leads (email);
create index if not exists ic_educate_leads_user_id_idx on public.ic_educate_leads (user_id);
create index if not exists ic_educate_paper_requests_email_idx on public.ic_educate_paper_requests (email);
create index if not exists ic_educate_paper_requests_user_id_idx on public.ic_educate_paper_requests (user_id);
create index if not exists ic_educate_paper_requests_client_request_id_idx on public.ic_educate_paper_requests (client_request_id);
create index if not exists ic_educate_paper_requests_payment_idx on public.ic_educate_paper_requests (payment_status, generation_status, created_at desc);
create index if not exists ic_educate_mistakes_user_id_idx on public.ic_educate_mistakes (user_id);
create index if not exists worksheet_attempts_user_id_created_at_idx on public.worksheet_attempts (user_id, created_at desc);
create index if not exists worksheet_attempts_user_id_topic_idx on public.worksheet_attempts (user_id, topic);
create index if not exists question_attempts_user_id_worksheet_idx on public.question_attempts (user_id, worksheet_attempt_id);
create index if not exists mistake_events_user_id_topic_idx on public.mistake_events (user_id, topic, subtopic);
create index if not exists mistake_events_user_id_created_at_idx on public.mistake_events (user_id, created_at desc);
create index if not exists revision_cards_user_id_next_review_idx on public.revision_cards (user_id, next_review_at);
create index if not exists revision_cards_user_id_topic_idx on public.revision_cards (user_id, topic, subtopic);
create index if not exists card_reviews_user_id_card_idx on public.card_reviews (user_id, card_id, reviewed_at desc);

alter table public.profiles enable row level security;
alter table public.ic_educate_leads enable row level security;
alter table public.ic_educate_paper_requests enable row level security;
alter table public.ic_educate_mistakes enable row level security;
alter table public.worksheet_attempts enable row level security;
alter table public.question_attempts enable row level security;
alter table public.mistake_events enable row level security;
alter table public.revision_cards enable row level security;
alter table public.card_reviews enable row level security;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_ic_educate_leads_updated_at on public.ic_educate_leads;
create trigger set_ic_educate_leads_updated_at
before update on public.ic_educate_leads
for each row execute function public.set_updated_at();

drop trigger if exists set_ic_educate_paper_requests_updated_at on public.ic_educate_paper_requests;
create trigger set_ic_educate_paper_requests_updated_at
before update on public.ic_educate_paper_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_ic_educate_mistakes_updated_at on public.ic_educate_mistakes;
create trigger set_ic_educate_mistakes_updated_at
before update on public.ic_educate_mistakes
for each row execute function public.set_updated_at();

drop trigger if exists set_worksheet_attempts_updated_at on public.worksheet_attempts;
create trigger set_worksheet_attempts_updated_at
before update on public.worksheet_attempts
for each row execute function public.set_updated_at();

drop trigger if exists set_mistake_events_updated_at on public.mistake_events;
create trigger set_mistake_events_updated_at
before update on public.mistake_events
for each row execute function public.set_updated_at();

drop trigger if exists set_revision_cards_updated_at on public.revision_cards;
create trigger set_revision_cards_updated_at
before update on public.revision_cards
for each row execute function public.set_updated_at();

revoke all on schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant execute on function public.is_ic_educate_admin() to authenticated;

revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

revoke all on public.ic_educate_leads from anon, authenticated;
grant insert on public.ic_educate_leads to anon, authenticated;
grant select, insert, update on public.ic_educate_leads to authenticated;

revoke all on public.ic_educate_paper_requests from anon, authenticated;
grant insert on public.ic_educate_paper_requests to anon, authenticated;
grant select, insert, update on public.ic_educate_paper_requests to authenticated;

revoke all on public.ic_educate_mistakes from anon, authenticated;
grant insert on public.ic_educate_mistakes to anon, authenticated;
grant select, insert, update on public.ic_educate_mistakes to authenticated;

revoke all on public.worksheet_attempts from anon, authenticated;
grant select, insert, update, delete on public.worksheet_attempts to authenticated;

revoke all on public.question_attempts from anon, authenticated;
grant select, insert, update, delete on public.question_attempts to authenticated;

revoke all on public.mistake_events from anon, authenticated;
grant select, insert, update, delete on public.mistake_events to authenticated;

revoke all on public.revision_cards from anon, authenticated;
grant select, insert, update, delete on public.revision_cards to authenticated;

revoke all on public.card_reviews from anon, authenticated;
grant select, insert, update, delete on public.card_reviews to authenticated;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Public can create IC Educate leads" on public.ic_educate_leads;
create policy "Public can create IC Educate leads"
on public.ic_educate_leads
for insert
to anon, authenticated
with check (
  email is not null
  and email <> ''
  and source in ('free-7-day-plan', 'personalized-exam-pdf-request')
  and (user_id is null or user_id = auth.uid())
);

drop policy if exists "IC Educate leads are readable by owner" on public.ic_educate_leads;
create policy "IC Educate leads are readable by owner"
on public.ic_educate_leads
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "IC Educate leads are updatable by owner" on public.ic_educate_leads;
create policy "IC Educate leads are updatable by owner"
on public.ic_educate_leads
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "IC Educate admins can read leads" on public.ic_educate_leads;
create policy "IC Educate admins can read leads"
on public.ic_educate_leads
for select
to authenticated
using (public.is_ic_educate_admin());

drop policy if exists "IC Educate admins can update leads" on public.ic_educate_leads;
create policy "IC Educate admins can update leads"
on public.ic_educate_leads
for update
to authenticated
using (public.is_ic_educate_admin())
with check (public.is_ic_educate_admin());

drop policy if exists "Public can create IC Educate paper requests" on public.ic_educate_paper_requests;
create policy "Public can create IC Educate paper requests"
on public.ic_educate_paper_requests
for insert
to anon, authenticated
with check (
  email is not null
  and email <> ''
  and level is not null
  and level <> ''
  and subject is not null
  and subject <> ''
  and target_marks between 1 and 120
  and (user_id is null or user_id = auth.uid())
);

drop policy if exists "IC Educate paper requests are readable by owner" on public.ic_educate_paper_requests;
create policy "IC Educate paper requests are readable by owner"
on public.ic_educate_paper_requests
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "IC Educate paper requests are updatable by owner" on public.ic_educate_paper_requests;
create policy "IC Educate paper requests are updatable by owner"
on public.ic_educate_paper_requests
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "IC Educate admins can read paper requests" on public.ic_educate_paper_requests;
create policy "IC Educate admins can read paper requests"
on public.ic_educate_paper_requests
for select
to authenticated
using (public.is_ic_educate_admin());

drop policy if exists "IC Educate admins can update paper requests" on public.ic_educate_paper_requests;
create policy "IC Educate admins can update paper requests"
on public.ic_educate_paper_requests
for update
to authenticated
using (public.is_ic_educate_admin())
with check (public.is_ic_educate_admin());

drop policy if exists "Public can create IC Educate mistakes" on public.ic_educate_mistakes;
create policy "Public can create IC Educate mistakes"
on public.ic_educate_mistakes
for insert
to anon, authenticated
with check (
  topic is not null
  and topic <> ''
  and type is not null
  and type <> ''
  and severity between 1 and 3
  and (user_id is null or user_id = auth.uid())
);

drop policy if exists "IC Educate mistakes are readable by owner" on public.ic_educate_mistakes;
create policy "IC Educate mistakes are readable by owner"
on public.ic_educate_mistakes
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "IC Educate mistakes are updatable by owner" on public.ic_educate_mistakes;
create policy "IC Educate mistakes are updatable by owner"
on public.ic_educate_mistakes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "IC Educate admins can read mistakes" on public.ic_educate_mistakes;
create policy "IC Educate admins can read mistakes"
on public.ic_educate_mistakes
for select
to authenticated
using (public.is_ic_educate_admin());

drop policy if exists "IC Educate admins can update mistakes" on public.ic_educate_mistakes;
create policy "IC Educate admins can update mistakes"
on public.ic_educate_mistakes
for update
to authenticated
using (public.is_ic_educate_admin())
with check (public.is_ic_educate_admin());

drop policy if exists "Worksheet attempts are readable by owner" on public.worksheet_attempts;
create policy "Worksheet attempts are readable by owner"
on public.worksheet_attempts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Worksheet attempts are insertable by owner" on public.worksheet_attempts;
create policy "Worksheet attempts are insertable by owner"
on public.worksheet_attempts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Worksheet attempts are updatable by owner" on public.worksheet_attempts;
create policy "Worksheet attempts are updatable by owner"
on public.worksheet_attempts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Worksheet attempts are deletable by owner" on public.worksheet_attempts;
create policy "Worksheet attempts are deletable by owner"
on public.worksheet_attempts
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Question attempts are readable by owner" on public.question_attempts;
create policy "Question attempts are readable by owner"
on public.question_attempts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Question attempts are insertable by owner" on public.question_attempts;
create policy "Question attempts are insertable by owner"
on public.question_attempts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Question attempts are updatable by owner" on public.question_attempts;
create policy "Question attempts are updatable by owner"
on public.question_attempts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Question attempts are deletable by owner" on public.question_attempts;
create policy "Question attempts are deletable by owner"
on public.question_attempts
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Mistake events are readable by owner" on public.mistake_events;
create policy "Mistake events are readable by owner"
on public.mistake_events
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Mistake events are insertable by owner" on public.mistake_events;
create policy "Mistake events are insertable by owner"
on public.mistake_events
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Mistake events are updatable by owner" on public.mistake_events;
create policy "Mistake events are updatable by owner"
on public.mistake_events
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Mistake events are deletable by owner" on public.mistake_events;
create policy "Mistake events are deletable by owner"
on public.mistake_events
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Revision cards are readable by owner" on public.revision_cards;
create policy "Revision cards are readable by owner"
on public.revision_cards
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Revision cards are insertable by owner" on public.revision_cards;
create policy "Revision cards are insertable by owner"
on public.revision_cards
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Revision cards are updatable by owner" on public.revision_cards;
create policy "Revision cards are updatable by owner"
on public.revision_cards
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Revision cards are deletable by owner" on public.revision_cards;
create policy "Revision cards are deletable by owner"
on public.revision_cards
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Card reviews are readable by owner" on public.card_reviews;
create policy "Card reviews are readable by owner"
on public.card_reviews
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Card reviews are insertable by owner" on public.card_reviews;
create policy "Card reviews are insertable by owner"
on public.card_reviews
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Card reviews are updatable by owner" on public.card_reviews;
create policy "Card reviews are updatable by owner"
on public.card_reviews
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Card reviews are deletable by owner" on public.card_reviews;
create policy "Card reviews are deletable by owner"
on public.card_reviews
for delete
to authenticated
using (user_id = auth.uid());
