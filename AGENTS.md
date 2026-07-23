# Project Rules

Project ini menggunakan Next.js, TypeScript, Supabase, Tailwind CSS, dan shadcn/ui.

## Arsitektur

Gunakan struktur feature-based yang sederhana:

- `src/app`: route, layout, dan komposisi halaman
- `src/features`: fitur bisnis dan komponen khusus fitur
- `src/components/ui`: komponen shadcn/ui
- `src/components/layout`: komponen layout global
- `src/components/shared`: komponen yang benar-benar digunakan lintas fitur
- `src/lib`: konfigurasi teknis umum
- `supabase`: migration, database function, dan seed

## Aturan

1. Jangan membuat repository, manager, adapter, domain, infrastructure, use-case, atau service layer tanpa permintaan eksplisit.
2. Jangan membuat file atau folder kosong untuk kebutuhan masa depan.
3. Pertahankan folder tetap dangkal.
4. Gunakan nama file yang jelas.
5. Jangan memakai singkatan yang tidak umum.
6. File route harus kecil.
7. Logic khusus fitur harus berada di folder fitur tersebut.
8. Komponen hanya dipindahkan ke shared jika digunakan oleh lebih dari satu fitur.
9. Database read nantinya ditempatkan di `<feature>-queries.ts`.
10. Database mutation nantinya ditempatkan di `<feature>-actions.ts`.
11. Validasi Zod nantinya ditempatkan di `<feature>-schema.ts`.
12. Jangan menaruh business logic kompleks di komponen React.
13. Jangan menaruh Supabase service role key di client.
14. Jelaskan setiap folder baru yang ditambahkan.
15. Jangan mengubah arsitektur utama tanpa menjelaskan alasannya.
16. Hindari file lebih dari 300 baris. Pecah hanya jika memang meningkatkan keterbacaan.
17. Prioritaskan kode yang mudah dipahami daripada abstraksi berlebihan.
18. Gunakan bahasa Inggris untuk nama file, nama variabel, dan kode.
19. Gunakan bahasa Indonesia untuk dokumentasi dan penjelasan pengguna.
20. Jalankan lint dan type check sebelum menyatakan pekerjaan selesai.