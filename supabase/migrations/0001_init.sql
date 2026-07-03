create extension if not exists pgcrypto;  -- required for gen_random_uuid()

create type subject_type as enum ('jj_partner', 'ngl');
create type material_genre as enum ('interview','article','website','report','social','other');

create table subjects (
  id uuid primary key default gen_random_uuid(),
  ashoka_internal_id text,
  name text not null,
  type subject_type not null,
  parent_org_id uuid references subjects(id),  -- NGL -> JJ Partner
  created_at timestamptz default now(),
  created_by text,
  -- Decision #1: NGL must nest under a JJ Partner; JJ Partners have no parent.
  constraint ngl_requires_parent check (
    (type = 'ngl' and parent_org_id is not null) or
    (type = 'jj_partner' and parent_org_id is null)
  )
);

create table entries (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  entry_date date not null,            -- analysis date, NOT source date
  material_text text not null,
  material_source_url text,
  genre material_genre not null,
  ashokan_name text not null,
  contextual_notes text,               -- metadata, not scored
  created_at timestamptz default now()
);

create table analyses (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries(id) on delete cascade,
  enactment_score int not null,        -- 0..100
  d1 int not null, d2 int not null, d3 int not null, d4 int not null, d5 int not null,  -- 0..4 each
  each_orientation text not null,
  lens_a_tag text,
  lens_b_flag text,
  feedback_card jsonb not null,
  model_version text not null,
  created_at timestamptz default now()
);

-- Defense in depth: only the server-side secret key touches these tables,
-- but RLS with zero policies means a future accidental use of the
-- publishable key from the browser can't read or write anything.
alter table subjects enable row level security;
alter table entries enable row level security;
alter table analyses enable row level security;

create index on entries (subject_id, entry_date);
create index on analyses (entry_id);
