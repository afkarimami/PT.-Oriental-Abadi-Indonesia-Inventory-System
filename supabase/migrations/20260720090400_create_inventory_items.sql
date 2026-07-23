create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  rack_id uuid not null references public.racks(id) on delete restrict,
  code text not null,
  name text not null,
  item_type text not null check (item_type in ('consumable', 'inventory', 'unclassified')),
  initial_quantity integer check (initial_quantity is null or initial_quantity >= 0),
  used_quantity integer check (used_quantity is null or used_quantity >= 0),
  added_quantity integer check (added_quantity is null or added_quantity >= 0),
  current_quantity integer check (current_quantity is null or current_quantity >= 0),
  source_note text,
  source_row integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rack_id, code)
);

create index inventory_items_rack_id_idx on public.inventory_items(rack_id);
create index inventory_items_item_type_idx on public.inventory_items(item_type);

create trigger inventory_items_set_updated_at before update on public.inventory_items for each row execute function public.set_updated_at();

alter table public.inventory_items enable row level security;

grant select, insert, update on public.inventory_items to authenticated;

create policy "inventory_items_authenticated_select"
on public.inventory_items for select to authenticated
using (true);

create policy "inventory_items_active_user_insert"
on public.inventory_items for insert to authenticated
with check (public.is_active_inventory_user());

create policy "inventory_items_active_user_update"
on public.inventory_items for update to authenticated
using (public.is_active_inventory_user())
with check (public.is_active_inventory_user());
