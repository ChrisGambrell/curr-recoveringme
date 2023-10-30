create table public.conversations (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    -- TODO: Remove this wp_id
    wp_id int8 not null unique
);

create table public.conversation_members (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    conversation_id uuid not null references public.conversations on delete cascade,
    member_id uuid not null references public.profiles on delete cascade
);

create function public.is_conversation_member(conversation_id uuid, _user_id uuid)
returns bool
security definer set search_path = public as $$
select exists (
    select 1
    from public.conversation_members
    where conversation_id = conversation_id and member_id = _user_id
);
$$ language sql;

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;

create policy "Authed can select member of rows."
on public.conversations for select
to authenticated
using (is_conversation_member(id, auth.uid()));

create policy "Authed can select from conversation rows."
on public.conversation_members for select
to authenticated
using (conversation_id in (select id from public.conversations));

create policy "Authed can insert rows."
on public.conversations for insert
to authenticated
with check (true);

create policy "Authed can insert own,member of rows."
on public.conversation_members for insert
to authenticated
with check (auth.uid() = member_id or is_conversation_member(conversation_id, auth.uid()));

-- TODO: Should anyone be able to delete conversations?
-- create policy "Authed can delete own group rows."
-- on public.conversations for delete
-- using (auth.uid() = owner_id);

create policy "Authed can delete own,member of rows."
on public.conversation_members for delete
to authenticated
using (auth.uid() = member_id or is_conversation_member(conversation_id, auth.uid()));

create trigger conversations_updated
before update on public.conversations for each row
execute procedure trigger_set_updated_at();

create trigger conversation_members_updated
before update on public.conversation_members for each row
execute procedure trigger_set_updated_at();
