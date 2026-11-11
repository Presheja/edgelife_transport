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
