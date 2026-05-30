import type { MessageModule } from "./types";

export const physio: MessageModule = {
  id: {
    // Shared
    "physio.eyebrow": "Fisioterapis",
    "physio.restrictedTitle": "Akses terbatas",
    "physio.restrictedDesc": "Halaman ini hanya untuk akun fisioterapis.",
    "physio.backHome": "Kembali ke beranda",
    "physio.loading": "Memuat…",
    "physio.saving": "Menyimpan…",

    // Availability
    "physio.avail.errorLoad": "Gagal memuat slot.",
    "physio.avail.pickDate": "Pilih tanggal.",
    "physio.avail.startBeforeEnd": "Waktu mulai harus sebelum selesai.",
    "physio.avail.created": "Slot ketersediaan ditambahkan.",
    "physio.avail.errorCreate": "Gagal membuat slot.",
    "physio.avail.deleted": "Slot dihapus.",
    "physio.avail.errorDelete": "Gagal menghapus.",
    "physio.avail.signInRequired":
      "Silakan masuk untuk mengelola slot ketersediaan.",
    "physio.avail.restrictedEyebrow": "Jadwal",
    "physio.avail.backToProfile": "← Profil fisioterapis",
    "physio.avail.title": "Slot ketersediaan",
    "physio.avail.description":
      "Tambahkan rentang waktu yang bisa dipesan pasien. Pastikan waktu mulai lebih awal dari selesai.",
    "physio.avail.onlineNote":
      'Selama halaman ini terbuka, status "online" dikirim otomatis setiap menit agar pasien dapat memfilter terapis yang sedang aktif.',
    "physio.avail.addSlot": "Tambah slot",
    "physio.avail.date": "Tanggal",
    "physio.avail.start": "Mulai",
    "physio.avail.end": "Selesai",
    "physio.avail.slotList": "Daftar slot",
    "physio.avail.emptyTitle": "Belum ada slot",
    "physio.avail.emptyHint":
      "Pasien hanya bisa memilih waktu yang sudah Anda buka di sini.",
    "physio.avail.addSlotNow": "Tambah slot sekarang",
    "physio.avail.available": "Tersedia",
    "physio.avail.unavailable": "Tidak tersedia",
    "physio.avail.delete": "Hapus",
    "physio.avail.confirmTitle": "Hapus slot ketersediaan?",
    "physio.avail.confirmDesc":
      "Slot ini tidak lagi ditampilkan ke pasien. Booking yang sudah memakai slot tidak otomatis terpengaruh di demo ini.",
    "physio.avail.confirmYes": "Ya, hapus",
    "physio.avail.confirmNo": "Tidak jadi",

    // Profile
    "physio.profile.errorLoad": "Gagal memuat profil.",
    "physio.profile.saved":
      "Profil disimpan. Status verifikasi dapat kembali menunggu tinjauan admin.",
    "physio.profile.errorSave": "Gagal menyimpan.",
    "physio.profile.signInRequired":
      "Silakan masuk untuk mengelola profil fisioterapis.",
    "physio.profile.restrictedEyebrow": "Profil",
    "physio.profile.manageSlots": "Kelola slot jadwal →",
    "physio.profile.title": "Profil",
    "physio.profile.description":
      "Perbarui bio, tarif, dan data profesional. Isi hanya field yang ingin diubah; validasi panjang minimum tetap berlaku.",
    "physio.profile.onlineNote":
      'Tab ini juga menjaga status "online" untuk pasien (ping otomatis setiap menit).',
    "physio.profile.category": "Kategori",
    "physio.profile.choosePlaceholder": "— Pilih —",
    "physio.profile.bio": "Bio (min. 10 karakter jika diisi)",
    "physio.profile.education": "Pendidikan (min. 5 karakter jika diisi)",
    "physio.profile.experience": "Tahun pengalaman (0–60)",
    "physio.profile.certUrl": "URL sertifikasi",
    "physio.profile.license": "Nomor lisensi (min. 5 karakter jika diisi)",
    "physio.profile.consultationFee": "Biaya konsultasi online",
    "physio.profile.visitFee": "Biaya visit (klinik / kunjungan rumah)",
    "physio.profile.clinicAddress": "Alamat klinik (min. 10 karakter jika diisi)",
    "physio.profile.save": "Simpan profil",
  },
  en: {
    // Shared
    "physio.eyebrow": "Physiotherapist",
    "physio.restrictedTitle": "Restricted access",
    "physio.restrictedDesc": "This page is only for physiotherapist accounts.",
    "physio.backHome": "Back to home",
    "physio.loading": "Loading…",
    "physio.saving": "Saving…",

    // Availability
    "physio.avail.errorLoad": "Failed to load slots.",
    "physio.avail.pickDate": "Please select a date.",
    "physio.avail.startBeforeEnd": "Start time must be before the end time.",
    "physio.avail.created": "Availability slot added.",
    "physio.avail.errorCreate": "Failed to create slot.",
    "physio.avail.deleted": "Slot deleted.",
    "physio.avail.errorDelete": "Failed to delete.",
    "physio.avail.signInRequired":
      "Please sign in to manage your availability slots.",
    "physio.avail.restrictedEyebrow": "Schedule",
    "physio.avail.backToProfile": "← Physiotherapist profile",
    "physio.avail.title": "Availability slots",
    "physio.avail.description":
      "Add time ranges patients can book. Make sure the start time is earlier than the end time.",
    "physio.avail.onlineNote":
      'While this page is open, your "online" status is sent automatically every minute so patients can filter for active therapists.',
    "physio.avail.addSlot": "Add slot",
    "physio.avail.date": "Date",
    "physio.avail.start": "Start",
    "physio.avail.end": "End",
    "physio.avail.slotList": "Slot list",
    "physio.avail.emptyTitle": "No slots yet",
    "physio.avail.emptyHint":
      "Patients can only choose times you've opened here.",
    "physio.avail.addSlotNow": "Add a slot now",
    "physio.avail.available": "Available",
    "physio.avail.unavailable": "Unavailable",
    "physio.avail.delete": "Delete",
    "physio.avail.confirmTitle": "Delete this availability slot?",
    "physio.avail.confirmDesc":
      "This slot will no longer be shown to patients. Bookings that already use this slot are not automatically affected in this demo.",
    "physio.avail.confirmYes": "Yes, delete",
    "physio.avail.confirmNo": "Cancel",

    // Profile
    "physio.profile.errorLoad": "Failed to load profile.",
    "physio.profile.saved":
      "Profile saved. Verification status may return to awaiting admin review.",
    "physio.profile.errorSave": "Failed to save.",
    "physio.profile.signInRequired":
      "Please sign in to manage your physiotherapist profile.",
    "physio.profile.restrictedEyebrow": "Profile",
    "physio.profile.manageSlots": "Manage schedule slots →",
    "physio.profile.title": "Profile",
    "physio.profile.description":
      "Update your bio, fees, and professional details. Fill only the fields you want to change; minimum-length validation still applies.",
    "physio.profile.onlineNote":
      'This tab also keeps your "online" status active for patients (an automatic ping every minute).',
    "physio.profile.category": "Category",
    "physio.profile.choosePlaceholder": "— Select —",
    "physio.profile.bio": "Bio (min. 10 characters if filled)",
    "physio.profile.education": "Education (min. 5 characters if filled)",
    "physio.profile.experience": "Years of experience (0–60)",
    "physio.profile.certUrl": "Certification URL",
    "physio.profile.license": "License number (min. 5 characters if filled)",
    "physio.profile.consultationFee": "Online consultation fee",
    "physio.profile.visitFee": "Visit fee (clinic / home visit)",
    "physio.profile.clinicAddress": "Clinic address (min. 10 characters if filled)",
    "physio.profile.save": "Save profile",
  },
};
