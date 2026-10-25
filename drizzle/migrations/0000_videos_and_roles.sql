-- Roles table (separate from profiles per security rules)
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

-- Videos uploaded by the academy admin
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  age_group text not null default '6-10',
  video_url text not null,
  storage_path text,
  summary text not null default '',
  questions jsonb not null default '[]'::jsonb,
  featured_date date,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

grant select on public.videos to anon;
grant select, insert, update, delete on public.videos to authenticated;
grant all on public.videos to service_role;

alter table public.videos enable row level security;

-- Everyone (including visitors) can watch videos
create policy "Anyone can read videos"
  on public.videos for select to anon, authenticated
  using (true);

-- Only admins can add, edit, or feature videos
create policy "Admins can insert videos"
  on public.videos for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update videos"
  on public.videos for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete videos"
  on public.videos for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));