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
| **Panduan demo** | `{FRONTEND_URL}/demo` |

> Set `NEXT_PUBLIC_API_URL` ke base URL backend (bukan connection string Postgres).  
> Di service **backend** Railway, set `CORS_ORIGINS` (atau `FRONTEND_URL`) ke URL frontend produksi (pisah koma jika ada preview).  
> Untuk **login OAuth**, backend juga membutuhkan `API_PUBLIC_URL` dan kredensial provider — lihat [OAuth & notifikasi](#oauth--notifikasi-backend).

---

## Tech stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 4 |
| Bahasa | TypeScript 5 |
| Auth client | JWT di `localStorage` + cookie mirror untuk gate `/admin` |
| Login sosial | OAuth 2.0 via backend → redirect ke `/auth/callback?accessToken=...` |
| Verifikasi admin (edge) | [`jose`](https://github.com/panva/jose) di `src/proxy.ts` |
| API | `fetch` + envelope `{ success, data }` — lihat `src/lib/api/client.ts` |
| UX global | Toast (`success` / `error` / `info`), dark mode (class `dark` + `localStorage`) |

---

## UX global

| Fitur | Ringkasan |
| --- | --- |
| **Dark mode** | Toggle bulan/matahari di navbar; preferensi disimpan (`kinova-theme`: `light` / `dark` / default ikuti sistem). |
| **Toast** | Notifikasi singkat pojok layar setelah aksi sukses/gagal/info. |
| **Notifikasi in-app** | Ikon bell + badge jumlah belum dibaca (polling ~60 detik + refresh setelah aksi booking/konsultasi/dll.). Halaman `/notifications`. |
| **Pintasan** | `AppShortcutBar` di bawah navbar untuk user login (per role: pasien / PT / admin). |
| **Keandalan demo** | Banner jika API/DB tidak sehat; timeout fetch 20 detik; kartu **Coba lagi** di halaman alur kritis; `/status` + `/demo`. |

Bahasa UI saat ini: **Bahasa Indonesia** (belum ada multi-language).

---

## Fitur utama

### Publik (tanpa login)

- Landing, layanan, tentang, kebijakan produk (`/kebijakan`), panduan demo (`/demo`), status API (`/status`)
- Login & registrasi (`PATIENT` / `PHYSIOTHERAPIST`) — email/password **atau** OAuth (jika provider dikonfigurasi di backend)
- Callback OAuth: `/auth/callback` (menerima token dari backend, lalu menyimpan sesi)

### Pasien (`PATIENT`)

| Fitur | Route | CRUD / aksi |
| --- | --- | --- |
| Cari fisioterapis | `/therapists`, `/therapists/[id]` | Read + filter |
| Buat janji (visit) | `/appointment`, `/bookings` | Create booking, cancel |
| Konsultasi online | `/consultations` | Create, bayar, chat, cancel |
| Pembayaran | `/transactions` | Create transaksi + upload bukti |
| Ulasan | `/reviews`, `/reviews/write` | Create/edit untuk booking & konsultasi selesai |
| Chat & notifikasi | `/chat`, `/notifications` | Chat live via SSE; kirim pesan; mark read notifikasi |
| Profil | `/profile` | Read, update, ganti password, upload avatar, data medis pasien |

### Fisioterapis (`PHYSIOTHERAPIST`)

| Fitur | Route | CRUD / aksi |
| --- | --- | --- |
| Profil profesional | `/physiotherapist/profile` | Update |
| Jadwal slot | `/physiotherapist/availability` | Create / update / delete slot |
| Booking pasien | `/bookings` | Update status (konfirmasi → selesai) |
| Konsultasi | `/consultations` | Terima, mulai, selesai |
| Chat & notifikasi | `/chat`, `/notifications` | Chat live via SSE; kirim pesan |

### Admin (`ADMIN`)

| Fitur | Route | CRUD / aksi |
| --- | --- | --- |
| Dashboard | `/admin/dashboard` | Read ringkasan |
| Analytics | `/admin/analytics` | Tren & breakdown (7–90 hari) |
| Verifikasi PT | `/admin/physiotherapists` | Approve / reject |
| Kategori layanan | `/admin/categories` | Full CRUD |
| Moderasi ulasan | `/admin/reviews` | Sembunyikan / tampilkan |
| Audit log | `/admin/audit-logs` | Read jejak aksi admin & sistem |
| Panel operasional | `/admin/operations` | Antrian bayar, monitoring booking, **unduh CSV** |
| Broadcast notifikasi | `/admin/notifications` | Kirim ke satu user atau broadcast |
| Transaksi | `/transactions` | Konfirmasi bayar, refund |
| Konsultasi & booking | `/consultations`, `/bookings` | Read (monitoring) |

### OAuth & notifikasi (backend)

Fitur berikut membutuhkan konfigurasi di **backend** (bukan variabel FE):

| Fitur | Variabel / endpoint (BE) |
| --- | --- |
| Google / GitHub / Facebook / Apple login | `API_PUBLIC_URL`, `FRONTEND_URL`, `GOOGLE_*`, `GITHUB_*`, `FACEBOOK_*`, `APPLE_*` — lihat [`.env.example` backend](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/.env.example) |
| Daftar provider aktif | `GET /auth/oauth/providers` |
| Email mock (log server, bukan SMTP) | `EMAIL_MOCK_ENABLED` — dipicu saat notifikasi sistem dibuat |

Setelah OAuth sukses, backend mengarahkan ke `{FRONTEND_URL}/auth/callback?accessToken=...`.

---

## Proteksi rute (`src/proxy.ts`)

Rute sensitif dilindungi **server-side** (JWT dari cookie `kinova_access_token`, diverifikasi dengan `JWT_SECRET`):

| Pola route | Role |
| --- | --- |
| `/admin/*` | `ADMIN` |
| `/physiotherapist/*` | `PHYSIOTHERAPIST` |
| `/appointment`, `/reviews/*` | `PATIENT` |
| `/profile`, `/bookings`, `/consultations`, `/transactions`, `/notifications`, `/chat/*`, `/therapists/*` | Semua role (wajib login) |

Publik tanpa login: `/`, `/login`, `/register`, `/services`, `/about`, `/kebijakan`, `/status`, `/auth/callback`, serta aset statis.

Tanpa token → redirect `/login?next=...`. Role salah → redirect `/`. Halaman tetap memakai `SignInRequired` + cek role di client sebagai lapisan kedua.

---

## Screenshots

Tambahkan tangkapan layar ke folder [`docs/screenshots/`](./docs/screenshots/) lalu referensikan di sini (untuk penilaian / README).

| File (disarankan) | Isi |
| --- | --- |
| `home.png` | Beranda |
| `booking.png` | Form janji / daftar booking |
| `consultation.png` | Konsultasi + chat |
| `admin-dashboard.png` | Dashboard admin |
| `dark-mode.png` | Contoh tampilan dark mode (opsional) |

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
| Notifikasi API | [docs/18-notification-feature.md](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/18-notification-feature.md) |
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

OAuth tidak memerlukan env tambahan di frontend; provider dikonfigurasi hanya di backend.

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

Untuk uji OAuth lokal, set callback backend ke `http://localhost:3000/auth/callback` dan `FRONTEND_URL=http://localhost:3000` di `.env` backend.

---

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Jalankan build produksi |
| `npm run lint` | ESLint |
| `npm test` | Unit test helper (`booking-flow`, `fetch-reliable`, dll.) |
| `npm run test:e2e` | Playwright E2E (skip tanpa `E2E_RUN=1`) |
| `npm run test:e2e:local` | E2E lokal — butuh BE + DB seed + `npm run dev` |

**E2E lokal:**

1. Backend: Postgres (embedded `:5433` atau Docker) + `npm run start:dev` (port 3000).
2. Set `JWT_SECRET` **sama** di BE dan FE (Playwright memakai default `e2e-test-jwt-secret-min-32-chars-long` jika tidak di-set).
3. FE: `E2E_RUN=1 npm run test:e2e:local` — Playwright menjalankan `prisma:seed` otomatis di `e2e/global-setup.ts` (lewati dengan `E2E_SKIP_SEED=1` jika DB sudah di-seed manual).
4. Pertama kali: `npx playwright install chromium`.

Skenario E2E (butuh `E2E_RUN=1`):

| File | Cakupan |
| --- | --- |
| `e2e/demo-guide.spec.ts` | Statis — panduan demo & login (tanpa API) |
| `e2e/booking-visit-payment.spec.ts` | Booking visit + CTA bayar |
| `e2e/therapist-browse.spec.ts` | Browse & profil fisioterapis |
| `e2e/consultation-payment.spec.ts` | Konsultasi pay-first + chat |
| `e2e/chat-sse.spec.ts` | Indikator Live (SSE) di percakapan |
| `e2e/admin-features.spec.ts` | Audit log, analytics, export CSV |
| `e2e/review-write.spec.ts` | Form ulasan booking & konsultasi |

---

## Deploy (Railway)

1. Connect repo GitHub ke Railway, service **Node**.
2. **Variables:** `NEXT_PUBLIC_API_URL`, `JWT_SECRET` (sama dengan BE).
3. **Build:** `npm run build` — **Start:** `npm run start` (atau gunakan Nixpacks default Next.js).
4. Di backend, set `CORS_ORIGINS` = URL publik service frontend Railway; untuk OAuth set juga `FRONTEND_URL` dan `API_PUBLIC_URL`.
5. Verifikasi: buka `/status` dan `/demo` pada URL FE; `/health` pada URL BE; uji login akun demo (`password123`) dan toggle dark mode di navbar.

---

## Kualitas & CI

GitHub Actions (`.github/workflows/ci.yml`) pada push/PR ke `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

**Coverage:** repo frontend belum memiliki unit test Jest/Vitest; pelaporan coverage otomatis ada di backend (`crack-be-febrianrachmat`) lewat `npm run test:cov` + ringkasan di GitHub Actions job summary.

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

Akun demo memakai login email/password. OAuth membuat atau menautkan user terpisah sesuai email provider.

---

## Validasi form

Aturan validasi client-side (selaras DTO backend) ada di `src/lib/validation/`. Dipakai pada login, register, booking, transaksi, konsultasi, profil, ulasan, dan panel admin. Pesan error per field ditampilkan lewat `FieldError` pada form auth.

---

## Struktur repo

```
crack-fe-febrianrachmat/
├── docs/screenshots/          # Aset README (opsional)
├── public/
├── src/
│   ├── app/                   # Halaman App Router (+ /auth/callback)
│   ├── components/
│   │   ├── auth/              # OAuthButtons
│   │   ├── profile/           # Avatar, medis pasien, danger zone
│   │   └── ui/                # page-shell, dialog, field-error
│   ├── contexts/              # auth, theme, toast
│   ├── hooks/                 # unread notifications, avatar URL
│   └── lib/
│       ├── api/               # Client REST per domain
│       ├── auth/              # storage, session, proxy-routes
│       ├── notifications/     # unread refresh, action feedback
│       ├── theme/             # preferensi dark/light
│       └── validation/
├── src/proxy.ts               # Gate auth server-side (JWT cookie + role)
└── package.json
```
