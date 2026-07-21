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
  insert into public.profiles (id, user_id, email, display_name)
  values (
    new.id,
    new.id::text,
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
  user_id text unique,
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

alter table public.profiles
  add column if not exists id uuid references auth.users(id) on delete cascade,
  add column if not exists user_id text,
  add column if not exists email text,
  add column if not exists school_name text,
  add column if not exists level text,
  add column if not exists avatar_url text,
  add column if not exists timezone text,
  add column if not exists preferences jsonb not null default '{}'::jsonb;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'user_id'
  ) then
    update public.profiles
    set id = nullif(trim(user_id), '')::uuid
    where id is null
      and user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  end if;
end;
$$;

create unique index if not exists profiles_id_key on public.profiles (id);

create table if not exists public.ic_educate_account_deletions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text,
  reason text,
  deleted_rows jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now()
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
  add column if not exists client_request_id text,
  add column if not exists phone text,
  add column if not exists topic text,
  add column if not exists syllabus text,
  add column if not exists area text,
  add column if not exists mode text,
  add column if not exists budget text,
  add column if not exists lead_type text not null default 'student',
  add column if not exists preferred_time text,
  add column if not exists selected_tutor_key text,
  add column if not exists selected_tutor_name text,
  add column if not exists booking_day text,
  add column if not exists booking_slot text,
  add column if not exists booking_mode text,
  add column if not exists booking_venue text,
  add column if not exists edit_token_hash text,
  add column if not exists consent_whatsapp boolean not null default false,
  add column if not exists market text not null default 'malaysia',
  add column if not exists note text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.ic_educate_leads
  alter column email drop not null;

create table if not exists public.ic_educate_admin_allowlist (
  email text primary key,
  role text not null default 'admin' check (role in ('owner', 'admin')),
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(trim(email))),
  check (position('@' in email) > 1)
);

alter table public.ic_educate_admin_allowlist
  add column if not exists role text not null default 'admin',
  add column if not exists note text,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ic_educate_admin_allowlist_role_check'
      and conrelid = 'public.ic_educate_admin_allowlist'::regclass
  ) then
    alter table public.ic_educate_admin_allowlist
      add constraint ic_educate_admin_allowlist_role_check
      check (role in ('owner', 'admin'));
  end if;
end;
$$;

create table if not exists public.ic_educate_teacher_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  submission_id text not null unique,
  display_name text not null,
  market text not null default 'malaysia' check (market in ('malaysia', 'hongkong')),
  subjects text[] not null default '{}',
  syllabuses text[] not null default '{}',
  levels text[] not null default '{}',
  experience_years smallint not null default 0 check (experience_years between 0 and 60),
  qualifications text,
  languages text[] not null default '{}',
  area text not null,
  lesson_modes text[] not null default '{online}',
  availability text[] not null default '{}',
  fee_label text,
  bio text,
  avatar_url text,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  review_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(subjects) > 0),
  check (cardinality(levels) > 0),
  check (lesson_modes <@ array['online', 'physical']::text[])
);

alter table public.ic_educate_teacher_profiles
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists review_note text,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz;

create or replace function public.set_teacher_profile_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  elsif new.status <> 'published' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create table if not exists public.ic_educate_saved_tutors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  teacher_key text not null,
  teacher_name text not null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, teacher_key)
);

create table if not exists public.ic_educate_marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null references public.ic_educate_leads(id) on delete cascade,
  sender_role text not null default 'student' check (sender_role in ('student', 'operator', 'tutor')),
  body text not null check (body <> '' and char_length(body) <= 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.save_ic_educate_tutor_request(p_payload jsonb, p_edit_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_existing public.ic_educate_leads%rowtype;
  v_client_request_id text := nullif(trim(p_payload ->> 'client_request_id'), '');
  v_phone text := nullif(trim(p_payload ->> 'phone'), '');
  v_email text := nullif(trim(p_payload ->> 'email'), '');
  v_token_hash text := encode(digest(coalesce(p_edit_token, ''), 'sha256'), 'hex');
begin
  if v_client_request_id is null or char_length(coalesce(p_edit_token, '')) < 20 then
    raise exception 'A client request id and edit token are required';
  end if;

  select * into v_existing
  from public.ic_educate_leads
  where client_request_id = v_client_request_id
  limit 1;

  if found then
    if not (
      (auth.uid() is not null and v_existing.user_id = auth.uid())
      or (v_existing.user_id is null and v_existing.edit_token_hash = v_token_hash)
    ) then
      raise exception 'Request ownership check failed';
    end if;

    update public.ic_educate_leads
    set user_id = coalesce(user_id, auth.uid()),
        email = coalesce(v_email, email),
        name = nullif(trim(p_payload ->> 'name'), ''),
        phone = coalesce(v_phone, phone),
        subject = nullif(trim(p_payload ->> 'subject'), ''),
        topic = nullif(trim(p_payload ->> 'topic'), ''),
        syllabus = nullif(trim(p_payload ->> 'syllabus'), ''),
        level = nullif(trim(p_payload ->> 'level'), ''),
        area = nullif(trim(p_payload ->> 'area'), ''),
        mode = nullif(trim(p_payload ->> 'mode'), ''),
        budget = nullif(trim(p_payload ->> 'budget'), ''),
        preferred_time = nullif(trim(p_payload ->> 'preferred_time'), ''),
        selected_tutor_key = nullif(trim(p_payload ->> 'selected_tutor_key'), ''),
        selected_tutor_name = nullif(trim(p_payload ->> 'selected_tutor_name'), ''),
        booking_day = nullif(trim(p_payload ->> 'booking_day'), ''),
        booking_slot = nullif(trim(p_payload ->> 'booking_slot'), ''),
        booking_mode = nullif(trim(p_payload ->> 'booking_mode'), ''),
        booking_venue = nullif(trim(p_payload ->> 'booking_venue'), ''),
        consent_whatsapp = coalesce((p_payload ->> 'consent_whatsapp')::boolean, consent_whatsapp),
        note = nullif(trim(p_payload ->> 'note'), ''),
        page = nullif(trim(p_payload ->> 'page'), ''),
        status = v_existing.status,
        updated_at = now()
    where id = v_existing.id
    returning id into v_id;
    return v_id;
  end if;

  if coalesce(v_phone, v_email) is null then
    raise exception 'A phone number or email is required';
  end if;

  insert into public.ic_educate_leads (
    user_id, client_request_id, email, name, phone, subject, topic, syllabus, level, area, mode, budget,
    lead_type, preferred_time, selected_tutor_key, selected_tutor_name, booking_day, booking_slot,
    booking_mode, booking_venue, edit_token_hash, consent_whatsapp, market, note, page, source, status
  ) values (
    auth.uid(), v_client_request_id, v_email, nullif(trim(p_payload ->> 'name'), ''), v_phone,
    nullif(trim(p_payload ->> 'subject'), ''), nullif(trim(p_payload ->> 'topic'), ''),
    nullif(trim(p_payload ->> 'syllabus'), ''), nullif(trim(p_payload ->> 'level'), ''),
    nullif(trim(p_payload ->> 'area'), ''), nullif(trim(p_payload ->> 'mode'), ''),
    nullif(trim(p_payload ->> 'budget'), ''), 'student', nullif(trim(p_payload ->> 'preferred_time'), ''),
    nullif(trim(p_payload ->> 'selected_tutor_key'), ''), nullif(trim(p_payload ->> 'selected_tutor_name'), ''),
    nullif(trim(p_payload ->> 'booking_day'), ''), nullif(trim(p_payload ->> 'booking_slot'), ''),
    nullif(trim(p_payload ->> 'booking_mode'), ''), nullif(trim(p_payload ->> 'booking_venue'), ''),
    v_token_hash, coalesce((p_payload ->> 'consent_whatsapp')::boolean, false),
    case when p_payload ->> 'market' = 'hongkong' then 'hongkong' else 'malaysia' end,
    nullif(trim(p_payload ->> 'note'), ''), nullif(trim(p_payload ->> 'page'), ''), 'tutor-finder', 'new'
  ) returning id into v_id;

  return v_id;
end;
$$;

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
    from auth.users as admin_user
    join public.ic_educate_admin_allowlist as allowlist
      on allowlist.email = lower(coalesce(admin_user.email, ''))
     and allowlist.is_active
    where admin_user.id = auth.uid()
      and allowlist.role in ('owner', 'admin')
  );
$$;

create or replace function public.guard_ic_educate_teacher_profile_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if public.is_ic_educate_admin() then
    return new;
  end if;

  if auth.uid() is null or old.user_id is distinct from auth.uid() then
    return new;
  end if;

  if new.review_note is distinct from old.review_note
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.published_at is distinct from old.published_at then
    raise exception 'Only IC Educate admins can change moderation fields';
  end if;

  if new.status is distinct from 'pending' then
    raise exception 'Teacher profile updates must return to pending review';
  end if;

  return new;
end;
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
create unique index if not exists ic_educate_leads_client_request_id_uidx
  on public.ic_educate_leads (client_request_id) where client_request_id is not null;
create index if not exists ic_educate_leads_market_status_idx on public.ic_educate_leads (market, status, created_at desc);
create index if not exists ic_educate_leads_type_subject_idx on public.ic_educate_leads (lead_type, subject);
create index if not exists ic_educate_teacher_profiles_status_published_idx
  on public.ic_educate_teacher_profiles (status, published_at desc);
create index if not exists ic_educate_teacher_profiles_market_idx
  on public.ic_educate_teacher_profiles (market, created_at desc);
create index if not exists ic_educate_teacher_profiles_user_id_idx
  on public.ic_educate_teacher_profiles (user_id, updated_at desc);
create index if not exists ic_educate_saved_tutors_user_id_idx
  on public.ic_educate_saved_tutors (user_id, updated_at desc);
create index if not exists ic_educate_marketplace_messages_request_idx
  on public.ic_educate_marketplace_messages (request_id, created_at asc);
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
alter table public.ic_educate_account_deletions enable row level security;
alter table public.ic_educate_leads enable row level security;
alter table public.ic_educate_admin_allowlist enable row level security;
alter table public.ic_educate_teacher_profiles enable row level security;
alter table public.ic_educate_saved_tutors enable row level security;
alter table public.ic_educate_marketplace_messages enable row level security;
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

drop trigger if exists set_ic_educate_admin_allowlist_updated_at on public.ic_educate_admin_allowlist;
create trigger set_ic_educate_admin_allowlist_updated_at
before update on public.ic_educate_admin_allowlist
for each row execute function public.set_updated_at();

drop trigger if exists set_ic_educate_teacher_profiles_updated_at on public.ic_educate_teacher_profiles;
create trigger set_ic_educate_teacher_profiles_updated_at
before update on public.ic_educate_teacher_profiles
for each row execute function public.set_updated_at();

drop trigger if exists guard_ic_educate_teacher_profiles_owner_update on public.ic_educate_teacher_profiles;
create trigger guard_ic_educate_teacher_profiles_owner_update
before update on public.ic_educate_teacher_profiles
for each row execute function public.guard_ic_educate_teacher_profile_update();

drop trigger if exists set_ic_educate_teacher_profiles_published_at on public.ic_educate_teacher_profiles;
create trigger set_ic_educate_teacher_profiles_published_at
before insert or update on public.ic_educate_teacher_profiles
for each row execute function public.set_teacher_profile_published_at();

drop trigger if exists set_ic_educate_saved_tutors_updated_at on public.ic_educate_saved_tutors;
create trigger set_ic_educate_saved_tutors_updated_at
before update on public.ic_educate_saved_tutors
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
revoke all on function public.save_ic_educate_tutor_request(jsonb, text) from public;
grant execute on function public.save_ic_educate_tutor_request(jsonb, text) to anon, authenticated;

revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

revoke all on public.ic_educate_account_deletions from anon, authenticated;

revoke all on public.ic_educate_leads from anon, authenticated;
grant insert on public.ic_educate_leads to anon, authenticated;
grant select, insert, update on public.ic_educate_leads to authenticated;

revoke all on public.ic_educate_admin_allowlist from anon, authenticated;

revoke all on public.ic_educate_teacher_profiles from anon, authenticated;
grant select, insert on public.ic_educate_teacher_profiles to anon, authenticated;
grant update on public.ic_educate_teacher_profiles to authenticated;

revoke all on public.ic_educate_saved_tutors from anon, authenticated;
grant select, insert, update, delete on public.ic_educate_saved_tutors to authenticated;

revoke all on public.ic_educate_marketplace_messages from anon, authenticated;
grant select, insert, update on public.ic_educate_marketplace_messages to authenticated;

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
  coalesce(nullif(email, ''), nullif(phone, '')) is not null
  and source in ('free-7-day-plan', 'personalized-exam-pdf-request', 'teacher-signup', 'tutor-finder', 'lead-kit')
  and lead_type in ('student', 'parent', 'teacher')
  and market in ('malaysia', 'hongkong')
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

drop policy if exists "Public can submit teacher profiles" on public.ic_educate_teacher_profiles;
create policy "Public can submit teacher profiles"
on public.ic_educate_teacher_profiles
for insert
to anon, authenticated
with check (
  status = 'pending'
  and (user_id is null or user_id = auth.uid())
  and display_name <> ''
  and area <> ''
  and cardinality(subjects) > 0
  and cardinality(levels) > 0
);

drop policy if exists "Public can read published teacher profiles" on public.ic_educate_teacher_profiles;
create policy "Public can read published teacher profiles"
on public.ic_educate_teacher_profiles
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "IC Educate admins can read teacher profiles" on public.ic_educate_teacher_profiles;
create policy "IC Educate admins can read teacher profiles"
on public.ic_educate_teacher_profiles
for select
to authenticated
using (public.is_ic_educate_admin());

drop policy if exists "IC Educate admins can update teacher profiles" on public.ic_educate_teacher_profiles;
create policy "IC Educate admins can update teacher profiles"
on public.ic_educate_teacher_profiles
for update
to authenticated
using (public.is_ic_educate_admin())
with check (public.is_ic_educate_admin());

drop policy if exists "Teacher profiles are readable by owner" on public.ic_educate_teacher_profiles;
create policy "Teacher profiles are readable by owner"
on public.ic_educate_teacher_profiles for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Teacher profiles are updatable by owner" on public.ic_educate_teacher_profiles;
create policy "Teacher profiles are updatable by owner"
on public.ic_educate_teacher_profiles for update to authenticated
using (user_id = auth.uid() and status in ('pending', 'hidden'))
with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "Saved tutors are readable by owner" on public.ic_educate_saved_tutors;
create policy "Saved tutors are readable by owner"
on public.ic_educate_saved_tutors for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Saved tutors are insertable by owner" on public.ic_educate_saved_tutors;
create policy "Saved tutors are insertable by owner"
on public.ic_educate_saved_tutors for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Saved tutors are updatable by owner" on public.ic_educate_saved_tutors;
create policy "Saved tutors are updatable by owner"
on public.ic_educate_saved_tutors for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Saved tutors are deletable by owner" on public.ic_educate_saved_tutors;
create policy "Saved tutors are deletable by owner"
on public.ic_educate_saved_tutors for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "Marketplace messages are readable by request owner" on public.ic_educate_marketplace_messages;
create policy "Marketplace messages are readable by request owner"
on public.ic_educate_marketplace_messages for select to authenticated
using (
  user_id = auth.uid()
  and exists (select 1 from public.ic_educate_leads where id = request_id and user_id = auth.uid())
);

drop policy if exists "Marketplace messages are insertable by request owner" on public.ic_educate_marketplace_messages;
create policy "Marketplace messages are insertable by request owner"
on public.ic_educate_marketplace_messages for insert to authenticated
with check (
  user_id = auth.uid()
  and sender_role = 'student'
  and exists (select 1 from public.ic_educate_leads where id = request_id and user_id = auth.uid())
);

drop policy if exists "Marketplace messages are readable by admin" on public.ic_educate_marketplace_messages;
create policy "Marketplace messages are readable by admin"
on public.ic_educate_marketplace_messages for select to authenticated
using (public.is_ic_educate_admin());

drop policy if exists "Marketplace messages are insertable by admin" on public.ic_educate_marketplace_messages;
create policy "Marketplace messages are insertable by admin"
on public.ic_educate_marketplace_messages for insert to authenticated
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
