create sequence public.loan_code_sequence start with 1;

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  borrower_name text not null,
  borrower_phone text not null,
  borrower_organization text,
  purpose text not null,
  loaned_at timestamptz not null default now(),
  expected_return_on date,
  notes text,
  documentation_path text,
  status text not null default 'active' check (status in ('active', 'closed')),
  closed_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.loan_items (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity_borrowed integer not null check (quantity_borrowed > 0),
  quantity_returned integer not null default 0 check (quantity_returned >= 0),
  quantity_damaged integer not null default 0 check (quantity_damaged >= 0),
  quantity_lost integer not null default 0 check (quantity_lost >= 0),
  check (quantity_returned + quantity_damaged + quantity_lost <= quantity_borrowed),
  unique (loan_id, inventory_item_id)
);

create table public.loan_item_returns (
  id uuid primary key default gen_random_uuid(),
  loan_item_id uuid not null references public.loan_items(id) on delete cascade,
  quantity_good integer not null default 0 check (quantity_good >= 0),
  quantity_damaged integer not null default 0 check (quantity_damaged >= 0),
  quantity_lost integer not null default 0 check (quantity_lost >= 0),
  notes text,
  documentation_path text,
  recorded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (quantity_good + quantity_damaged + quantity_lost > 0)
);

create index loans_status_expected_return_idx on public.loans(status, expected_return_on);
create index loan_items_loan_id_idx on public.loan_items(loan_id);
create index loan_item_returns_loan_item_id_idx on public.loan_item_returns(loan_item_id);

alter table public.loans enable row level security;
alter table public.loan_items enable row level security;
alter table public.loan_item_returns enable row level security;

grant select on public.loans, public.loan_items, public.loan_item_returns to authenticated;

drop policy if exists "loans_active_user_read" on public.loans;
create policy "loans_active_user_read" on public.loans for select to authenticated using (public.is_active_inventory_user());

drop policy if exists "loan_items_active_user_read" on public.loan_items;
create policy "loan_items_active_user_read" on public.loan_items for select to authenticated using (public.is_active_inventory_user());

drop policy if exists "loan_item_returns_active_user_read" on public.loan_item_returns;
create policy "loan_item_returns_active_user_read" on public.loan_item_returns for select to authenticated using (public.is_active_inventory_user());

create function public.create_loan(
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
  if not public.is_active_inventory_user() then
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

create function public.return_loan_item(
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
  if not public.is_active_inventory_user() then
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