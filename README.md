# Kinova — Frontend (Next.js)

Aplikasi web untuk platform **booking & konsultasi fisioterapi** (demo produk mirip Halodoc). Tiga peran pengguna: **Admin**, **Pasien**, dan **Fisioterapis**. Semua data diambil dari API backend NestJS (bukan mock).

| | |
| --- | --- |
| **Repo backend** | [crack-be-febrianrachmat](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat) |
| **Repo frontend** | [crack-fe-febrianrachmat](https://github.com/Revou-FSSE-Oct25/crack-fe-febrianrachmat) |

---

## Live deployment (Railway)

| | URL |
| --- | --- |
| **Frontend (produksi)** | https://crack-fe-febrianrachmat-production.up.railway.app |
| **Backend API** | https://crack-be-febrianrachmat-production.up.railway.app |
| **Health (API)** | https://crack-be-febrianrachmat-production.up.railway.app/health |
| **Swagger (semua endpoint)** | https://crack-be-febrianrachmat-production.up.railway.app/docs |
| **Database ERD** | https://dbdiagram.io/d/Crack-Physio-6a05b6997a923b9472b2f884 |
| **Status dari FE** | `{FRONTEND_URL}/status` |

> Set `NEXT_PUBLIC_API_URL` ke base URL backend (bukan connection string Postgres).  
> Di service **backend** Railway, set `CORS_ORIGINS` ke URL frontend produksi (pisah koma jika ada preview).

---

## Tech stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 4 |
| Bahasa | TypeScript 5 |
| Auth client | JWT di `localStorage` + cookie mirror untuk rute `/admin` |
| Verifikasi admin (edge) | [`jose`](https://github.com/panva/jose) di `src/proxy.ts` |
| API | `fetch` + envelope `{ success, data }` — lihat `src/lib/api/client.ts` |

---

## Fitur utama

### Publik (tanpa login)

- Landing, layanan, tentang, kebijakan produk
- Login & registrasi (`PATIENT` / `PHYSIOTHERAPIST`)

### Pasien (`PATIENT`)

| Fitur | Route | CRUD / aksi |
| --- | --- | --- |
| Cari fisioterapis | `/therapists`, `/therapists/[id]` | Read + filter |
| Buat janji (visit) | `/appointment`, `/bookings` | Create booking, cancel |
| Konsultasi online | `/consultations` | Create, bayar, chat, cancel |
| Pembayaran | `/transactions` | Create transaksi + upload bukti |
| Ulasan | `/reviews`, `/reviews/write` | Create, list, delete sendiri |
| Chat & notifikasi | `/chat`, `/notifications` | Read, kirim pesan |
| Profil | `/profile` | Read, update, ganti password |

### Fisioterapis (`PHYSIOTHERAPIST`)

| Fitur | Route | CRUD / aksi |
| --- | --- | --- |
| Profil profesional | `/physiotherapist/profile` | Update |
| Jadwal slot | `/physiotherapist/availability` | Create / update / delete slot |
| Booking pasien | `/bookings` | Update status (konfirmasi → selesai) |
| Konsultasi | `/consultations` | Terima, mulai, selesai |
| Chat & notifikasi | `/chat`, `/notifications` | Read, kirim pesan |

### Admin (`ADMIN`)

| Fitur | Route | CRUD / aksi |
| --- | --- | --- |
| Dashboard | `/admin/dashboard` | Read ringkasan |
| Verifikasi PT | `/admin/physiotherapists` | Approve / reject |
| Kategori layanan | `/admin/categories` | Full CRUD |
| Moderasi ulasan | `/admin/reviews` | Sembunyikan / tampilkan |
| Broadcast notifikasi | `/admin/notifications` | Create |
| Transaksi | `/transactions` | Konfirmasi bayar, refund |
| Konsultasi & booking | `/consultations`, `/bookings` | Read (monitoring) |

Rute `/admin/*` dilindungi **server-side** (`src/proxy.ts`: JWT cookie + role `ADMIN`). Halaman lain memakai guard client (`SignInRequired`) + pengecekan role di halaman.

---

## Screenshots

Tambahkan tangkapan layar ke folder [`docs/screenshots/`](./docs/screenshots/) lalu referensikan di sini (untuk penilaian / README).

| File (disarankan) | Isi |
| --- | --- |
| `home.png` | Beranda |
| `booking.png` | Form janji / daftar booking |
| `consultation.png` | Konsultasi + chat |
| `admin-dashboard.png` | Dashboard admin |

Contoh setelah file ada:

```markdown
![Beranda](./docs/screenshots/home.png)
![Booking](./docs/screenshots/booking.png)
```

---

## Dokumentasi terkait (backend)

| Dokumen | Link |
| --- | --- |
| Indeks docs BE | [docs/README.md](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/README.md) |
| Skema DB & ERD sumber | [docs/02-database-schema.md](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/02-database-schema.md), [database-erd.dbml](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/database-erd.dbml) |
| Kebijakan produk | [docs/product-policy.md](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/product-policy.md) |
| Runbook operasi | [docs/32-operations-runbook.md](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/32-operations-runbook.md) |
| Ringkasan in-app | `/kebijakan` |

Daftar lengkap request/response API: gunakan **Swagger** di URL backend `/docs`.

---

## Environment

Salin `.env.example` → `.env`:

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL API NestJS. Lokal: `http://localhost:3000` (port backend). Produksi: `https://crack-be-febrianrachmat-production.up.railway.app` |
| `JWT_SECRET` | **Harus sama** dengan `JWT_SECRET` di backend — untuk verifikasi JWT pada rute `/admin` di `src/proxy.ts` |

---

## Menjalankan lokal

1. Jalankan backend (lihat [README backend](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat#quick-start-local)).
2. Frontend:

```bash
npm install
cp .env.example .env
# edit NEXT_PUBLIC_API_URL dan JWT_SECRET
npm run dev
```

Buka http://localhost:3000 (default port Next.js; pastikan tidak bentrok dengan port API).

---

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Jalankan build produksi |
| `npm run lint` | ESLint |

---

## Deploy (Railway)

1. Connect repo GitHub ke Railway, service **Node**.
2. **Variables:** `NEXT_PUBLIC_API_URL`, `JWT_SECRET` (sama dengan BE).
3. **Build:** `npm run build` — **Start:** `npm run start` (atau gunakan Nixpacks default Next.js).
4. Di backend, set `CORS_ORIGINS` = URL publik service frontend Railway.
5. Verifikasi: buka `/status` pada URL FE dan `/health` pada URL BE.

---

## Kualitas & CI

GitHub Actions (`.github/workflows/ci.yml`) pada push/PR ke `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

---

## Monitoring API

- Backend: `{NEXT_PUBLIC_API_URL}/health`
- Dari frontend: `GET /api/health` dan halaman `/status`

---

## Akun demo

Setelah `npm run prisma:seed` di backend — password default **`password123`**:

| Email | Role |
| --- | --- |
| `admin@demo.local` | ADMIN |
| `patient1@demo.local` | PATIENT |
| `patient2@demo.local` | PATIENT |
| `physio1@demo.local` | PHYSIOTHERAPIST |
| `physio2@demo.local` | PHYSIOTHERAPIST |
| `physio3@demo.local` | PHYSIOTHERAPIST (pending verifikasi) |

---

## Validasi form

Aturan validasi client-side (selaras DTO backend) ada di `src/lib/validation/`. Dipakai pada login, register, booking, transaksi, konsultasi, profil, ulasan, dan panel admin. Pesan error per field ditampilkan lewat `FieldError` pada form auth.

## Struktur repo

```
crack-fe-febrianrachmat/
├── docs/screenshots/     # Aset README (opsional)
├── public/
├── src/
│   ├── app/              # Halaman App Router
│   ├── components/
│   ├── contexts/         # Auth, toast
│   └── lib/api/          # Client REST per domain
├── src/proxy.ts          # Gate /admin (JWT + role)
├── .github/workflows/
└── package.json
```
