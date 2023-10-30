create table public.messages (
    id uuid not null default uuid_generate_v4() primary key,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    conversation_id uuid not null references public.conversations on delete cascade,
    sender_id uuid not null references public.profiles on delete cascade,
    body text not null
);

alter table public.messages enable row level security;

create policy "Authed can select own,member of rows."
on public.messages for select
to authenticated
using (auth.uid() = sender_id or is_conversation_member(conversation_id, auth.uid()));

create policy "Authed can insert their rows."
on public.messages for insert
to authenticated
with check (auth.uid() = sender_id and is_conversation_member(conversation_id, auth.uid()));

create policy "Authed can update their rows."
on public.messages for update
to authenticated
using (auth.uid() = sender_id) with check (auth.uid() = sender_id);

create policy "Authed can delete their rows."
on public.messages for delete
to authenticated
using (auth.uid() = sender_id);

create trigger messages_updated
before update on public.messages for each row
execute procedure trigger_set_updated_at();
