create or replace function public.get_book_availability(p_book_id bigint)
returns table (
  available_copies bigint,
  already_borrowed boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*) filter (
      where not exists (
        select 1
          from public.loans as active_loan
         where active_loan.copy_id = copies.id
           and active_loan.returned_at is null
      )
    ),
    exists (
      select 1
        from public.book_copies as user_copy
        join public.loans as user_loan on user_loan.copy_id = user_copy.id
       where user_copy.book_id = p_book_id
         and user_loan.user_id = auth.uid()
         and user_loan.returned_at is null
    )
  from public.book_copies as copies
  where copies.book_id = p_book_id;
$$;

revoke all on function public.get_book_availability(bigint) from public;
grant execute on function public.get_book_availability(bigint) to anon, authenticated;
