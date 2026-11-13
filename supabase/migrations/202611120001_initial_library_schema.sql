create table public.books (
  id bigint primary key,
  title text not null,
  author text not null,
  likes integer not null default 0 check (likes >= 0),
  image_url text,
  category text not null,
  date_added timestamptz not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.book_copies (
  id uuid primary key default gen_random_uuid(),
  book_id bigint not null references public.books (id) on delete restrict,
  barcode text unique,
  created_at timestamptz not null default now()
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  copy_id uuid not null references public.book_copies (id) on delete restrict,
  borrowed_at timestamptz not null default now(),
  due_date date not null,
  returned_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index loans_one_active_loan_per_copy
  on public.loans (copy_id)
  where returned_at is null;

create index loans_user_active_idx
  on public.loans (user_id, due_date)
  where returned_at is null;

create table public.loan_reminders (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans (id) on delete cascade,
  reminder_type text not null check (reminder_type in ('two_days_before', 'due_today')),
  sent_at timestamptz not null default now(),
  unique (loan_id, reminder_type)
);

alter table public.books enable row level security;
alter table public.profiles enable row level security;
alter table public.book_copies enable row level security;
alter table public.loans enable row level security;
alter table public.loan_reminders enable row level security;

create policy "Anyone can read books"
  on public.books for select
  using (true);

create policy "Anyone can read copy records"
  on public.book_copies for select
  using (true);

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read their own loans"
  on public.loans for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

insert into public.profiles (id, display_name)
select
  users.id,
  nullif(users.raw_user_meta_data ->> 'display_name', '')
from auth.users as users
on conflict (id) do nothing;

create or replace function public.borrow_book(p_book_id bigint)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_copy_id uuid;
  v_loan_id uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to borrow a book';
  end if;

  select copies.id
    into v_copy_id
    from public.book_copies as copies
   where copies.book_id = p_book_id
     and not exists (
       select 1
         from public.loans as active_loan
        where active_loan.copy_id = copies.id
          and active_loan.returned_at is null
     )
   order by copies.created_at, copies.id
   for update of copies skip locked
   limit 1;

  if v_copy_id is null then
    raise exception 'No copies of this book are currently available';
  end if;

  insert into public.loans (user_id, copy_id, due_date)
  values (
    v_user_id,
    v_copy_id,
    timezone('UTC', now())::date + 14
  )
  returning id into v_loan_id;

  return v_loan_id;
end;
$$;

create or replace function public.return_book(p_loan_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to return a book';
  end if;

  update public.loans
     set returned_at = now()
   where id = p_loan_id
     and user_id = auth.uid()
     and returned_at is null;

  if not found then
    raise exception 'Active loan not found for the signed-in user';
  end if;
end;
$$;

revoke all on function public.create_profile_for_new_user() from public;
revoke all on function public.borrow_book(bigint) from public, anon;
revoke all on function public.return_book(uuid) from public, anon;
grant execute on function public.borrow_book(bigint) to authenticated;
grant execute on function public.return_book(uuid) to authenticated;

grant select on public.books, public.book_copies to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.loans to authenticated;
