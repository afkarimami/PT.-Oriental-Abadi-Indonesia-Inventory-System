-- Consumable dapat dicatat dalam transaksi peminjaman bersama alat inventaris.
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
    raise exception 'Pilih minimal satu barang untuk dipinjam.';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as items(inventory_item_id uuid, quantity integer)
    group by inventory_item_id
    having count(*) > 1
  ) then
    raise exception 'Satu barang hanya boleh dipilih sekali dalam peminjaman.';
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
      raise exception 'Data barang peminjaman tidak valid.';
    end if;

    select current_quantity into available_quantity
    from public.inventory_items
    where id = item_record.inventory_item_id and is_active = true
    for update;

    if not found then
      raise exception 'Barang yang dipilih tidak tersedia untuk dipinjam.';
    end if;
    if available_quantity is null or available_quantity < item_record.quantity then
      raise exception 'Stok barang tidak mencukupi untuk peminjaman ini.';
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

revoke all on function public.create_loan(text, text, text, text, date, text, text, jsonb) from public;
grant execute on function public.create_loan(text, text, text, text, date, text, text, jsonb) to authenticated;
