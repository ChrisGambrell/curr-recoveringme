create table public.group_posts (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    author_id uuid not null references public.profiles on delete cascade,
    group_id uuid not null references public.groups on delete cascade,
    body text not null
);

alter table public.group_posts enable row level security;

create policy "Authed can select own,owner,member of rows."
on public.group_posts for select
to authenticated
using (auth.uid() = author_id or auth.uid() = (select owner_id from public.groups where public.groups.id = group_id) or is_group_member(group_id, auth.uid()));

create policy "Authed can insert their rows."
on public.group_posts for insert
to authenticated
with check (auth.uid() = author_id and (auth.uid() = (select owner_id from public.groups where public.groups.id = group_id) or is_group_member(group_id, auth.uid())));

create policy "Authed can update their rows."
on public.group_posts for update
to authenticated
using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Authed can delete their rows."
on public.group_posts for delete
to authenticated
using (auth.uid() = author_id or auth.uid() = (select owner_id from public.groups where public.groups.id = group_id));

create trigger group_posts_updated
before update on public.group_posts for each row
execute procedure trigger_set_updated_at();
