-- Initial schema for Structura: structural analysis web application

-- Users (extends Supabase Auth with app-specific fields)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Project members (roles: owner, editor, viewer)
create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

-- Model snapshots (versioned saves)
create table public.model_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label text default '',
  model_json jsonb not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Analysis results (linked to snapshots)
create table public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.model_snapshots(id) on delete cascade,
  results_json jsonb not null,
  analysis_type text not null default 'linear-static',
  created_at timestamptz not null default now()
);

-- Session locks (concurrent edit protection)
create table public.session_locks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade unique,
  user_id uuid not null references public.profiles(id),
  locked_at timestamptz not null default now(),
  last_heartbeat timestamptz not null default now()
);

-- Indexes
create index idx_session_locks_project on public.session_locks(project_id);
create index idx_model_snapshots_project on public.model_snapshots(project_id, created_at desc);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.model_snapshots enable row level security;
alter table public.analysis_results enable row level security;
alter table public.session_locks enable row level security;

-- RLS policies
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Members can read projects" on public.projects
  for select using (
    id in (select project_id from public.project_members where user_id = auth.uid())
  );

create policy "Owners can update projects" on public.projects
  for update using (owner_id = auth.uid());

create policy "Owners can delete projects" on public.projects
  for delete using (owner_id = auth.uid());

-- Function to auto-expire stale session locks (5 min TTL)
create or replace function public.cleanup_stale_locks()
returns void as $$
begin
  delete from public.session_locks
  where last_heartbeat < now() - interval '5 minutes';
end;
$$ language plpgsql security definer;
