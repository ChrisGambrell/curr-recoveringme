create table public.friends (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    friend_id uuid not null references public.profiles on delete cascade,
    initiator_id uuid not null references public.profiles on delete cascade,
    constraint friendship_unique unique (friend_id, initiator_id)
);

alter table public.friends enable row level security;

create policy "Authed can select all rows."
on public.friends for select
to authenticated
using (true);

create policy "Authed can insert initiated rows."
on public.friends for insert
to authenticated
with check (auth.uid() = initiator_id);

create policy "Authed can delete initiated rows."
on public.friends for delete
to authenticated
using (auth.uid() = initiator_id);

create function public.is_friend(_friend_id uuid, _initiator_id uuid)
returns bool
security definer set search_path = public as $$
select exists (
    select 1
    from public.friends
    where friend_id = _friend_id and initiator_id = _initiator_id
);
$$ language sql;
