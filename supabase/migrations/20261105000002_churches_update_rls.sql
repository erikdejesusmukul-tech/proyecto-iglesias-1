-- Allow only a church's own admin to update its basic institutional identity.

drop policy if exists "Church admins can update their church identity" on public.churches;
create policy "Church admins can update their church identity"
on public.churches
for update
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.deleted_at is null
      and p.church_id = churches.id
      and p.role = 'admin'
  )
)
with check (
  deleted_at is null
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.deleted_at is null
      and p.church_id = churches.id
      and p.role = 'admin'
  )
);

-- Keep client updates limited to the fields exposed in the settings form.
grant update (name, legal_registration_number) on public.churches to authenticated;
