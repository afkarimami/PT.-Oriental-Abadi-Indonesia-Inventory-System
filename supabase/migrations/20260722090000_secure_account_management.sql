-- Account management: no public sign-up, roles are enforced by the database.
create or replace function public.is_inventory_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active = true
      and role in ('super_admin', 'inventory_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active = true
      and role = 'super_admin'
  );
$$;

grant execute on function public.is_inventory_manager() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

-- Promote the first existing active account only when the project has no Super Admin yet.
update public.profiles
set role = 'super_admin'
where id = (
  select id from public.profiles
  where is_active = true
  order by created_at asc
  limit 1
)
and not exists (
  select 1 from public.profiles
  where role = 'super_admin' and is_active = true
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, is_active)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), nullif(trim(new.raw_user_meta_data ->> 'name'), ''), nullif(split_part(new.email, '@', 1), ''), 'Pengguna'),
    'viewer',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Viewer can read data but cannot modify operational data directly.
drop policy if exists "inventory_items_active_user_insert" on public.inventory_items;
create policy "inventory_items_active_user_insert" on public.inventory_items for insert to authenticated with check (public.is_inventory_manager());
drop policy if exists "inventory_items_active_user_update" on public.inventory_items;
create policy "inventory_items_active_user_update" on public.inventory_items for update to authenticated using (public.is_inventory_manager()) with check (public.is_inventory_manager());

drop policy if exists "racks_active_user_insert" on public.racks;
create policy "racks_active_user_insert" on public.racks for insert to authenticated with check (public.is_inventory_manager());
drop policy if exists "racks_active_user_update" on public.racks;
create policy "racks_active_user_update" on public.racks for update to authenticated using (public.is_inventory_manager()) with check (public.is_inventory_manager());

drop policy if exists "departments_authenticated_insert" on public.departments;
create policy "departments_authenticated_insert" on public.departments for insert to authenticated with check (public.is_inventory_manager());
drop policy if exists "departments_authenticated_update" on public.departments;
create policy "departments_authenticated_update" on public.departments for update to authenticated using (public.is_inventory_manager()) with check (public.is_inventory_manager());
drop policy if exists "categories_authenticated_insert" on public.categories;
create policy "categories_authenticated_insert" on public.categories for insert to authenticated with check (public.is_inventory_manager());
drop policy if exists "categories_authenticated_update" on public.categories;
create policy "categories_authenticated_update" on public.categories for update to authenticated using (public.is_inventory_manager()) with check (public.is_inventory_manager());
drop policy if exists "locations_authenticated_insert" on public.locations;
create policy "locations_authenticated_insert" on public.locations for insert to authenticated with check (public.is_inventory_manager());
drop policy if exists "locations_authenticated_update" on public.locations;
create policy "locations_authenticated_update" on public.locations for update to authenticated using (public.is_inventory_manager()) with check (public.is_inventory_manager());

create or replace function public.create_loan(
  p_borrower_name text,
  p_borrower_phone text,
  p_borrower_organization text,
  p_purpose text,
  p_expected_return_on date,
  p_notes text,
  p_documentation_path text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  loan_id uuid;
  loan_code text;
  item_record record;
  available_quantity integer;
begin
  if not public.is_inventory_manager() then
    raise exception 'Akun Anda tidak memiliki akses untuk mencatat peminjaman.';
  end if;
  if nullif(trim(p_borrower_name), '') is null or nullif(trim(p_borrower_phone), '') is null or nullif(trim(p_purpose), '') is null then
    raise exception 'Nama peminjam, nomor HP, dan keperluan wajib diisi.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Pilih minimal satu alat untuk dipinjam.';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as items(inventory_item_id uuid, quantity integer)
    group by inventory_item_id
    having count(*) > 1
  ) then
    raise exception 'Satu alat hanya boleh dipilih sekali dalam peminjaman.';
  end if;

  loan_code := format('PJM-%s-%s', to_char(current_date, 'YYYYMMDD'), lpad(nextval('public.loan_code_sequence')::text, 5, '0'));
  insert into public.loans (code, borrower_name, borrower_phone, borrower_organization, purpose, expected_return_on, notes, documentation_path, created_by)
  values (loan_code, trim(p_borrower_name), trim(p_borrower_phone), nullif(trim(p_borrower_organization), ''), trim(p_purpose), p_expected_return_on, nullif(trim(p_notes), ''), nullif(trim(p_documentation_path), ''), auth.uid())
  returning id into loan_id;

  for item_record in
    select inventory_item_id, quantity
    from jsonb_to_recordset(p_items) as items(inventory_item_id uuid, quantity integer)
  loop
    if item_record.inventory_item_id is null or item_record.quantity is null or item_record.quantity <= 0 then
      raise exception 'Data alat peminjaman tidak valid.';
    end if;

    select current_quantity into available_quantity
    from public.inventory_items
    where id = item_record.inventory_item_id and is_active = true and item_type = 'inventory'
    for update;

    if not found then
      raise exception 'Alat yang dipilih tidak tersedia untuk dipinjam.';
    end if;
    if available_quantity is null or available_quantity < item_record.quantity then
      raise exception 'Stok alat tidak mencukupi untuk peminjaman ini.';
    end if;

    update public.inventory_items
    set current_quantity = current_quantity - item_record.quantity
    where id = item_record.inventory_item_id;

    insert into public.loan_items (loan_id, inventory_item_id, quantity_borrowed)
    values (loan_id, item_record.inventory_item_id, item_record.quantity);
  end loop;

  return loan_id;
end;
$$;

create or replace function public.return_loan_item(
  p_loan_item_id uuid,
  p_quantity_good integer,
  p_quantity_damaged integer,
  p_quantity_lost integer,
  p_notes text,
  p_documentation_path text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  loan_item_record public.loan_items%rowtype;
  remaining_quantity integer;
begin
  if not public.is_inventory_manager() then
    raise exception 'Akun Anda tidak memiliki akses untuk mencatat pengembalian.';
  end if;
  if coalesce(p_quantity_good, 0) < 0 or coalesce(p_quantity_damaged, 0) < 0 or coalesce(p_quantity_lost, 0) < 0 or coalesce(p_quantity_good, 0) + coalesce(p_quantity_damaged, 0) + coalesce(p_quantity_lost, 0) = 0 then
    raise exception 'Masukkan jumlah alat yang dikembalikan.';
  end if;

  select * into loan_item_record
  from public.loan_items
  where id = p_loan_item_id
  for update;

  if not found then
    raise exception 'Detail peminjaman tidak ditemukan.';
  end if;

  remaining_quantity := loan_item_record.quantity_borrowed - loan_item_record.quantity_returned - loan_item_record.quantity_damaged - loan_item_record.quantity_lost;
  if coalesce(p_quantity_good, 0) + coalesce(p_quantity_damaged, 0) + coalesce(p_quantity_lost, 0) > remaining_quantity then
    raise exception 'Jumlah pengembalian melebihi alat yang masih dipinjam.';
  end if;

  perform 1 from public.inventory_items where id = loan_item_record.inventory_item_id for update;

  update public.loan_items
  set
    quantity_returned = quantity_returned + coalesce(p_quantity_good, 0),
    quantity_damaged = quantity_damaged + coalesce(p_quantity_damaged, 0),
    quantity_lost = quantity_lost + coalesce(p_quantity_lost, 0)
  where id = p_loan_item_id;

  if coalesce(p_quantity_good, 0) > 0 then
    update public.inventory_items
    set current_quantity = coalesce(current_quantity, 0) + p_quantity_good
    where id = loan_item_record.inventory_item_id;
  end if;

  insert into public.loan_item_returns (loan_item_id, quantity_good, quantity_damaged, quantity_lost, notes, documentation_path, recorded_by)
  values (p_loan_item_id, coalesce(p_quantity_good, 0), coalesce(p_quantity_damaged, 0), coalesce(p_quantity_lost, 0), nullif(trim(p_notes), ''), nullif(trim(p_documentation_path), ''), auth.uid());

  update public.loans
  set
    status = case when exists (
      select 1 from public.loan_items
      where loan_id = loan_item_record.loan_id
        and quantity_returned + quantity_damaged + quantity_lost < quantity_borrowed
    ) then 'active' else 'closed' end,
    closed_at = case when exists (
      select 1 from public.loan_items
      where loan_id = loan_item_record.loan_id
        and quantity_returned + quantity_damaged + quantity_lost < quantity_borrowed
    ) then null else now() end
  where id = loan_item_record.loan_id;
end;
$$;

revoke all on function public.create_loan(text, text, text, text, date, text, text, jsonb) from public;
revoke all on function public.return_loan_item(uuid, integer, integer, integer, text, text) from public;
grant execute on function public.create_loan(text, text, text, text, date, text, text, jsonb) to authenticated;
grant execute on function public.return_loan_item(uuid, integer, integer, integer, text, text) to authenticated;

create or replace function public.receive_stock(
  p_mode text,
  p_inventory_item_id uuid,
  p_rack_id uuid,
  p_code text,
  p_name text,
  p_item_type text,
  p_quantity integer,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.inventory_items%rowtype;
  item_id uuid;
  item_code text;
  quantity_before integer;
  quantity_after integer;
begin
  if not public.is_inventory_manager() then
    raise exception 'Akun Anda tidak memiliki akses untuk mencatat barang masuk.';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Jumlah barang masuk harus lebih dari nol.';
  end if;

  if p_mode = 'existing' then
    select * into target_item
    from public.inventory_items
    where id = p_inventory_item_id and is_active = true
    for update;

    if not found then
      raise exception 'Barang yang dipilih tidak tersedia.';
    end if;

    quantity_before := coalesce(target_item.current_quantity, 0);
    quantity_after := quantity_before + p_quantity;

    update public.inventory_items
    set
      added_quantity = coalesce(added_quantity, 0) + p_quantity,
      current_quantity = quantity_after,
      source_note = coalesce(nullif(trim(p_notes), ''), source_note)
    where id = target_item.id;

    item_id := target_item.id;
  elsif p_mode = 'new' then
    if p_rack_id is null or nullif(trim(p_name), '') is null then
      raise exception 'Nama barang dan rak wajib diisi untuk barang baru.';
    end if;
    if p_item_type not in ('inventory', 'consumable') then
      raise exception 'Jenis barang baru tidak valid.';
    end if;
    if not exists (select 1 from public.racks where id = p_rack_id and is_active = true) then
      raise exception 'Rak yang dipilih tidak tersedia.';
    end if;

    item_code := coalesce(nullif(trim(p_code), ''), format('BRG-%s', lpad(nextval('public.inventory_item_code_sequence')::text, 5, '0')));
    if exists (select 1 from public.inventory_items where rack_id = p_rack_id and code = item_code) then
      raise exception 'Kode barang sudah digunakan di rak tersebut.';
    end if;

    quantity_before := 0;
    quantity_after := p_quantity;
    insert into public.inventory_items (rack_id, code, name, item_type, initial_quantity, added_quantity, current_quantity, source_note)
    values (p_rack_id, item_code, trim(p_name), p_item_type, p_quantity, 0, quantity_after, nullif(trim(p_notes), ''))
    returning id into item_id;
  else
    raise exception 'Mode barang masuk tidak valid.';
  end if;

  insert into public.stock_movements (inventory_item_id, movement_type, quantity, quantity_before, quantity_after, notes, recorded_by)
  values (item_id, 'stock_in', p_quantity, quantity_before, quantity_after, nullif(trim(p_notes), ''), auth.uid());

  return item_id;
end;
$$;

revoke all on function public.receive_stock(text, uuid, uuid, text, text, text, integer, text) from public;
grant execute on function public.receive_stock(text, uuid, uuid, text, text, text, integer, text) to authenticated;
