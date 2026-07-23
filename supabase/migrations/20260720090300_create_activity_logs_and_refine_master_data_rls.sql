create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('CREATE', 'UPDATE', 'ACTIVATE', 'DEACTIVATE')),
  entity_type text not null check (entity_type in ('DEPARTMENT', 'CATEGORY', 'LOCATION', 'RACK')),
  entity_id uuid not null,
  description text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_entity_idx on public.activity_logs(entity_type, entity_id);
create index activity_logs_user_id_idx on public.activity_logs(user_id);

create function public.is_active_inventory_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and is_active = true
  );
$$;

revoke all on function public.is_active_inventory_user() from public;
grant execute on function public.is_active_inventory_user() to authenticated;

alter table public.activity_logs enable row level security;
grant insert on public.activity_logs to authenticated;

create policy "activity_logs_authenticated_insert"
on public.activity_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id and public.is_active_inventory_user());

drop policy if exists "departments_authenticated_insert" on public.departments;
drop policy if exists "departments_authenticated_update" on public.departments;
drop policy if exists "categories_authenticated_insert" on public.categories;
drop policy if exists "categories_authenticated_update" on public.categories;
drop policy if exists "locations_authenticated_insert" on public.locations;
drop policy if exists "locations_authenticated_update" on public.locations;
drop policy if exists "racks_authenticated_insert" on public.racks;
drop policy if exists "racks_authenticated_update" on public.racks;

create policy "departments_active_user_insert"
on public.departments
for insert to authenticated
with check (public.is_active_inventory_user());

create policy "departments_active_user_update"
on public.departments
for update to authenticated
using (true)
with check (public.is_active_inventory_user());

create policy "categories_active_user_insert"
on public.categories
for insert to authenticated
with check (public.is_active_inventory_user());

create policy "categories_active_user_update"
on public.categories
for update to authenticated
using (true)
with check (public.is_active_inventory_user());

create policy "locations_active_user_insert"
on public.locations
for insert to authenticated
with check (public.is_active_inventory_user());

create policy "locations_active_user_update"
on public.locations
for update to authenticated
using (true)
with check (public.is_active_inventory_user());

create policy "racks_active_user_insert"
on public.racks
for insert to authenticated
with check (public.is_active_inventory_user());

create policy "racks_active_user_update"
on public.racks
for update to authenticated
using (true)
with check (public.is_active_inventory_user());

create function public.log_master_data_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  log_action text;
  log_entity_type text;
  record_code text;
begin
  if auth.uid() is null then
    return coalesce(new, old);
  end if;

  log_entity_type := case tg_table_name
    when 'departments' then 'DEPARTMENT'
    when 'categories' then 'CATEGORY'
    when 'locations' then 'LOCATION'
    when 'racks' then 'RACK'
  end;

  if tg_op = 'INSERT' then
    log_action := 'CREATE';
    record_code := new.code;
    insert into public.activity_logs (user_id, action, entity_type, entity_id, description, new_data)
    values (auth.uid(), log_action, log_entity_type, new.id, format('%s %s dibuat.', log_entity_type, record_code), to_jsonb(new));
    return new;
  end if;

  if old.is_active = true and new.is_active = false then
    log_action := 'DEACTIVATE';
  elsif old.is_active = false and new.is_active = true then
    log_action := 'ACTIVATE';
  else
    log_action := 'UPDATE';
  end if;

  record_code := new.code;
  insert into public.activity_logs (user_id, action, entity_type, entity_id, description, old_data, new_data)
  values (auth.uid(), log_action, log_entity_type, new.id, format('%s %s diperbarui.', log_entity_type, record_code), to_jsonb(old), to_jsonb(new));
  return new;
end;
$$;

create trigger departments_activity_log after insert or update on public.departments for each row execute function public.log_master_data_activity();
create trigger categories_activity_log after insert or update on public.categories for each row execute function public.log_master_data_activity();
create trigger locations_activity_log after insert or update on public.locations for each row execute function public.log_master_data_activity();
create trigger racks_activity_log after insert or update on public.racks for each row execute function public.log_master_data_activity();