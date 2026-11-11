-- EdgeLIFE: fleet (vehicles), maintenance/mileage logs, and vehicles on bookings.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.

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
