create type group_status as enum ('hidden', 'private', 'public');

create table public.groups (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    owner_id uuid not null references public.profiles on delete cascade,
    name text not null,
    slug text not null unique,
    description text default null,
    status group_status not null default 'public'
);

create table public.group_members (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    group_id uuid not null references public.groups on delete cascade,
    member_id uuid not null references public.profiles on delete cascade
);

create function public.is_group_member(_group_id uuid, _user_id uuid)
returns bool
security definer set search_path = public as $$
select exists (
    select 1
    from public.group_members
    where group_id = _group_id and member_id = _user_id
);
$$ language sql;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create policy "Authed can select own,public,member of rows."
on public.groups for select
to authenticated
using (auth.uid() = owner_id or status = 'public' or is_group_member(id, auth.uid()));

create policy "Authed can select from group rows."
on public.group_members for select
to authenticated
using (group_id in (select id from public.groups));

create policy "Authed can insert own group rows."
on public.groups for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Authed can insert own,owner of rows."
on public.group_members for insert
to authenticated
with check (auth.uid() = member_id or auth.uid() = (select owner_id from public.groups where public.groups.id = group_id));

create policy "Authed can update own group rows."
on public.groups for update
using (auth.uid() = owner_id);

create policy "Authed can delete own group rows."
on public.groups for delete
using (auth.uid() = owner_id);

create policy "Authed can delete own & owner of rows."
on public.group_members for delete
to authenticated
using (auth.uid() = member_id or auth.uid() = (select owner_id from public.groups where public.groups.id = group_id));

create trigger groups_updated
before update on public.groups for each row
execute procedure trigger_set_updated_at();

create trigger group_members_updated
before update on public.group_members for each row
execute procedure trigger_set_updated_at();
