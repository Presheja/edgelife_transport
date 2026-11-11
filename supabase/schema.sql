-- EdgeLIFE Transportation: database schema
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- It is safe to run again; every statement is idempotent.

create extension if not exists pgcrypto;

-- Keeps updated_at current on every change.
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- Site settings and rates, edited in Admin. One row per key: 'company', 'rates'.
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Ride requests, from the website or entered by dispatch after a phone call.
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'website',          -- website | phone
  status text not null default 'new',              -- new | confirmed | assigned | completed | cancelled | no_show
  rider_name text not null,
  rider_phone text not null,
  mobility text,                                   -- ambulatory | walker | wheelchair | powerchair
  memory_loss boolean not null default false,
  pickup text,
  dropoff text,
  ride_date date,
  ride_time time,
  trip_type text,                                  -- round | one | weekly
  contact_name text,
  relationship text,
  email text,
  payment text,
  notes text,                                      -- from the customer
  quoted_price numeric(10,2),                      -- set by dispatch
  driver text,
  vehicle text,
  internal_notes text                              -- dispatch only, never shown to customers
);
create index if not exists bookings_status_idx on bookings (status, created_at desc);
create index if not exists bookings_date_idx on bookings (ride_date);
drop trigger if exists bookings_touch on bookings;
create trigger bookings_touch before update on bookings for each row execute function set_updated_at();

-- Driver and attendant applications from the Careers page.
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new',              -- new | contacted | screening | hired | declined
  name text not null,
  phone text not null,
  email text,
  town text,
  license text,
  years text,
  wheelchair_exp text,
  availability text,
  consent_screening boolean not null default false,
  notes text,
  internal_notes text
);
create index if not exists applications_status_idx on applications (status, created_at desc);
drop trigger if exists applications_touch on applications;
create trigger applications_touch before update on applications for each row execute function set_updated_at();

-- Real customer reviews shown on the homepage. Only published ones appear.
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  role text not null default '',
  quote text not null,
  published boolean not null default false,
  sort integer not null default 100
);

-- Lock everything down. The website and the admin area both reach these tables
-- only through the server using the service-role key, which bypasses RLS.
-- With no policies, the public (anon) key can read and write nothing.
alter table settings     enable row level security;
alter table bookings     enable row level security;
alter table applications enable row level security;
alter table testimonials enable row level security;

-- Data API access. Since 2026, Supabase no longer grants new tables to the API
-- roles automatically, so without these lines even the server's secret key gets
-- "permission denied for table ..." (Postgres error 42501).
-- Only service_role (the server) is granted. anon and authenticated get nothing.
grant usage on schema public to service_role;
grant select, insert, update, delete on table settings, bookings, applications, testimonials to service_role;

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  status text not null default 'active',           -- active | inactive
  wheelchair_trained boolean not null default false,
  vehicle text,                                    -- usual vehicle, e.g. W#6
  license_expires date,
  notes text,                                      -- dispatch only
  application_id uuid references applications(id) on delete set null
);

drop trigger if exists drivers_touch on drivers;
create trigger drivers_touch before update on drivers for each row execute function set_updated_at();

alter table bookings add column if not exists driver_id uuid references drivers(id) on delete set null;
create index if not exists bookings_driver_date on bookings (driver_id, ride_date);

alter table drivers enable row level security;
grant select, insert, update, delete on table drivers to service_role;

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,                               -- unit name dispatch uses, e.g. W#6
  type text,                                        -- wheelchair_van | ramp_minivan | minivan | sedan | suv
  make text, model text, year int,
  plate text, vin text, color text,
  seats int,
  wheelchair_positions int not null default 0,
  status text not null default 'active',            -- active | in_shop | out_of_service | retired
  mileage int not null default 0,                   -- current odometer
  driver_id uuid references drivers(id) on delete set null,
  oil_interval int not null default 5000,           -- miles between oil changes
  inspection_expires date,
  registration_expires date,
  insurance_expires date,
  lift_service_due date,
  notes text
);
drop trigger if exists vehicles_touch on vehicles;
create trigger vehicles_touch before update on vehicles for each row execute function set_updated_at();

create table if not exists vehicle_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  kind text not null,                               -- mileage | oil_change | maintenance | brakes | tires | lift | inspection | repair | fuel | cleaning | incident
  log_date date not null default current_date,
  mileage int,
  cost numeric(10,2),
  vendor text,
  description text,
  next_due_date date,
  next_due_mileage int,
  created_by text
);
create index if not exists vehicle_logs_vehicle on vehicle_logs (vehicle_id, log_date desc);

alter table bookings add column if not exists vehicle_id uuid references vehicles(id) on delete set null;
create index if not exists bookings_vehicle_date on bookings (vehicle_id, ride_date);

alter table vehicles enable row level security;
alter table vehicle_logs enable row level security;
grant select, insert, update, delete on table vehicles, vehicle_logs to service_role;

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

-- GATRA-gap discovery fields (data load lives in gatra-gap-calls.sql)
alter table referral_sources add column if not exists campaign text;
alter table referral_sources add column if not exists gap_answer text;
alter table referral_sources add column if not exists gap_notes text;
