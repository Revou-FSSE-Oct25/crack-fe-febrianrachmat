export type DemoAccount = {
  email: string;
  role: "ADMIN" | "PATIENT" | "PHYSIOTHERAPIST";
  label: string;
  note: string;
};

export const DEMO_DEFAULT_PASSWORD = "password123";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@demo.local",
    role: "ADMIN",
    label: "Admin",
    note: "Konfirmasi pembayaran, moderasi ulasan, verifikasi PT, audit log.",
  },
  {
    email: "patient1@demo.local",
    role: "PATIENT",
    label: "Pasien 1",
    note: "Konsultasi IN_PROGRESS, booking selesai + ulasan, konsultasi selesai.",
  },
  {
    email: "patient2@demo.local",
    role: "PATIENT",
    label: "Pasien 2",
    note: "Konsultasi ACCEPTED + booking PENDING — cocok alur bayar kunjungan.",
  },
  {
    email: "physio1@demo.local",
    role: "PHYSIOTHERAPIST",
    label: "Fisioterapis 1",
    note: "Profil APPROVED, status online — terima konsultasi & chat.",
  },
  {
    email: "physio2@demo.local",
    role: "PHYSIOTHERAPIST",
    label: "Fisioterapis 2",
    note: "Profil APPROVED — konfirmasi booking pasien 2.",
  },
  {
    email: "physio3@demo.local",
    role: "PHYSIOTHERAPIST",
    label: "Fisioterapis 3",
    note: "Menunggu verifikasi admin (PENDING).",
  },
];

export type DemoFlowStep = {
  title: string;
  actors: string;
  steps: string[];
  links: { label: string; href: string }[];
};

export const DEMO_HAPPY_PATHS: DemoFlowStep[] = [
  {
    title: "Kunjungan: booking → bayar",
    actors: "physio2 + patient2 + admin",
    steps: [
      "Login physio2 → /bookings → Konfirmasi janji pasien.",
      "Login patient2 → /bookings → Bayar kunjungan → /transactions (pilih booking, unggah bukti).",
      "Login admin → /transactions → Konfirmasi pembayaran.",
      "PT mulai/selesaikan sesi; pasien bisa menulis ulasan di /reviews/write.",
    ],
    links: [
      { label: "Booking", href: "/bookings" },
      { label: "Transaksi", href: "/transactions" },
    ],
  },
  {
    title: "Konsultasi online: terima → bayar → chat",
    actors: "physio1 + patient2 + admin",
    steps: [
      "Pasien buat konsultasi di /consultations atau dari profil terapis.",
      "PT terima permintaan; pasien bayar + bukti di /transactions.",
      "Admin konfirmasi; chat aktif di /chat.",
    ],
    links: [
      { label: "Konsultasi", href: "/consultations" },
      { label: "Chat", href: "/chat" },
    ],
  },
  {
    title: "Admin: verifikasi & moderasi",
    actors: "admin",
    steps: [
      "Verifikasi physio3 di /admin/physiotherapists.",
      "Moderasi ulasan di /admin/reviews; lacak aksi di /admin/audit-logs.",
      "Ringkasan di /admin/analytics.",
    ],
    links: [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Analytics", href: "/admin/analytics" },
    ],
  },
];

export const DEMO_PREFLIGHT_CHECKLIST = [
  "Backend GET /health → status ok, database connected",
  "npm run prisma:seed sudah dijalankan",
  "NEXT_PUBLIC_API_URL mengarah ke API yang hidup",
  "JWT_SECRET sama antara FE dan BE",
  "Halaman /status pada frontend menunjukkan hijau",
] as const;
