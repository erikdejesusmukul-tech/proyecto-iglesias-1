-- Public church directory: visitors can read verified, non-deleted churches.
-- Keep anonymous reads limited to directory fields.

drop policy if exists "Anyone can read verified churches" on public.churches;
create policy "Anyone can read verified churches"
on public.churches
for select
to anon, authenticated
using (verification_status = 'verified' and deleted_at is null);

revoke select on public.churches from anon, authenticated;
grant select (id, name, verification_status, deleted_at) on public.churches to anon;
grant select (id, name, verification_status, deleted_at, legal_registration_number)
  on public.churches to authenticated;

-- The settings page's update policy is still restricted to its church admin.
grant update (name, legal_registration_number) on public.churches to authenticated;
