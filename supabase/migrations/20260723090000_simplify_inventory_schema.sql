-- Simplify the operational schema: this inventory has one office and is organised only by racks.
drop trigger if exists departments_activity_log on public.departments;
drop trigger if exists categories_activity_log on public.categories;
drop trigger if exists locations_activity_log on public.locations;
drop trigger if exists racks_activity_log on public.racks;
drop function if exists public.log_master_data_activity();

drop table if exists public.activity_logs;
drop table if exists public.categories;
drop table if exists public.departments;

alter table public.racks drop constraint if exists racks_location_id_code_key;
alter table public.racks drop constraint if exists racks_location_id_fkey;
alter table public.racks drop column if exists location_id;
alter table public.racks add constraint racks_code_key unique (code);

drop table if exists public.locations;

comment on table public.profiles is 'Profil akun aplikasi. Password disimpan aman oleh Supabase pada auth.users, bukan di tabel ini.';
comment on column public.profiles.id is 'PK dan FK ke auth.users.id (ID akun login).';
comment on column public.profiles.role is 'Peran akses: super_admin, inventory_admin, atau viewer.';
comment on table public.racks is 'Daftar rak penyimpanan barang di kantor.';
comment on column public.racks.id is 'PK: ID unik rak.';
comment on column public.racks.code is 'Kode rak, misalnya A, B, atau T.';
comment on table public.inventory_items is 'Daftar barang inventaris dan stok per rak.';
comment on column public.inventory_items.id is 'PK: ID unik barang.';
comment on column public.inventory_items.rack_id is 'FK ke racks.id: rak tempat barang disimpan.';
comment on table public.loans is 'Data utama transaksi peminjaman alat.';
comment on column public.loans.id is 'PK: ID unik peminjaman.';
comment on column public.loans.created_by is 'FK ke profiles.id: admin yang mencatat peminjaman.';
comment on table public.loan_items is 'Rincian barang yang termasuk dalam satu peminjaman.';
comment on column public.loan_items.loan_id is 'FK ke loans.id.';
comment on column public.loan_items.inventory_item_id is 'FK ke inventory_items.id.';
comment on table public.loan_item_returns is 'Catatan barang yang dikembalikan, rusak, atau hilang.';
comment on column public.loan_item_returns.loan_item_id is 'FK ke loan_items.id.';
comment on column public.loan_item_returns.recorded_by is 'FK ke profiles.id: admin yang mencatat pengembalian.';
comment on table public.stock_movements is 'Riwayat barang masuk dan perubahan stok.';
comment on column public.stock_movements.inventory_item_id is 'FK ke inventory_items.id.';
comment on column public.stock_movements.recorded_by is 'FK ke profiles.id: admin yang mencatat barang masuk.';