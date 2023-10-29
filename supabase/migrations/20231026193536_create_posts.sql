create table public.posts (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    author_id uuid not null references public.profiles on delete cascade,
    body text not null
);

alter table public.posts enable row level security;

create policy "Authed can select own & friends' rows."
on public.posts for select
to authenticated
using (auth.uid() = author_id or public.is_friend(author_id, auth.uid()));

create policy "Authed can insert their rows."
on public.posts for insert
to authenticated
with check (auth.uid() = author_id);

create policy "Authed can update their rows."
on public.posts for update
to authenticated
using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Authed can delete their rows."
on public.posts for delete
to authenticated
using (auth.uid() = author_id);

create trigger posts_updated
before update on public.posts for each row
execute procedure trigger_set_updated_at();
