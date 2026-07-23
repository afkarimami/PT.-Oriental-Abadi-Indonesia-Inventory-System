alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.racks enable row level security;

grant select on public.profiles to authenticated;
grant select, insert, update on public.departments to authenticated;
grant select, insert, update on public.categories to authenticated;
grant select, insert, update on public.locations to authenticated;
grant select, insert, update on public.racks to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "departments_authenticated_read" on public.departments;
create policy "departments_authenticated_read"
on public.departments
for select to authenticated
using (true);

drop policy if exists "departments_authenticated_insert" on public.departments;
create policy "departments_authenticated_insert"
on public.departments
for insert to authenticated
with check (true);

drop policy if exists "departments_authenticated_update" on public.departments;
create policy "departments_authenticated_update"
on public.departments
for update to authenticated
using (true)
with check (true);

drop policy if exists "categories_authenticated_read" on public.categories;
create policy "categories_authenticated_read"
on public.categories
for select to authenticated
using (true);

drop policy if exists "categories_authenticated_insert" on public.categories;
create policy "categories_authenticated_insert"
on public.categories
for insert to authenticated
with check (true);

drop policy if exists "categories_authenticated_update" on public.categories;
create policy "categories_authenticated_update"
on public.categories
for update to authenticated
using (true)
with check (true);

drop policy if exists "locations_authenticated_read" on public.locations;
create policy "locations_authenticated_read"
on public.locations
for select to authenticated
using (true);

drop policy if exists "locations_authenticated_insert" on public.locations;
create policy "locations_authenticated_insert"
on public.locations
for insert to authenticated
with check (true);

drop policy if exists "locations_authenticated_update" on public.locations;
create policy "locations_authenticated_update"
on public.locations
for update to authenticated
using (true)
with check (true);

drop policy if exists "racks_authenticated_read" on public.racks;
create policy "racks_authenticated_read"
on public.racks
for select to authenticated
using (true);

drop policy if exists "racks_authenticated_insert" on public.racks;
create policy "racks_authenticated_insert"
on public.racks
for insert to authenticated
with check (true);

drop policy if exists "racks_authenticated_update" on public.racks;
create policy "racks_authenticated_update"
on public.racks
for update to authenticated
using (true)
with check (true);