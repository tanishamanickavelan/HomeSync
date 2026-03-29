-- ============================================================
-- MaBot Supabase Schema
-- Paste this entire file into: Supabase → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── FAMILIES ────────────────────────────────────────────────
create table if not exists families (
  id          uuid primary key default uuid_generate_v4(),
  family_name text not null,
  invite_code text unique not null,
  city        text,
  admin_id    uuid,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── USERS ───────────────────────────────────────────────────
create table if not exists users (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text unique not null,
  password    text not null,
  family_id   uuid references families(id) on delete set null,
  role        text default 'member' check (role in ('admin','member')),
  phone       text,
  preferences jsonb default '{"notifications":true,"darkMode":false}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Add admin foreign key after users table exists
alter table families
  add column if not exists admin_id uuid references users(id) on delete set null;

-- ─── TASKS ───────────────────────────────────────────────────
create table if not exists tasks (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  assigned_to   uuid references users(id) on delete set null,
  created_by    uuid references users(id) on delete set null,
  family_id     uuid references families(id) on delete cascade,
  due_date      timestamptz,
  priority      text default 'medium' check (priority in ('low','medium','high','urgent')),
  status        text default 'pending' check (status in ('pending','in_progress','completed')),
  tags          text[] default '{}',
  completed_at  timestamptz,
  reminder_sent boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── GROCERIES ───────────────────────────────────────────────
create table if not exists groceries (
  id                   uuid primary key default uuid_generate_v4(),
  item_name            text not null,
  quantity             numeric default 1,
  unit                 text default 'pcs',
  category             text default 'other' check (category in ('dairy','vegetables','fruits','grains','snacks','beverages','meat','household_items','personal_care','other')),
  purchased            boolean default false,
  purchased_at         timestamptz,
  low_stock_threshold  numeric default 1,
  notes                text,
  added_by             uuid references users(id) on delete set null,
  family_id            uuid references families(id) on delete cascade,
  reminder_sent        boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── BILLS ───────────────────────────────────────────────────
create table if not exists bills (
  id               uuid primary key default uuid_generate_v4(),
  bill_name        text not null,
  amount           numeric not null,
  currency         text default 'INR',
  due_date         timestamptz not null,
  status           text default 'unpaid' check (status in ('unpaid','paid','overdue')),
  category         text default 'other' check (category in ('electricity','water','internet','phone','gas','rent','insurance','emi','subscription','other')),
  paid_at          timestamptz,
  paid_by          uuid references users(id) on delete set null,
  recurring        boolean default false,
  recurring_cycle  text check (recurring_cycle in ('monthly','quarterly','yearly') or recurring_cycle is null),
  notes            text,
  reminder_sent    boolean default false,
  created_by       uuid references users(id) on delete set null,
  family_id        uuid references families(id) on delete cascade,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─── SERVICES ────────────────────────────────────────────────
create table if not exists services (
  id               uuid primary key default uuid_generate_v4(),
  service_type     text not null check (service_type in ('plumber','electrician','maid','laundry','cleaning','carpenter','pest_control','appliance_repair','other')),
  provider_name    text,
  date             timestamptz not null,
  time             text not null,
  status           text default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled')),
  notes            text,
  estimated_cost   numeric,
  actual_cost      numeric,
  rating           int check (rating between 1 and 5),
  booked_by        uuid references users(id) on delete set null,
  family_id        uuid references families(id) on delete cascade,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  message     text not null,
  type        text not null check (type in ('task','grocery','bill','service','system','family')),
  severity    text default 'info' check (severity in ('info','warning','urgent','success')),
  user_id     uuid references users(id) on delete cascade,
  family_id   uuid references families(id) on delete cascade,
  read_status boolean default false,
  read_at     timestamptz,
  ref_id      uuid,
  action_url  text,
  created_at  timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────
create index if not exists idx_tasks_family     on tasks(family_id);
create index if not exists idx_tasks_status     on tasks(status);
create index if not exists idx_tasks_due        on tasks(due_date);
create index if not exists idx_groceries_family on groceries(family_id);
create index if not exists idx_bills_family     on bills(family_id);
create index if not exists idx_bills_due        on bills(due_date);
create index if not exists idx_notifs_user      on notifications(user_id);
create index if not exists idx_notifs_read      on notifications(read_status);

-- ─── DISABLE ROW LEVEL SECURITY (backend uses service key) ───
-- We use JWT auth in our Express backend, not Supabase Auth
alter table families      disable row level security;
alter table users         disable row level security;
alter table tasks         disable row level security;
alter table groceries     disable row level security;
alter table bills         disable row level security;
alter table services      disable row level security;
alter table notifications disable row level security;

-- Done! ✅
select 'MaBot schema created successfully!' as status;
