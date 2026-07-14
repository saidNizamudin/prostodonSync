create table "Instructor" (
  id text primary key default gen_random_uuid()::text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "deletedAt" timestamptz,
  name text not null,
  type "ScheduleTypeEnum" not null
);

create unique index "Instructor_name_type_unique"
  on "Instructor" (name, type)
  where "deletedAt" is null;

create index "Instructor_type_createdAt_idx"
  on "Instructor" (type, "createdAt" desc);

create trigger set_instructor_updated_at
  before update on "Instructor"
  for each row execute function set_updated_at();
