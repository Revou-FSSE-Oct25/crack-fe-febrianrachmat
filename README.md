# Kinova — Frontend (Next.js)

Frontend demo untuk platform booking & konsultasi fisioterapi. Backend: [crack-be-febrianrachmat](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat).

## Kebijakan produk

- Ringkasan in-app: [`/kebijakan`](http://localhost:3000/kebijakan) saat dev server berjalan.
- Dokumen lengkap: [product-policy.md](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat/blob/main/docs/product-policy.md) (repo backend).

## Environment

Salin `.env.example` → `.env`:

| Variabel | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_API_URL` | Base URL API NestJS (bukan Postgres). Produksi: `https://crack-be-febrianrachmat-production.up.railway.app` |
| `JWT_SECRET` | Sama dengan backend — dipakai middleware untuk verifikasi JWT admin |

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Pastikan backend berjalan di `NEXT_PUBLIC_API_URL` (default `http://localhost:3000`).

## Skrip

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Jalankan build produksi |
| `npm run lint` | ESLint |

## Kualitas & CI

GitHub Actions (`.github/workflows/ci.yml`) pada push/PR ke `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

## Monitoring API

- Backend langsung: `{NEXT_PUBLIC_API_URL}/health`
- Dari frontend (proxy): `GET /api/health` — berguna untuk cek CORS/network dari lingkungan Next.js.

## Deploy

- **Vercel / Railway / Node:** set env di atas, lalu `npm run build` + `npm run start`.
- Set `CORS_ORIGINS` di backend agar mencakup URL frontend produksi.

## Akun demo

Setelah `npm run prisma:seed` di backend — password default `password123`:

- `admin@demo.local`, `patient1@demo.local`, `patient2@demo.local`
- `physio1@demo.local`, `physio2@demo.local`, `physio3@demo.local` (pending)

Lihat [backend README](https://github.com/Revou-FSSE-Oct25/crack-be-febrianrachmat#readme) untuk operasional lengkap.
