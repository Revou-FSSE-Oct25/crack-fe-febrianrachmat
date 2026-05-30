import type { MessageModule } from "./types";

export const marketing: MessageModule = {
  id: {
    // about
    "mkt.aboutEyebrow": "Tentang kami",
    "mkt.aboutDesc":
      "Kami mendampingi perjalanan pemulihan gerak Anda — dari edukasi awal hingga program yang disesuaikan dengan kebutuhan fungsional.",
    "mkt.findPhysio": "Cari fisioterapis",
    "mkt.booking": "Booking",
    "mkt.aboutVisionTitle": "Visi",
    "mkt.aboutVisionBody":
      "Menjadi mitra terpercaya dalam pemulihan cedera, manajemen nyeri, dan peningkatan performa gerak melalui pendekatan berbasis bukti dan komunikasi yang jelas antara pasien dan fisioterapis.",
    "mkt.aboutOfferTitle": "Apa yang kami tawarkan",
    "mkt.aboutOffer1":
      "Booking kunjungan klinik atau home visit dengan slot terstruktur.",
    "mkt.aboutOffer2":
      "Konsultasi online dan chat setelah alur pembayaran demo selesai.",
    "mkt.aboutOffer3":
      "Profil terapis, kategori layanan, dan transparansi tarif (visit & konsultasi).",
    "mkt.aboutDemoTitle": "Demo aplikasi",
    "mkt.aboutDemoBody1": "Platform ini adalah",
    "mkt.aboutDemoProto": "prototype",
    "mkt.aboutDemoBody2":
      "untuk pembelajaran dan demonstrasi alur bisnis. Pembayaran bersifat dummy; baca juga",
    "mkt.aboutDemoPolicyLink": "kebijakan produk & demo",
    "mkt.makeAppointment": "Buat janji temu",
    "mkt.viewServices": "Lihat layanan",

    // services
    "mkt.servicesEyebrow": "Layanan",
    "mkt.servicesTitle": "Solusi gerak & pemulihan",
    "mkt.servicesDesc":
      "Pilih layanan yang sesuai fase pemulihan Anda. Tarif visit dan konsultasi online mengikuti profil fisioterapis dan dicatat saat booking dibuat.",
    "mkt.bookNow": "Booking sekarang",
    "mkt.serviceCard1Title": "Fisioterapi",
    "mkt.serviceCard1Desc":
      "Terapi gerak dan rehabilitasi untuk mengembalikan fungsi dan mobilitas setelah cedera atau operasi.",
    "mkt.serviceCard2Title": "Sports massage",
    "mkt.serviceCard2Desc":
      "Pijat olahraga untuk meredakan ketegangan otot dan mempercepat pemulihan pasca aktivitas.",
    "mkt.serviceCard3Title": "Performance training",
    "mkt.serviceCard3Desc":
      "Program latihan bertahap agar Anda kembali beraktivitas dengan aman dan percaya diri.",
    "mkt.servicesAfterTitle": "Setelah memilih layanan",
    "mkt.servicesAfterBody1":
      "Ingin diskusi singkat sebelum janji? Setelah masuk sebagai pasien, buka menu",
    "mkt.consultationLink": "Konsultasi",
    "mkt.servicesAfterBody2":
      "di pintasan atas. Atau lanjut ke booking untuk memilih slot dan terapis.",
    "mkt.goToConsultation": "Menuju konsultasi",

    // kebijakan
    "mkt.kebijakanEyebrow": "Informasi",
    "mkt.kebijakanTitle": "Kebijakan produk & demo",
    "mkt.kebijakanDesc":
      "Ringkasan untuk pengguna dan reviewer tugas. Perilaku sebenarnya mengikuti API backend dan dokumen teknis di repositori backend.",
    "mkt.kebijakanStatusTitle": "Status aplikasi",
    "mkt.kebijakanStatusBody1": "Kinova pada repositori ini adalah",
    "mkt.kebijakanStatusBodyProto": "demo / prototype",
    "mkt.kebijakanStatusBody2":
      "pemesanan fisioterapi dan konsultasi online. Pembayaran bersifat",
    "mkt.kebijakanStatusBodyDummy": "dummy",
    "mkt.kebijakanStatusBody3":
      "(tanpa gateway uang sungguhan). Data sebaiknya fiktif — jangan memasukkan rahasia medis atau pribadi sensitif.",
    "mkt.kebijakanRolesTitle": "Peran & alur singkat",
    "mkt.kebijakanRolePatientLabel": "Pasien:",
    "mkt.kebijakanRolePatientBody":
      "booking visit, ajukan konsultasi, lampirkan bukti bayar, pantau transaksi; chat mengikuti status konsultasi dan konfirmasi pembayaran.",
    "mkt.kebijakanRolePhysioLabel": "Fisioterapis:",
    "mkt.kebijakanRolePhysioBody":
      "kelola slot, terima/mutakhirkan status konsultasi dan booking sesuai aturan aplikasi.",
    "mkt.kebijakanRoleAdminLabel": "Admin:",
    "mkt.kebijakanRoleAdminBody":
      "konfirmasi pembayaran dummy dan refund hanya jika aturan status di API memungkinkan; moderasi ulasan dan tugas admin lain sesuai modul.",
    "mkt.kebijakanPaymentTitle": "Pembayaran & bukti",
    "mkt.kebijakanPaymentBody1": "Nominal transaksi ditetapkan",
    "mkt.kebijakanPaymentServer": "di server",
    "mkt.kebijakanPaymentBody2":
      "dari snapshot booking atau konsultasi. Pasien wajib melampirkan",
    "mkt.kebijakanPaymentProof": "bukti",
    "mkt.kebijakanPaymentBody3": "(unggah file atau tautan",
    "mkt.kebijakanPaymentBody4":
      ") sebelum transaksi pending dibuat. Admin hanya dapat menandai lunas jika bukti sudah tercatat.",
    "mkt.kebijakanPaymentBody5":
      "Unggahan file dapat tidak permanen di hosting cloud; untuk demo yang perlu tautan stabil, gunakan URL bukti di penyimpanan eksternal.",
    "mkt.kebijakanPrivacyTitle": "Privasi & disclaimer medis",
    "mkt.kebijakanPrivacyBody1":
      "Aplikasi memproses data akun, booking, konsultasi, chat, notifikasi, dan bukti pembayaran sebagaimana disimpan oleh backend. Ini",
    "mkt.kebijakanPrivacyNot": "bukan",
    "mkt.kebijakanPrivacyBody2": "layanan kesehatan resmi dan",
    "mkt.kebijakanPrivacyBody3":
      "pengganti diagnosis atau kunjungan langsung ke tenaga profesional.",
    "mkt.kebijakanDocsTitle": "Dokumen lengkap",
    "mkt.kebijakanDocsBody":
      "Versi penuh (Bahasa Indonesia) dengan penjelasan SLA, refund otomatis, dan rujukan ke dokumentasi teknis:",
    "mkt.kebijakanDocsLink": "product-policy.md di repositori backend (GitHub)",
    "mkt.kebijakanDocsFallback1":
      "Jika URL di atas tidak dapat diakses, buka file",
    "mkt.kebijakanDocsFallback2": "di clone lokal repositori backend.",
    "mkt.backToHome": "Kembali ke beranda",

    // demo
    "mkt.demoEyebrow": "Asesmen & presentasi",
    "mkt.demoTitle": "Panduan demo Kinova",
    "mkt.demoDesc":
      "Ringkasan akun seed, alur happy path, dan checklist sebelum demo. Pembayaran bersifat dummy; data mengikuti seed backend.",
    "mkt.demoChecklistTitle": "Checklist sebelum demo",
    "mkt.demoCheckStatus": "Cek status layanan",
    "mkt.demoPolicyBtn": "Kebijakan produk",
    "mkt.demoAccountsTitle": "Akun demo",
    "mkt.demoPasswordBody1": "Password default setelah",
    "mkt.demoColEmail": "Email",
    "mkt.demoColRole": "Peran",
    "mkt.demoColNote": "Catatan seed",
    "mkt.demoLoginBtn": "Masuk dengan akun demo",
    "mkt.demoHappyTitle": "Alur happy path",
    "mkt.demoE2EBody1": "E2E lokal: jalankan backend + seed, lalu",
    "mkt.demoE2EBody2":
      "di repo frontend. Lihat README untuk skenario booking, browse terapis, dan konsultasi.",

    // demo guide data (demo-guide.ts builders)
    "mkt.demoChecklist1": "Backend GET /health → status ok, database connected",
    "mkt.demoChecklist2": "npm run prisma:seed sudah dijalankan",
    "mkt.demoChecklist3": "NEXT_PUBLIC_API_URL mengarah ke API yang hidup",
    "mkt.demoChecklist4": "JWT_SECRET sama antara FE dan BE",
    "mkt.demoChecklist5": "Halaman /status pada frontend menunjukkan hijau",
    "mkt.demoAccAdminLabel": "Admin",
    "mkt.demoAccAdminNote":
      "Konfirmasi pembayaran, moderasi ulasan, verifikasi PT, audit log.",
    "mkt.demoAccPatient1Label": "Pasien 1",
    "mkt.demoAccPatient1Note":
      "Konsultasi IN_PROGRESS, booking selesai + ulasan, konsultasi selesai.",
    "mkt.demoAccPatient2Label": "Pasien 2",
    "mkt.demoAccPatient2Note":
      "Konsultasi ACCEPTED + booking PENDING — cocok alur bayar kunjungan.",
    "mkt.demoAccPhysio1Label": "Fisioterapis 1",
    "mkt.demoAccPhysio1Note":
      "Profil APPROVED, status online — terima konsultasi & chat.",
    "mkt.demoAccPhysio2Label": "Fisioterapis 2",
    "mkt.demoAccPhysio2Note": "Profil APPROVED — konfirmasi booking pasien 2.",
    "mkt.demoAccPhysio3Label": "Fisioterapis 3",
    "mkt.demoAccPhysio3Note": "Menunggu verifikasi admin (PENDING).",
    "mkt.demoFlow1Title": "Kunjungan: booking → bayar",
    "mkt.demoFlow1Step1": "Login physio2 → /bookings → Konfirmasi janji pasien.",
    "mkt.demoFlow1Step2":
      "Login patient2 → /bookings → Bayar kunjungan → /transactions (pilih booking, unggah bukti).",
    "mkt.demoFlow1Step3": "Login admin → /transactions → Konfirmasi pembayaran.",
    "mkt.demoFlow1Step4":
      "PT mulai/selesaikan sesi; pasien bisa menulis ulasan di /reviews/write.",
    "mkt.demoFlow2Title": "Konsultasi online: terima → bayar → chat",
    "mkt.demoFlow2Step1":
      "Pasien buat konsultasi di /consultations atau dari profil terapis.",
    "mkt.demoFlow2Step2": "PT terima permintaan; pasien bayar + bukti di /transactions.",
    "mkt.demoFlow2Step3": "Admin konfirmasi; chat aktif di /chat.",
    "mkt.demoFlow3Title": "Admin: verifikasi & moderasi",
    "mkt.demoFlow3Step1": "Verifikasi physio3 di /admin/physiotherapists.",
    "mkt.demoFlow3Step2":
      "Moderasi ulasan di /admin/reviews; lacak aksi di /admin/audit-logs.",
    "mkt.demoFlow3Step3": "Ringkasan di /admin/analytics.",
    "mkt.demoLinkBooking": "Booking",
    "mkt.demoLinkTransactions": "Transaksi",
    "mkt.demoLinkChat": "Chat",
    "mkt.demoLinkDashboard": "Dashboard",
    "mkt.demoLinkAnalytics": "Analytics",

    // status
    "mkt.statusEyebrow": "Operasional",
    "mkt.statusTitle": "Status layanan",
    "mkt.statusDesc":
      "Pemeriksaan koneksi ke backend Kinova (GET /health). Gunakan tombol periksa ulang saat menyiapkan demo.",
    "mkt.statusNotConnected": "Tidak terhubung",
    "mkt.statusHealthFailed": "Health check gagal",
    "mkt.statusUnreachable": "Tidak dapat menjangkau API.",
    "mkt.statusReady": "Layanan siap digunakan.",
    "mkt.statusCheckEnv":
      "Periksa NEXT_PUBLIC_API_URL dan status deploy backend.",
    "mkt.statusChecking": "Memeriksa…",
    "mkt.statusRecheck": "Periksa ulang",
    "mkt.demoGuideLink": "Panduan demo",
    "mkt.homeLink": "Beranda",

    // ApiHealthBanner
    "mkt.bannerUnreachable": "Backend tidak terjangkau dari browser ini.",
    "mkt.bannerDbDown": "Database backend terputus — beberapa fitur mungkin gagal.",
    "mkt.bannerLabel": "Perhatian demo:",
    "mkt.bannerClose": "Tutup",
  },
  en: {
    // about
    "mkt.aboutEyebrow": "About us",
    "mkt.aboutDesc":
      "We accompany your movement recovery journey — from early education to programs tailored to your functional needs.",
    "mkt.findPhysio": "Find a physiotherapist",
    "mkt.booking": "Booking",
    "mkt.aboutVisionTitle": "Vision",
    "mkt.aboutVisionBody":
      "To be a trusted partner in injury recovery, pain management, and movement performance improvement through an evidence-based approach and clear communication between patients and physiotherapists.",
    "mkt.aboutOfferTitle": "What we offer",
    "mkt.aboutOffer1":
      "Book clinic visits or home visits with structured slots.",
    "mkt.aboutOffer2":
      "Online consultation and chat after the demo payment flow is complete.",
    "mkt.aboutOffer3":
      "Therapist profiles, service categories, and transparent pricing (visit & consultation).",
    "mkt.aboutDemoTitle": "App demo",
    "mkt.aboutDemoBody1": "This platform is a",
    "mkt.aboutDemoProto": "prototype",
    "mkt.aboutDemoBody2":
      "for learning and demonstrating business flows. Payments are dummy; also read the",
    "mkt.aboutDemoPolicyLink": "product & demo policy",
    "mkt.makeAppointment": "Make an appointment",
    "mkt.viewServices": "View services",

    // services
    "mkt.servicesEyebrow": "Services",
    "mkt.servicesTitle": "Movement & recovery solutions",
    "mkt.servicesDesc":
      "Choose the service that matches your recovery phase. Visit and online consultation rates follow the physiotherapist's profile and are recorded when the booking is created.",
    "mkt.bookNow": "Book now",
    "mkt.serviceCard1Title": "Physiotherapy",
    "mkt.serviceCard1Desc":
      "Movement therapy and rehabilitation to restore function and mobility after injury or surgery.",
    "mkt.serviceCard2Title": "Sports massage",
    "mkt.serviceCard2Desc":
      "Sports massage to relieve muscle tension and speed up post-activity recovery.",
    "mkt.serviceCard3Title": "Performance training",
    "mkt.serviceCard3Desc":
      "A progressive training program so you can return to activity safely and confidently.",
    "mkt.servicesAfterTitle": "After choosing a service",
    "mkt.servicesAfterBody1":
      "Want a quick discussion before your appointment? After signing in as a patient, open the",
    "mkt.consultationLink": "Consultation",
    "mkt.servicesAfterBody2":
      "menu in the top shortcuts. Or continue to booking to choose a slot and therapist.",
    "mkt.goToConsultation": "Go to consultation",

    // kebijakan
    "mkt.kebijakanEyebrow": "Information",
    "mkt.kebijakanTitle": "Product & demo policy",
    "mkt.kebijakanDesc":
      "A summary for users and assignment reviewers. Actual behavior follows the backend API and the technical documents in the backend repository.",
    "mkt.kebijakanStatusTitle": "Application status",
    "mkt.kebijakanStatusBody1": "Kinova in this repository is a",
    "mkt.kebijakanStatusBodyProto": "demo / prototype",
    "mkt.kebijakanStatusBody2":
      "for physiotherapy booking and online consultation. Payments are",
    "mkt.kebijakanStatusBodyDummy": "dummy",
    "mkt.kebijakanStatusBody3":
      "(without a real money gateway). Data should be fictitious — do not enter medical secrets or sensitive personal information.",
    "mkt.kebijakanRolesTitle": "Roles & quick flow",
    "mkt.kebijakanRolePatientLabel": "Patient:",
    "mkt.kebijakanRolePatientBody":
      "book a visit, request a consultation, attach payment proof, monitor transactions; chat follows the consultation status and payment confirmation.",
    "mkt.kebijakanRolePhysioLabel": "Physiotherapist:",
    "mkt.kebijakanRolePhysioBody":
      "manage slots, accept/update consultation and booking statuses according to the app's rules.",
    "mkt.kebijakanRoleAdminLabel": "Admin:",
    "mkt.kebijakanRoleAdminBody":
      "confirm dummy payments and refunds only when the status rules in the API allow it; moderate reviews and handle other admin tasks per module.",
    "mkt.kebijakanPaymentTitle": "Payments & proof",
    "mkt.kebijakanPaymentBody1": "The transaction amount is set",
    "mkt.kebijakanPaymentServer": "on the server",
    "mkt.kebijakanPaymentBody2":
      "from the booking or consultation snapshot. The patient must attach",
    "mkt.kebijakanPaymentProof": "proof",
    "mkt.kebijakanPaymentBody3": "(upload a file or an",
    "mkt.kebijakanPaymentBody4":
      " link) before a pending transaction is created. Admins can only mark it as paid once the proof is recorded.",
    "mkt.kebijakanPaymentBody5":
      "Uploaded files may not be permanent on cloud hosting; for demos that need a stable link, use a proof URL in external storage.",
    "mkt.kebijakanPrivacyTitle": "Privacy & medical disclaimer",
    "mkt.kebijakanPrivacyBody1":
      "The app processes account, booking, consultation, chat, notification, and payment proof data as stored by the backend. This is",
    "mkt.kebijakanPrivacyNot": "not",
    "mkt.kebijakanPrivacyBody2": "an official health service and is",
    "mkt.kebijakanPrivacyBody3":
      "a substitute for diagnosis or an in-person visit to a professional.",
    "mkt.kebijakanDocsTitle": "Full document",
    "mkt.kebijakanDocsBody":
      "The full version (in Indonesian) with explanations of SLA, automatic refunds, and references to the technical documentation:",
    "mkt.kebijakanDocsLink": "product-policy.md in the backend repository (GitHub)",
    "mkt.kebijakanDocsFallback1":
      "If the URL above is not accessible, open the file",
    "mkt.kebijakanDocsFallback2": "in a local clone of the backend repository.",
    "mkt.backToHome": "Back to home",

    // demo
    "mkt.demoEyebrow": "Assessment & presentation",
    "mkt.demoTitle": "Kinova demo guide",
    "mkt.demoDesc":
      "A summary of seed accounts, happy path flows, and a pre-demo checklist. Payments are dummy; data follows the backend seed.",
    "mkt.demoChecklistTitle": "Pre-demo checklist",
    "mkt.demoCheckStatus": "Check service status",
    "mkt.demoPolicyBtn": "Product policy",
    "mkt.demoAccountsTitle": "Demo accounts",
    "mkt.demoPasswordBody1": "Default password after",
    "mkt.demoColEmail": "Email",
    "mkt.demoColRole": "Role",
    "mkt.demoColNote": "Seed note",
    "mkt.demoLoginBtn": "Sign in with a demo account",
    "mkt.demoHappyTitle": "Happy path flows",
    "mkt.demoE2EBody1": "Local E2E: run the backend + seed, then",
    "mkt.demoE2EBody2":
      "in the frontend repo. See the README for booking, browse therapists, and consultation scenarios.",

    // demo guide data (demo-guide.ts builders)
    "mkt.demoChecklist1": "Backend GET /health → status ok, database connected",
    "mkt.demoChecklist2": "npm run prisma:seed has been run",
    "mkt.demoChecklist3": "NEXT_PUBLIC_API_URL points to a live API",
    "mkt.demoChecklist4": "JWT_SECRET is the same between FE and BE",
    "mkt.demoChecklist5": "The /status page on the frontend shows green",
    "mkt.demoAccAdminLabel": "Admin",
    "mkt.demoAccAdminNote":
      "Confirm payments, moderate reviews, verify PTs, audit logs.",
    "mkt.demoAccPatient1Label": "Patient 1",
    "mkt.demoAccPatient1Note":
      "IN_PROGRESS consultation, completed booking + review, completed consultation.",
    "mkt.demoAccPatient2Label": "Patient 2",
    "mkt.demoAccPatient2Note":
      "ACCEPTED consultation + PENDING booking — suits the visit payment flow.",
    "mkt.demoAccPhysio1Label": "Physiotherapist 1",
    "mkt.demoAccPhysio1Note":
      "APPROVED profile, online status — accept consultations & chat.",
    "mkt.demoAccPhysio2Label": "Physiotherapist 2",
    "mkt.demoAccPhysio2Note": "APPROVED profile — confirm patient 2's booking.",
    "mkt.demoAccPhysio3Label": "Physiotherapist 3",
    "mkt.demoAccPhysio3Note": "Awaiting admin verification (PENDING).",
    "mkt.demoFlow1Title": "Visit: booking → payment",
    "mkt.demoFlow1Step1":
      "Log in as physio2 → /bookings → Confirm the patient's appointment.",
    "mkt.demoFlow1Step2":
      "Log in as patient2 → /bookings → Pay for the visit → /transactions (choose booking, upload proof).",
    "mkt.demoFlow1Step3": "Log in as admin → /transactions → Confirm the payment.",
    "mkt.demoFlow1Step4":
      "The PT starts/finishes the session; the patient can write a review at /reviews/write.",
    "mkt.demoFlow2Title": "Online consultation: accept → pay → chat",
    "mkt.demoFlow2Step1":
      "The patient creates a consultation at /consultations or from a therapist's profile.",
    "mkt.demoFlow2Step2":
      "The PT accepts the request; the patient pays + uploads proof at /transactions.",
    "mkt.demoFlow2Step3": "The admin confirms; chat becomes active at /chat.",
    "mkt.demoFlow3Title": "Admin: verification & moderation",
    "mkt.demoFlow3Step1": "Verify physio3 at /admin/physiotherapists.",
    "mkt.demoFlow3Step2":
      "Moderate reviews at /admin/reviews; track actions at /admin/audit-logs.",
    "mkt.demoFlow3Step3": "Summary at /admin/analytics.",
    "mkt.demoLinkBooking": "Booking",
    "mkt.demoLinkTransactions": "Transactions",
    "mkt.demoLinkChat": "Chat",
    "mkt.demoLinkDashboard": "Dashboard",
    "mkt.demoLinkAnalytics": "Analytics",

    // status
    "mkt.statusEyebrow": "Operational",
    "mkt.statusTitle": "Service status",
    "mkt.statusDesc":
      "Connection check to the Kinova backend (GET /health). Use the recheck button while preparing the demo.",
    "mkt.statusNotConnected": "Not connected",
    "mkt.statusHealthFailed": "Health check failed",
    "mkt.statusUnreachable": "Unable to reach the API.",
    "mkt.statusReady": "The service is ready to use.",
    "mkt.statusCheckEnv":
      "Check NEXT_PUBLIC_API_URL and the backend deploy status.",
    "mkt.statusChecking": "Checking…",
    "mkt.statusRecheck": "Recheck",
    "mkt.demoGuideLink": "Demo guide",
    "mkt.homeLink": "Home",

    // ApiHealthBanner
    "mkt.bannerUnreachable": "The backend is unreachable from this browser.",
    "mkt.bannerDbDown":
      "The backend database is disconnected — some features may fail.",
    "mkt.bannerLabel": "Demo notice:",
    "mkt.bannerClose": "Close",
  },
};
