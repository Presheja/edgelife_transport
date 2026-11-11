-- EdgeLIFE: "seen" tracking for badges, visitor feedback, and the referral network.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.

-- 1) Badges count records nobody has opened yet.
alter table bookings     add column if not exists seen_at timestamptz;
alter table applications add column if not exists seen_at timestamptz;
-- Anything already handled before this change counts as seen.
update bookings     set seen_at = coalesce(updated_at, created_at) where seen_at is null and status <> 'new';
update applications set seen_at = coalesce(updated_at, created_at) where seen_at is null and status <> 'new';

-- 2) Visitor feedback from the public /feedback form.
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  name text not null,                 -- private
  email text,                         -- private, for follow-up only
  relationship text,                  -- rider | family | professional | other
  rating int check (rating between 1 and 5),
  message text not null,
  allow_publish boolean not null default true,
  credit text not null default 'first_initial',  -- first_initial | initials | anonymous
  status text not null default 'new',            -- new | reviewed | published | hidden
  testimonial_id uuid references testimonials(id) on delete set null
);
alter table testimonials add column if not exists feedback_id uuid references feedback(id) on delete set null;

-- 3) Referral network (per the EdgeLIFE Referral Marketing SOP).
create table if not exists referral_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  organization text not null,
  org_type text,                      -- dialysis | senior_living | assisted_living | ...
  tier int not null default 1,        -- 1 highest priority, 2 secondary
  area text,                          -- address or town
  contact_name text,
  contact_role text,
  phone text,
  email text,
  preferred_contact text,             -- e.g. "Tue/Thu mornings, email first"
  status text not null default 'prospect',
  info_sent boolean not null default false,
  first_contacted date,
  last_contact date,
  next_follow_up date,
  notes text
);
drop trigger if exists referral_sources_touch on referral_sources;
create trigger referral_sources_touch before update on referral_sources for each row execute function set_updated_at();

create table if not exists referral_touches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_id uuid not null references referral_sources(id) on delete cascade,
  touch_date date not null default current_date,
  kind text not null,                 -- call | voicemail | email | info_sent | visit | after_ride | note
  outcome text,
  created_by text
);
create index if not exists referral_touches_source on referral_touches (source_id, touch_date desc);

-- Every ride can carry its referral source; declined rides keep a reason.
alter table bookings add column if not exists referral_source_id uuid references referral_sources(id) on delete set null;
alter table bookings add column if not exists decline_reason text;
create index if not exists bookings_referral on bookings (referral_source_id, ride_date);

alter table feedback          enable row level security;
alter table referral_sources  enable row level security;
alter table referral_touches  enable row level security;
grant select, insert, update, delete on table feedback, referral_sources, referral_touches to service_role;
