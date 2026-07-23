# Ruang Inventaris

Aplikasi inventory kantor berbasis Next.js. Aplikasi menyediakan dashboard, daftar 590 barang dari 12 rak, manajemen rak, dan pencatatan peminjaman alat dengan pengembalian serta dokumentasi foto.

## Teknologi

- Next.js 16 App Router, TypeScript, Tailwind CSS, dan shadcn/ui
- Supabase, Supabase SSR, PostgreSQL migration, dan Row Level Security
- React Hook Form, Zod, Sonner, Lucide React, TanStack Table, Recharts, dan date-fns

## Instalasi

1. Pastikan Node.js 20.9 atau lebih baru tersedia.
2. Salin `.env.example` menjadi `.env.local`.
3. Isi Project URL dan publishable key Supabase.
4. Jalankan `npm install`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Jangan menyimpan service role key pada browser, source code, atau `.env.example`. File `.env.local` sudah diabaikan Git.

## Menjalankan Aplikasi

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

Buka `http://localhost:3000` saat development. Route dashboard, inventaris, manajemen rak, dan peminjaman membutuhkan session admin; pengguna yang belum login akan diarahkan ke `/login`.

## Menyiapkan Supabase

1. Buat project Supabase dan tunggu database siap.
2. Salin Project URL serta publishable key dari halaman Connect atau API Settings ke `.env.local`.
3. Hubungkan CLI ke project lalu terapkan seluruh migration:

```bash
npx supabase login
npx supabase link --project-ref wniwqymiyklpydnkqfdi
npx supabase db push
```

4. Jalankan `supabase/seed.sql` melalui SQL Editor setelah seluruh migration timestamp berhasil diterapkan.
5. Jalankan `supabase/inventory-seed.sql` untuk memasukkan 590 item dari workbook ke `Gudang Utama -> Rak A, B, C, D, E, F, G, H, J, K, T, U`. Jalankan ulang file ini bila sebelumnya hanya Rak A yang sudah diimpor.
6. Buat user admin melalui Supabase Authentication > Users > Add user.

Trigger dari migration akan membuat row `profiles` secara otomatis. Bila user dibuat sebelum migration diterapkan, buat ulang user tersebut atau tambahkan profile-nya setelah tabel `profiles` tersedia. User harus memiliki `is_active = true` untuk mencatat perubahan data.

## Rak

Route berikut tersedia setelah login:

- `/inventory` - pilih kartu rak untuk melihat isi barang dan kuantitasnya.
- `/master-data/racks` - kelola kode, nama, deskripsi, dan status rak.

Aplikasi memakai satu gudang utama secara internal. Saat menambah rak, sistem langsung menghubungkannya ke gudang tersebut sehingga admin tidak perlu mengatur bagian, kategori, atau lokasi.
## Database Types

Project sudah terhubung ke Supabase. Jika schema berubah, generate tipe terbaru dan simpan sebagai `src/types/database.types.ts`:

```bash
npx supabase gen types typescript --project-id wniwqymiyklpydnkqfdi > src/types/database.types.ts
```

Jalankan kembali perintah tersebut setiap kali schema berubah.

## Struktur Folder

```text
src/
  app/
    (auth)/                 # Route login tanpa sidebar
    (dashboard)/            # Dashboard, inventaris, transaksi, laporan, dan rak
  components/
    layout/                 # Shell, sidebar, header, container
    shared/                 # Komponen lintas fitur
    ui/                     # Komponen shadcn/ui
  features/
    auth/                   # Login, session, query profile
    dashboard/              # Ringkasan dashboard
    master-data/            # Pengelolaan rak
    inventory/              # Daftar item dan stok dari workbook
    loans/                  # Peminjaman, pengembalian, dan dokumentasi
  lib/
    supabase/               # Client, server, refresh session
  proxy.ts                  # Refresh cookie session untuk Next 16

supabase/
  migrations/               # Schema, trigger, RLS, dan audit
  seed.sql                  # Data master contoh idempoten
  inventory-seed.sql        # 590 item workbook untuk 12 rak
```

Folder `src/features/master-data` menyimpan fitur rak. Folder `src/features/inventory` menyimpan daftar inventaris. Folder `src/features/loans` menyimpan alur pinjam, kembali, dan kondisi alat. `src/components/layout/dashboard-shell.tsx` membuat seluruh route dashboard berbagi header dan sidebar yang sama.

## Arsitektur

Alurnya tetap sederhana: `page -> feature component -> query/action -> Supabase`. Query dan mutation manajemen rak berada pada file `<entity>-queries.ts` dan `<entity>-actions.ts`; validasinya berada pada `<entity>-schema.ts`. Komponen hanya dipindahkan ke shared jika benar-benar digunakan oleh lebih dari satu fitur."# inventory" 
