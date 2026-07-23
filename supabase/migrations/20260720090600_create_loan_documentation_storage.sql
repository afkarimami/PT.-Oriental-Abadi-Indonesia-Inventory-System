insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('loan-documentation', 'loan-documentation', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "loan_documentation_active_user_select" on storage.objects;
create policy "loan_documentation_active_user_select"
on storage.objects for select to authenticated
using (bucket_id = 'loan-documentation' and public.is_active_inventory_user());

drop policy if exists "loan_documentation_active_user_insert" on storage.objects;
create policy "loan_documentation_active_user_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'loan-documentation' and public.is_active_inventory_user());