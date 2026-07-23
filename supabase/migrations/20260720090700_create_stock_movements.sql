create sequence public.inventory_item_code_sequence start with 1;

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  movement_type text not null check (movement_type in ('stock_in')),
  quantity integer not null check (quantity > 0),
  quantity_before integer not null check (quantity_before >= 0),
  quantity_after integer not null check (quantity_after >= 0),
  notes text,
  recorded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index stock_movements_created_at_idx on public.stock_movements(created_at desc);
create index stock_movements_inventory_item_id_idx on public.stock_movements(inventory_item_id);

alter table public.stock_movements enable row level security;
grant select on public.stock_movements to authenticated;

create policy "stock_movements_active_user_read"
on public.stock_movements for select to authenticated
using (public.is_active_inventory_user());

create function public.receive_stock(
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
  if not public.is_active_inventory_user() then
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
