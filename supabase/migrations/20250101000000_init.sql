-- FKG Schedule Race - initial schema

create extension if not exists "pgcrypto";

create type "ScheduleStatusEnum" as enum ('ACTIVE', 'CLOSED');
create type "ScheduleTypeEnum" as enum ('PROSTHODONTIST', 'MAKSILOFASIAL');

create or replace function set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

create table "Schedule" (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "deletedAt" timestamptz,
  title text not null,
  date timestamptz not null default now(),
  "desc" text,
  status "ScheduleStatusEnum",
  open timestamptz not null default now(),
  closed timestamptz not null default now(),
  type "ScheduleTypeEnum" not null
);

create table "Couple" (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "deletedAt" timestamptz
);

create table "Category" (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "deletedAt" timestamptz,
  title text not null,
  instructor text not null,
  slot integer not null,
  "desc" text,
  "scheduleId" text not null references "Schedule"(id) on delete cascade on update cascade
);

create table "People" (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "deletedAt" timestamptz,
  name text not null,
  notes text,
  "categoryId" text not null references "Category"(id) on delete cascade on update cascade,
  "coupleId" text references "Couple"(id) on delete cascade on update cascade
);

-- Schedule: admin list (all types, newest first)
create index "Schedule_createdAt_idx"
  on "Schedule" ("createdAt" desc);

-- Schedule: filter by field type, newest first (GET /api/schedule?type=...)
create index "Schedule_type_createdAt_idx"
  on "Schedule" (type, "createdAt" desc);

-- Schedule: filter by manual status, newest first (ACTIVE / CLOSED / automatic=null)
create index "Schedule_status_createdAt_idx"
  on "Schedule" (status, "createdAt" desc);

-- Schedule: filter by type + status together (admin combined filters)
create index "Schedule_type_status_createdAt_idx"
  on "Schedule" (type, status, "createdAt" desc);

create index "Category_scheduleId_createdAt_idx"
  on "Category" ("scheduleId", "createdAt");

create index "People_categoryId_createdAt_idx"
  on "People" ("categoryId", "createdAt");

create index "People_categoryId_active_createdAt_idx"
  on "People" ("categoryId", "createdAt")
  where "deletedAt" is null;

create index "People_coupleId_idx"
  on "People" ("coupleId")
  where "coupleId" is not null;

create trigger set_schedule_updated_at
  before update on "Schedule"
  for each row execute function set_updated_at();

create trigger set_couple_updated_at
  before update on "Couple"
  for each row execute function set_updated_at();

create trigger set_category_updated_at
  before update on "Category"
  for each row execute function set_updated_at();

create trigger set_people_updated_at
  before update on "People"
  for each row execute function set_updated_at();
