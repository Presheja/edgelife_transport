-- EdgeLIFE: driver roster + assigning drivers to bookings.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.

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
