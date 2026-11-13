alter table public.loan_reminders
  alter column sent_at drop default,
  alter column sent_at drop not null,
  add column status text not null default 'sent'
    check (status in ('pending', 'processing', 'sent', 'failed')),
  add column attempt_count integer not null default 0
    check (attempt_count >= 0),
  add column locked_until timestamptz,
  add column last_error text,
  add column updated_at timestamptz not null default now();

update public.loans
   set due_date = (borrowed_at at time zone 'Africa/Nairobi')::date + 14
 where returned_at is null;

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
    (now() at time zone 'Africa/Nairobi')::date + 14
  )
  returning id into v_loan_id;

  return v_loan_id;
end;
$$;

create or replace function public.claim_loan_reminder(
  p_loan_id uuid,
  p_reminder_type text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claimed boolean;
begin
  if p_reminder_type not in ('two_days_before', 'due_today') then
    raise exception 'Invalid loan reminder type';
  end if;

  insert into public.loan_reminders (
    loan_id,
    reminder_type,
    status,
    attempt_count,
    locked_until,
    sent_at,
    last_error,
    updated_at
  )
  select
    p_loan_id,
    p_reminder_type,
    'processing',
    1,
    now() + interval '10 minutes',
    null,
    null,
    now()
  from public.loans as loan
  where loan.id = p_loan_id
    and loan.returned_at is null
    and (
      (
        p_reminder_type = 'two_days_before'
        and loan.due_date > (now() at time zone 'Africa/Nairobi')::date
        and loan.due_date <= (now() at time zone 'Africa/Nairobi')::date + 2
      )
      or (
        p_reminder_type = 'due_today'
        and loan.due_date <= (now() at time zone 'Africa/Nairobi')::date
      )
    )
  on conflict (loan_id, reminder_type) do update
    set status = 'processing',
        attempt_count = public.loan_reminders.attempt_count + 1,
        locked_until = now() + interval '10 minutes',
        last_error = null,
        updated_at = now()
    where public.loan_reminders.status in ('pending', 'failed')
       or (
         public.loan_reminders.status = 'processing'
         and public.loan_reminders.locked_until < now()
       )
  returning true into v_claimed;

  return coalesce(v_claimed, false);
end;
$$;

create or replace function public.mark_loan_reminder_sent(
  p_loan_id uuid,
  p_reminder_type text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.loan_reminders
     set status = 'sent',
         sent_at = now(),
         locked_until = null,
         last_error = null,
         updated_at = now()
   where loan_id = p_loan_id
     and reminder_type = p_reminder_type
     and status = 'processing';

  if not found then
    raise exception 'Loan reminder was not in processing state';
  end if;
end;
$$;

create or replace function public.mark_loan_reminder_failed(
  p_loan_id uuid,
  p_reminder_type text,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.loan_reminders
     set status = 'failed',
         locked_until = null,
         last_error = left(p_error, 1000),
         updated_at = now()
   where loan_id = p_loan_id
     and reminder_type = p_reminder_type
     and status = 'processing';

  if not found then
    raise exception 'Loan reminder was not in processing state';
  end if;
end;
$$;

revoke all on function public.claim_loan_reminder(uuid, text) from public, anon, authenticated;
revoke all on function public.mark_loan_reminder_sent(uuid, text) from public, anon, authenticated;
revoke all on function public.mark_loan_reminder_failed(uuid, text, text) from public, anon, authenticated;
grant execute on function public.claim_loan_reminder(uuid, text) to service_role;
grant execute on function public.mark_loan_reminder_sent(uuid, text) to service_role;
grant execute on function public.mark_loan_reminder_failed(uuid, text, text) to service_role;
