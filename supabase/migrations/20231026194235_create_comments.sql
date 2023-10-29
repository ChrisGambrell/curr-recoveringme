create table public.comments (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    author_id uuid not null references public.profiles on delete cascade,
    post_id uuid not null references public.posts on delete cascade,
    body text not null
);

alter table public.comments enable row level security;

create policy "Authed can select allowed posts rows."
on public.comments for select
to authenticated
using (post_id in (select id from public.posts));

create policy "Authed can insert their allowed posts rows."
on public.comments for insert
to authenticated
with check (auth.uid() = author_id and post_id in (select id from public.posts));

create policy "Authed can update their rows."
on public.comments for update
to authenticated
using (auth.uid() = author_id) with check (auth.uid() = author_id and post_id in (select id from public.posts));

create policy "Authed can delete their or their post's rows."
on public.comments for delete
to authenticated
using (auth.uid() = author_id or auth.uid() = (select author_id from public.posts where id = post_id));

create trigger comments_updated
before update on public.comments for each row
execute procedure trigger_set_updated_at();
