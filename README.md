# CC205 Wheel Watch

Dashboard monitoring keausan roda lokomotif CC205: status wheelset, tren parameter, prioritas reprofile, dan input pengukuran lapangan.

Aplikasi berjalan tanpa database (mode demo) dan otomatis memakai PostgreSQL begitu `DATABASE_URL` diatur. Siap deploy ke Vercel.

## Fitur

- Ringkasan KPI armada: jumlah lokomotif, roda dipantau, roda urgent/warning/invalid, kebutuhan reprofile.
- Ringkasan per parameter (diameter, tebal flange, tinggi flange) dengan hitungan Urgent/Warning/Normal/Invalid dan rentang nilai aktual.
- Filter kondisi (Urgent/Warning/Normal/Invalid), rentang tanggal, depo, serta preset EX KKA, PANTAUAN RCD, dan RECENT DATA.
- Tabel monitoring per lokomotif: inspection date, nilai MIN diameter/tebal flange/tinggi flange, action status (GR/BGR/B/W/OK/CEK), dan estimasi lifetime (hari, negatif berarti sudah melewati batas).

Preset cepat: **EX KKA** menampilkan lokomotif berstatus perawatan, **PANTAUAN RCD** menampilkan roda dengan diameter urgent/invalid, dan **RECENT DATA** membatasi ke 30 hari terakhir dari tanggal pengukuran terbaru.
- Tren bulanan tebal flange dan diameter roda.
- Distribusi status roda (normal/warning/kritis).
- Heatmap status 12 roda per lokomotif, klik untuk membuka detail.
- Tabel prioritas tindakan dengan parameter yang melewati batas.
- Pareto parameter keausan yang paling sering bermasalah.
- Halaman detail lokomotif: tren flange per axle, kondisi 12 roda, riwayat pengukuran per roda.
- Form input pengukuran dengan validasi dan evaluasi status otomatis.
- Impor massal dari Excel (.xlsx/.xls), CSV, atau Google Sheets.
- Navigasi bawah khusus mobile dengan safe-area dan target sentuh yang nyaman.
- Status dihitung otomatis dari ambang batas (lihat bagian Ambang batas).

## Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions) |
| Bahasa | TypeScript |
| UI | Tailwind CSS 4, Lucide Icons |
| Grafik | Recharts |
| Database | PostgreSQL (Neon/Supabase/self-host) |
| ORM | Drizzle ORM |
| Validasi | Zod |
| Impor | SheetJS (xlsx), CSV parser, Google Sheets export |
| Deploy | Vercel |

## Struktur

```
src/
  app/
    page.tsx                 dashboard utama
    lokomotif/[id]/page.tsx  detail lokomotif
    input/page.tsx           form pengukuran
    import/page.tsx          halaman impor Excel/CSV/Google Sheets
    import/actions.ts        server action impor data
    actions.ts               server action simpan pengukuran
  components/                UI, filter, tabel, heatmap, chart, form impor
  lib/
    schema.ts                skema Drizzle
    db.ts                    koneksi Postgres
    data.ts                  loader DB + fallback demo
    demo-data.ts             generator data demo deterministik
    import-parse.ts          parser Excel/CSV + fetch Google Sheets
    import-merge.ts          merge data impor ke dataset
    import-store.ts          penyimpanan lokal mode demo
    import-template.ts       kolom + template CSV
    analytics.ts             agregasi KPI, tren, pareto, detail
    domain.ts                tipe, parameter, ambang batas
scripts/seed.ts              seed data ke database
drizzle.config.ts
```

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
# isi DATABASE_URL, atau biarkan kosong untuk mode demo
npm run dev
```

Buka `http://localhost:3000`.

Tanpa `DATABASE_URL`, aplikasi memakai data demo (15 lokomotif, 4 depo, 10 bulan pengukuran; default scope Depo Lokomotif Kampung Durian Runtuh). Form input tidak menyimpan data, tetapi hasil impor Excel/CSV/Google Sheets tetap tersimpan lokal di `.data/imports.json` dan langsung tampil di dashboard.

### Catatan Termux/Android

Turbopack tidak tersedia di Android, gunakan Webpack:

```bash
node node_modules/next/dist/bin/next dev --webpack
node node_modules/next/dist/bin/next build --webpack
```

## Menyiapkan database

Gunakan Neon, Supabase, atau Postgres lokal. Contoh Neon:

1. Buat project di https://neon.tech lalu salin connection string.
2. Isi `.env.local`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/cc205?sslmode=require
```

3. Buat tabel dan seed data:

```bash
npm run db:push
npm run db:seed
```

`db:push` menyinkronkan skema Drizzle. `db:seed` mengisi data contoh.

### Skema

- `depo` — kode, nama, wilayah.
- `lokomotif` — nomor, depo, status operasional, total KM.
- `pengukuran` — satu baris per roda per tanggal: axle 1–6, sisi L/R, KM, diameter, tebal flange, tinggi flange, tread wear, gauge, catatan.

Unique index `(lokomotif_id, axle, side, measured_at)` mencegah duplikasi pengukuran roda pada tanggal yang sama.

## Impor data

Buka menu **Impor** (atau `/import`) lalu pilih salah satu sumber:

1. **Excel/CSV** — unggah file `.xlsx`, `.xls`, atau `.csv` (maks. 10 MB).
2. **Google Sheets** — tempel link spreadsheet. Sheet harus dapat diakses publik ("Anyone with the link can view"). Data ditarik sebagai CSV setiap kali impor dijalankan.

Urutan kolom tidak wajib, tetapi header harus ada. Kolom wajib:

`lokomotif`, `axle` (1-6), `side` (L/R), `tanggal`, `km`, `diameter_mm`, `flange_thickness_mm`, `flange_height_mm`, `tread_wear_mm`, `gauge_mm`.

Kolom opsional: `depo`, `catatan`. Nama kolom tidak peka huruf besar/kecil. Format tanggal yang didukung: `YYYY-MM-DD`, `DD/MM/YYYY`, atau tanggal Excel.

Impor bersifat idempotent: baris dengan lokomotif, axle, sisi, dan tanggal yang sama akan **diperbarui**, bukan diduplikasi. Depo dan lokomotif baru dibuat otomatis. Unduh template CSV langsung dari halaman impor.

Saat database terhubung, impor menulis langsung ke PostgreSQL. Tanpa database, hasil impor disimpan di `.data/imports.json` (mode demo). Halaman dashboard otomatis di-revalidate setelah impor berhasil.

## Deploy ke Vercel

1. Push project ke GitHub.
2. Import repository di https://vercel.com/new (framework terdeteksi otomatis sebagai Next.js).
3. Tambahkan Environment Variable:
   - `DATABASE_URL` = connection string Postgres produksi (Neon/Supabase).
4. Deploy.
5. Sinkronkan skema dan seed ke database produksi dari komputer lokal:

```bash
DATABASE_URL="postgresql://...produksi..." npm run db:push
DATABASE_URL="postgresql://...produksi..." npm run db:seed
```

Tanpa langkah 5, aplikasi tetap tampil dengan data demo berlabel "Mode data demo".

Catatan: gunakan connection string pooler (Neon pooled / Supabase port 6543). Driver sudah dikonfigurasi `prepare: false` dan `max: 1` agar aman di serverless.

## Script

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript tanpa emit |
| `npm run db:push` | Sinkronkan skema ke database |
| `npm run db:seed` | Isi data contoh |
| `npm run db:studio` | Buka Drizzle Studio |

## Ambang batas

| Parameter | Urgent | Warning | Normal | Invalid |
| --- | --- | --- | --- | --- |
| Diameter roda | < 999 mm | 999–1015 mm | 1016–1067 mm | < 900 / > 1067 mm |
| Tebal flange | < 24 mm | 24–26 mm | > 26 mm | < 15 / > 40 mm |
| Tinggi flange | ≥ 33 mm | 30–33 mm | ≤ 30 mm | < 20 / > 40 mm |
| Keausan tread | > 9 mm | 7–9 mm | ≤ 7 mm | < 0 / > 30 mm |
| Wheel gauge | < 993 / > 1007 mm | 993–996 / 1004–1007 mm | 996–1004 mm | < 900 / > 1100 mm |

Status `critical` ditampilkan sebagai **Urgent**. Nilai di luar rentang ukur masuk **Invalid**. Ubah ambang batas terpusat di `src/lib/domain.ts` (`paramStatus` dan `PARAM_REQUIREMENT`).

## Status tindakan & estimasi lifetime

- **GR** — ganti roda: diameter urgent/invalid.
- **BGR** — bubut + ganti roda: diameter warning disertai flange urgent.
- **B** — bubut/reprofile: flange urgent atau parameter lain kritis.
- **W** — pantau: ada parameter warning.
- **OK** — semua parameter normal.
- **CEK** — ada nilai invalid, perlu verifikasi data.

Estimasi lifetime dihitung dari laju keausan antara dua pengukuran terakhir, lalu diambil parameter dengan sisa umur paling pendek. Nilai negatif berarti batas urgent sudah terlampaui.

## Credit

Dikembangkan dan dipelihara oleh **zkvoid**.

## Hardening produksi (opsional)

- Autentikasi dan role per depo (NextAuth/Auth.js + row-level security di Postgres).
- Alert otomatis ke WhatsApp/email saat status kritis (cron Vercel + n8n/Resend).
- Perhitungan Remaining Useful Life dari laju keausan per KM.
- Backup harian database dan audit trail perubahan pengukuran.
- Migrasi berversi dengan `drizzle-kit generate` untuk alur CI/CD.
