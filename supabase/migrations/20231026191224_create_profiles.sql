create table public.profiles (
    id uuid not null primary key references auth.users on delete cascade,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    first_name text not null,
    last_name text not null,
    display_name text not null,
    username text not null unique,
    email text not null unique,
    avatar_url text not null
);

alter table public.profiles enable row level security;

create policy "Authed can select all rows."
on public.profiles for select
to authenticated
using (true);

create policy "Authed can update their row."
on public.profiles for update
to authenticated
using (auth.uid() = id) with check (auth.uid() = id);

create trigger profiles_updated
before update on public.profiles for each row
execute procedure trigger_set_updated_at();

create function public.handle_new_user_profile()
returns trigger
security definer set search_path = public as $$
begin
    insert into public.profiles (id, created_at, first_name, last_name, display_name, username, email, avatar_url) values (
        new.id,
        case
            when new.raw_user_meta_data->>'created_at' is not null
            then cast(new.raw_user_meta_data->>'created_at' as timestamptz)
            else timezone('utc'::text, now())
        end,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'display_name',
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'email',
        case
            when new.raw_user_meta_data->>'avatar_url' is not null
            then new.raw_user_meta_data->>'avatar_url'
            else concat(
                'https://api.dicebear.com/7.x/initials/png?seed=',
                left(new.raw_user_meta_data->>'first_name', 1),
                left(new.raw_user_meta_data->>'last_name', 1),
                '-',
                new.id
            )
        end
    );

    return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user_profile();
