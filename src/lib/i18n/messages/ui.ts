import type { MessageModule } from "./types";

export const ui: MessageModule = {
  id: {
    // Loading labels
    "ui.loading": "Memuat…",
    "ui.loadingConversation": "Memuat percakapan…",
    "ui.loadingAnalytics": "Memuat analytics…",
    "ui.loadingAuditLog": "Memuat audit log…",
    "ui.loadingAdminPanel": "Memuat panel admin…",
    "ui.loadingPhysiotherapistPage": "Memuat halaman fisioterapis…",
    "ui.loadingReviews": "Memuat ulasan…",
    "ui.loadingNotifications": "Memuat notifikasi…",
    "ui.loadingProfile": "Memuat profil…",
    "ui.loadingChatList": "Memuat daftar chat…",
    "ui.loadingTherapists": "Memuat fisioterapis…",
    "ui.loadingTherapistProfile": "Memuat profil fisioterapis…",
    "ui.loadingTransactions": "Memuat transaksi…",
    "ui.loadingConsultations": "Memuat konsultasi…",
    "ui.loadingBookings": "Memuat booking…",

    // Error boundary
    "ui.errorEyebrow": "Terjadi kesalahan",
    "ui.errorTitle": "Maaf, ada yang tidak beres",
    "ui.errorDescription":
      "Halaman ini gagal dimuat. Anda bisa mencoba lagi atau kembali ke beranda.",
    "ui.tryAgain": "Coba lagi",
    "ui.toHome": "Ke beranda",

    // Not found (404)
    "ui.notFoundTitle": "Halaman tidak ditemukan",
    "ui.notFoundDesc": "Alamat yang Anda buka tidak ada atau sudah dipindahkan.",
    "ui.findTherapist": "Cari terapis",

    // Load error card
    "ui.failedToLoadData": "Gagal memuat data",
    "ui.checkApiStatus": "Cek status API",

    // Sign in required
    "ui.signInToContinue": "Silakan masuk untuk melanjutkan.",
    "ui.signIn": "Masuk",
    "ui.register": "Daftar",

    // Confirm dialog
    "ui.confirm": "Konfirmasi",
    "ui.cancel": "Batal",
    "ui.closeDialog": "Tutup dialog",
    "ui.processing": "Memproses…",

    // Page shell
    "ui.adminNav": "Navigasi admin",

    // Shortcut bar
    "ui.shortcutGuestPrompt": "Siap konsultasi atau booking sesi fisioterapi?",
    "ui.makeAppointment": "Buat janji temu",
    "ui.findPhysiotherapist": "Cari fisioterapis",
    "ui.operations": "Operasional",
    "ui.verifyPt": "Verifikasi PT",
    "ui.categories": "Kategori",
    "ui.reviews": "Ulasan",
    "ui.consultations": "Konsultasi",
    "ui.calendar": "Kalender",
    "ui.bookingList": "Daftar booking",
    "ui.transactions": "Transaksi",
    "ui.notifications": "Notifikasi",
    "ui.activity": "Aktivitas",
    "ui.physiotherapists": "Fisioterapis",
    "ui.myReviews": "Ulasan saya",
    "ui.writeReview": "Tulis ulasan",
    "ui.ptProfile": "Profil PT",
    "ui.slotSchedule": "Jadwal slot",
    "ui.myProfile": "Profil saya",
    "ui.forYou": "Untuk Anda",
    "ui.appointmentForm": "Form janji temu",
    "ui.services": "Layanan",
    "ui.quick": "Cepat",
    "ui.shortcuts": "Pintasan",
    "ui.greetingHello": "Halo,",
    "ui.newBooking": "Booking / janji baru",
    "ui.adminDashboard": "Dashboard admin",
    "ui.manageSchedule": "Kelola jadwal",
  },
  en: {
    // Loading labels
    "ui.loading": "Loading…",
    "ui.loadingConversation": "Loading conversation…",
    "ui.loadingAnalytics": "Loading analytics…",
    "ui.loadingAuditLog": "Loading audit log…",
    "ui.loadingAdminPanel": "Loading admin panel…",
    "ui.loadingPhysiotherapistPage": "Loading physiotherapist page…",
    "ui.loadingReviews": "Loading reviews…",
    "ui.loadingNotifications": "Loading notifications…",
    "ui.loadingProfile": "Loading profile…",
    "ui.loadingChatList": "Loading chat list…",
    "ui.loadingTherapists": "Loading physiotherapists…",
    "ui.loadingTherapistProfile": "Loading physiotherapist profile…",
    "ui.loadingTransactions": "Loading transactions…",
    "ui.loadingConsultations": "Loading consultations…",
    "ui.loadingBookings": "Loading bookings…",

    // Error boundary
    "ui.errorEyebrow": "An error occurred",
    "ui.errorTitle": "Sorry, something went wrong",
    "ui.errorDescription":
      "This page failed to load. You can try again or return to the home page.",
    "ui.tryAgain": "Try again",
    "ui.toHome": "To home",

    // Not found (404)
    "ui.notFoundTitle": "Page not found",
    "ui.notFoundDesc": "The address you opened does not exist or has been moved.",
    "ui.findTherapist": "Find a therapist",

    // Load error card
    "ui.failedToLoadData": "Failed to load data",
    "ui.checkApiStatus": "Check API status",

    // Sign in required
    "ui.signInToContinue": "Please sign in to continue.",
    "ui.signIn": "Sign in",
    "ui.register": "Register",

    // Confirm dialog
    "ui.confirm": "Confirm",
    "ui.cancel": "Cancel",
    "ui.closeDialog": "Close dialog",
    "ui.processing": "Processing…",

    // Page shell
    "ui.adminNav": "Admin navigation",

    // Shortcut bar
    "ui.shortcutGuestPrompt":
      "Ready to consult or book a physiotherapy session?",
    "ui.makeAppointment": "Make an appointment",
    "ui.findPhysiotherapist": "Find a physiotherapist",
    "ui.operations": "Operations",
    "ui.verifyPt": "Verify PT",
    "ui.categories": "Categories",
    "ui.reviews": "Reviews",
    "ui.consultations": "Consultations",
    "ui.calendar": "Calendar",
    "ui.bookingList": "Booking list",
    "ui.transactions": "Transactions",
    "ui.notifications": "Notifications",
    "ui.activity": "Activity",
    "ui.physiotherapists": "Physiotherapists",
    "ui.myReviews": "My reviews",
    "ui.writeReview": "Write a review",
    "ui.ptProfile": "PT profile",
    "ui.slotSchedule": "Slot schedule",
    "ui.myProfile": "My profile",
    "ui.forYou": "For you",
    "ui.appointmentForm": "Appointment form",
    "ui.services": "Services",
    "ui.quick": "Quick",
    "ui.shortcuts": "Shortcuts",
    "ui.greetingHello": "Hello,",
    "ui.newBooking": "New booking / appointment",
    "ui.adminDashboard": "Admin dashboard",
    "ui.manageSchedule": "Manage schedule",
  },
};
