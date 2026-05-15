# Screenshot untuk README

Letakkan file PNG atau JPG di folder ini, lalu tambahkan referensi di [README.md](../../README.md) bagian **Screenshots**.

## Daftar disarankan

1. **home.png** — Halaman beranda (`/`)
2. **booking.png** — Form janji atau daftar booking (`/appointment` atau `/bookings`)
3. **consultation.png** — Daftar konsultasi atau chat (`/consultations` atau `/chat`)
4. **admin-dashboard.png** — Dashboard admin (`/admin/dashboard`)

## Cara menangkap

1. Buka deployment Railway atau `npm run dev`.
2. Login dengan akun demo (lihat README utama).
3. Tangkap layar per role jika perlu (pasien vs admin).
4. Resize lebar ~1280px agar terbaca di GitHub.

## Git

```bash
git add docs/screenshots/*.png
git commit -m "docs: add README screenshots"
```
