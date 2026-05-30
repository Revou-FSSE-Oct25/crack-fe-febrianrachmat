import type { MessageModule } from "./types";

export const booking: MessageModule = {
  id: {
    // status-meta: booking status
    "booking.status.booking.pending": "Menunggu",
    "booking.status.booking.confirmed": "Dikonfirmasi",
    "booking.status.booking.inProgress": "Berlangsung",
    "booking.status.booking.completed": "Selesai",
    "booking.status.booking.cancelled": "Dibatalkan",
    // status-meta: transaction status
    "booking.status.transaction.pending": "Menunggu konfirmasi",
    "booking.status.transaction.paid": "Lunas",
    "booking.status.transaction.refunded": "Direfund",
    "booking.status.transaction.failed": "Gagal",
    // status-meta: therapist verification status
    "booking.status.therapistVerification.pending": "Menunggu verifikasi",
    "booking.status.therapistVerification.approved": "Disetujui",
    "booking.status.therapistVerification.rejected": "Ditolak",
    // status-meta: consultation status
    "booking.status.consultation.requested": "Menunggu terapis",
    "booking.status.consultation.accepted": "Menunggu pembayaran",
    "booking.status.consultation.inProgress": "Sesi aktif",
    "booking.status.consultation.completed": "Selesai",
    "booking.status.consultation.cancelled": "Dibatalkan",
    // status-meta: appointment type
    "booking.appointmentType.clinicVisit": "Kunjungan klinik",
    "booking.appointmentType.homeVisit": "Home visit",

    // booking-flow: patient booking hints
    "booking.flow.bookingPatient.pending":
      "Menunggu fisioterapis mengonfirmasi janji. Pembayaran dibuka setelah dikonfirmasi.",
    "booking.flow.bookingPatient.confirmedAttachProof":
      "Janji dikonfirmasi. Lampirkan bukti bayar di halaman Transaksi.",
    "booking.flow.bookingPatient.confirmedWaiting":
      "Bukti bayar terkirim. Menunggu konfirmasi admin.",
    "booking.flow.bookingPatient.sessionRunning":
      "Sesi berjalan atau selesai — jika belum bayar, buat transaksi di halaman Transaksi.",
    // booking-flow: therapist booking hints
    "booking.flow.bookingTherapist.pending":
      "Konfirmasi janji agar pasien dapat melakukan pembayaran kunjungan.",
    "booking.flow.bookingTherapist.confirmed":
      "Pasien dapat membayar di menu Transaksi. Anda dapat memulai sesi setelah pembayaran dikonfirmasi admin.",
    "booking.flow.bookingTherapist.inProgress":
      "Sesi kunjungan berlangsung. Tandai selesai setelah pertemuan.",
    // booking-flow: patient consultation hints
    "booking.flow.consultationPatient.requested":
      "Menunggu fisioterapis menerima. Pembayaran dibuka setelah diterima.",
    "booking.flow.consultationPatient.acceptedAttach":
      "Terapis sudah menerima. Lampirkan bukti transfer lalu bayar untuk membuka chat.",
    "booking.flow.consultationPatient.acceptedWaiting":
      "Bukti bayar terkirim. Menunggu konfirmasi admin — pantau di halaman Transaksi.",
    "booking.flow.consultationPatient.inProgress":
      "Pembayaran dikonfirmasi. Chat aktif.",
    // booking-flow: therapist consultation hints
    "booking.flow.consultationTherapist.requested":
      "Terima permintaan agar pasien dapat membayar konsultasi.",
    "booking.flow.consultationTherapist.acceptedWaiting":
      "Menunggu pasien membayar dan admin mengonfirmasi pembayaran.",
    "booking.flow.consultationTherapist.acceptedProofSent":
      "Pasien sudah mengirim bukti bayar. Menunggu konfirmasi admin sebelum chat terbuka.",
    "booking.flow.consultationTherapist.inProgress":
      "Sesi konsultasi aktif — pasien dapat menggunakan chat.",
    // booking-flow: consultation patient label
    "booking.flow.consultationLabel.waitingAdmin": "Menunggu konfirmasi admin",
    "booking.flow.consultationLabel.readyToPay": "Siap dibayar",

    // BookingForm
    "booking.form.loading": "Memuat…",
    "booking.form.signIn.prefix": "Silakan masuk sebagai",
    "booking.form.signIn.role": "pasien",
    "booking.form.signIn.suffix": "untuk membuat booking.",
    "booking.form.signInButton": "Masuk",
    "booking.form.onlyPatient":
      "Hanya akun pasien yang dapat membuat booking melalui halaman ini.",
    "booking.form.error.forbidden":
      "Peran akun Anda tidak dapat mengakses daftar fisioterapis di endpoint ini (diperlukan Pasien atau Admin).",
    "booking.form.error.loadData": "Gagal memuat data.",
    "booking.form.error.loadSlots": "Gagal memuat slot.",
    "booking.form.error.invalidDate": "Tanggal/janji tidak valid.",
    "booking.form.error.submitFailed": "Booking gagal.",
    "booking.form.success":
      "Booking dibuat. Menunggu konfirmasi fisioterapis — setelah dikonfirmasi, bayar di halaman Transaksi dengan bukti pembayaran.",
    "booking.form.formAriaLabel": "Form booking janji temu",
    "booking.form.section.chooseTherapist": "Pilih fisioterapis",
    "booking.form.section.chooseTherapistHint":
      "Saring kategori lalu pilih terapis. Tarif di bawah mengikuti snapshot profil saat ini.",
    "booking.form.label.filterCategory": "Filter kategori",
    "booking.form.option.allCategories": "Semua kategori",
    "booking.form.label.physiotherapist": "Fisioterapis",
    "booking.form.option.choose": "— Pilih —",
    "booking.form.therapistRate.label": "Tarif terapis ini:",
    "booking.form.therapistRate.online": "konsultasi online",
    "booking.form.therapistRate.visit": "visit",
    "booking.form.therapistRate.frozen": "(dibekukan pada saat booking dibuat).",
    "booking.form.section.schedule": "Jadwal kunjungan",
    "booking.form.label.appointmentType": "Tipe janji",
    "booking.form.label.slot": "Slot tersedia (opsional)",
    "booking.form.loadingSlots": "Memuat slot…",
    "booking.form.option.noSlot": "Tanpa slot — gunakan waktu manual di bawah",
    "booking.form.label.appointmentTime":
      "Waktu janji (wajib jika tidak memilih slot)",
    "booking.form.section.locationNotes": "Lokasi & catatan",
    "booking.form.label.clinicAddress": "Alamat klinik (min. 10 karakter)",
    "booking.form.label.homeAddress":
      "Alamat kunjungan rumah (min. 10 karakter)",
    "booking.form.label.notes": "Catatan",
    "booking.form.findInTherapistList": "Cari di daftar terapis",
    "booking.form.submitting": "Mengirim…",
    "booking.form.submit": "Buat booking",

    // PaymentProofLink
    "booking.proofLink.none": "Belum ada bukti terlampir pada transaksi ini.",
    "booking.proofLink.error": "Gagal membuka bukti pembayaran.",
    "booking.proofLink.opening": "Membuka bukti…",
    "booking.proofLink.view": "Lihat bukti pembayaran",

    // appointment page
    "booking.appointment.eyebrow": "Booking",
    "booking.appointment.title": "Buat janji temu",
    "booking.appointment.description":
      "Pilih fisioterapis, tipe kunjungan, dan slot atau waktu manual. Setelah terapis mengonfirmasi, bayar kunjungan di halaman Transaksi dengan bukti pembayaran.",

    // bookings page
    "booking.bookings.toast.confirmed":
      "Booking dikonfirmasi. Pasien dapat membayar kunjungan.",
    "booking.bookings.toast.started": "Sesi dimulai.",
    "booking.bookings.toast.completed": "Booking ditandai selesai.",
    "booking.bookings.error.update": "Gagal memperbarui booking.",
    "booking.bookings.toast.cancelled": "Booking dibatalkan.",
    "booking.bookings.error.cancel": "Gagal membatalkan booking.",
    "booking.bookings.error.loadRescheduleSlots":
      "Gagal memuat slot reschedule.",
    "booking.bookings.error.pickSlotOrManual":
      "Pilih slot baru atau isi waktu janji manual.",
    "booking.bookings.error.invalidRescheduleTime":
      "Waktu reschedule tidak valid.",
    "booking.bookings.error.rescheduleFuture":
      "Waktu reschedule harus di masa depan.",
    "booking.bookings.toast.rescheduled": "Booking berhasil di-reschedule.",
    "booking.bookings.error.reschedule": "Gagal reschedule booking.",
    "booking.bookings.signIn": "Silakan masuk untuk melihat booking Anda.",
    "booking.bookings.reschedule.notChosen": "Belum dipilih",
    "booking.bookings.reschedule.invalidFormat": "Format waktu belum valid",
    "booking.bookings.desc.patient":
      "Alur kunjungan: buat janji → terapis konfirmasi → bayar dengan bukti di Transaksi → sesi kunjungan.",
    "booking.bookings.desc.pt":
      "Konfirmasi permintaan pasien, lalu kelola sesi kunjungan. Pasien membayar setelah Anda mengonfirmasi.",
    "booking.bookings.desc.admin":
      "Kelola janji temu. Pasien dapat membatalkan sebelum selesai; fisioterapis memperbarui alur sesi.",
    "booking.bookings.eyebrow": "Janji temu",
    "booking.bookings.title": "Booking",
    "booking.bookings.link.calendar": "Kalender",
    "booking.bookings.link.newAppointment": "Janji baru",
    "booking.bookings.link.transactions": "Transaksi",
    "booking.bookings.link.findTherapist": "Cari terapis",
    "booking.bookings.link.manageSlots": "Kelola jadwal slot",
    "booking.bookings.empty.title": "Belum ada booking",
    "booking.bookings.empty.hintPatient":
      "Buat janji temu baru atau cari fisioterapis yang sesuai kebutuhan Anda.",
    "booking.bookings.empty.hintPt":
      "Booking baru akan muncul ketika pasien menyelesaikan alur janji temu.",
    "booking.bookings.action.newAppointment": "Buat janji baru",
    "booking.bookings.action.findTherapist": "Cari fisioterapis",
    "booking.bookings.action.manageSlots": "Kelola jadwal slot",
    "booking.bookings.label.location": "Lokasi: ",
    "booking.bookings.label.notes": "Catatan: ",
    "booking.bookings.btn.cancel": "Batalkan booking",
    "booking.bookings.btn.reschedule": "Reschedule",
    "booking.bookings.rescheduleDisabled":
      "Reschedule dinonaktifkan karena transaksi booking ini masih aktif.",
    "booking.bookings.btn.payVisit": "Bayar kunjungan",
    "booking.bookings.btn.viewPayment": "Lihat status pembayaran",
    "booking.bookings.btn.confirm": "Konfirmasi",
    "booking.bookings.btn.startSession": "Mulai sesi",
    "booking.bookings.btn.complete": "Selesai",
    "booking.bookings.confirm.title": "Batalkan booking?",
    "booking.bookings.confirm.desc":
      "Janji temu akan dibatalkan. Anda tidak bisa mengembalikan status ini setelah dibatalkan.",
    "booking.bookings.confirm.yes": "Ya, batalkan",
    "booking.bookings.confirm.no": "Tidak jadi",
    "booking.bookings.reschedule.closeAria": "Tutup reschedule",
    "booking.bookings.reschedule.title": "Reschedule booking",
    "booking.bookings.reschedule.subtitle": "Pilih slot baru atau atur waktu manual.",
    "booking.bookings.reschedule.oldSchedule": "Jadwal lama:",
    "booking.bookings.reschedule.newSchedule": "Jadwal baru:",
    "booking.bookings.reschedule.loadingSlots": "Memuat slot terbaru…",
    "booking.bookings.reschedule.noSlot": "Tanpa slot (isi waktu manual)",
    "booking.bookings.reschedule.cancel": "Batal",
    "booking.bookings.reschedule.saving": "Menyimpan...",
    "booking.bookings.reschedule.save": "Simpan jadwal baru",

    // transactions page
    "booking.tx.error.pickBooking": "Pilih booking.",
    "booking.tx.toast.created": "Transaksi dibuat. Menunggu konfirmasi admin.",
    "booking.tx.error.create": "Gagal membuat transaksi.",
    "booking.tx.toast.paymentConfirmed": "Pembayaran dikonfirmasi.",
    "booking.tx.error.confirm": "Gagal mengonfirmasi pembayaran.",
    "booking.tx.toast.refunded": "Refund berhasil diproses (dummy).",
    "booking.tx.error.refund": "Gagal refund.",
    "booking.tx.signIn": "Silakan masuk untuk melihat transaksi.",
    "booking.tx.eyebrow": "Pembayaran",
    "booking.tx.title": "Transaksi",
    "booking.tx.pt.desc":
      "Daftar transaksi tersedia untuk Pasien dan Admin. Akun fisioterapis tidak menggunakan halaman ini.",
    "booking.tx.pt.note":
      "Gunakan pintasan di bawah navbar untuk konsultasi, booking, dan chat. Pembayaran dilakukan oleh pasien melalui menu Transaksi di akun mereka.",
    "booking.tx.link.bookings": "Daftar booking",
    "booking.tx.link.consultations": "Konsultasi",
    "booking.tx.desc.admin":
      "Konfirmasi pembayaran dummy dan refund untuk transaksi yang memenuhi syarat.",
    "booking.tx.desc.patient":
      "Bayar kunjungan setelah fisioterapis mengonfirmasi booking. Nominal mengikuti tarif visit saat booking dibuat. Konfirmasi lunas oleh admin.",
    "booking.tx.create.title": "Buat transaksi (dummy)",
    "booking.tx.create.bookingLabel": "Booking & tarif visit",
    "booking.tx.create.chooseBooking": "— Pilih booking —",
    "booking.tx.create.noPendingBefore":
      "Belum ada booking yang dikonfirmasi terapis. Cek status di",
    "booking.tx.create.methodLabel": "Metode bayar",
    "booking.tx.method.bankTransfer": "Bank transfer",
    "booking.tx.method.eWallet": "E-wallet",
    "booking.tx.method.creditCard": "Kartu kredit",
    "booking.tx.create.proofLabel": "Bukti pembayaran (wajib)",
    "booking.tx.create.proofHint":
      "Unggah screenshot/struk, atau tautan https ke bukti di cloud storage. Salah satu wajib diisi sebelum transaksi dibuat.",
    "booking.tx.create.proofPlaceholder": "https://contoh.com/bukti-bayar.png",
    "booking.tx.create.saving": "Menyimpan…",
    "booking.tx.create.submit": "Buat transaksi",
    "booking.tx.create.footer1": "Pembayaran untuk",
    "booking.tx.create.footerOnline": "konsultasi online",
    "booking.tx.create.footer2": "dibuat dari halaman",
    "booking.tx.create.footer3":
      "setelah terapis menerima. Formulir di atas hanya untuk transaksi",
    "booking.tx.create.footerBooking": "booking kunjungan",
    "booking.tx.create.footer4":
      "Bukti bayar wajib; konfirmasi lunas oleh admin.",
    "booking.tx.list.title": "Daftar transaksi",
    "booking.tx.admin.seg1": "Transaksi",
    "booking.tx.admin.seg2":
      "dengan bukti terlampir: konfirmasi pembayaran dummy lewat tombol di bawah (",
    "booking.tx.admin.seg3": "). Transaksi",
    "booking.tx.admin.seg4": ": refund dummy lewat",
    "booking.tx.admin.seg5": "(alasan min. 5 karakter).",
    "booking.tx.empty.title": "Belum ada transaksi",
    "booking.tx.empty.hintPatient":
      "Setelah terapis mengonfirmasi booking, buat transaksi pembayaran dari formulir di atas.",
    "booking.tx.empty.hintAdmin":
      "Transaksi dari pasien akan muncul di sini untuk dikonfirmasi.",
    "booking.tx.action.myBookings": "Lihat booking saya",
    "booking.tx.action.newAppointment": "Buat janji baru",
    "booking.tx.action.backDashboard": "Kembali ke dashboard",
    "booking.tx.item.waitingAdmin": "Menunggu konfirmasi pembayaran dari admin",
    "booking.tx.item.confirmDisabled":
      "Konfirmasi bayar dinonaktifkan sampai pasien melampirkan bukti (URL atau unggahan).",
    "booking.tx.item.processing": "Memproses…",
    "booking.tx.item.confirmPay": "Konfirmasi pembayaran (dummy)",
    "booking.tx.item.refundReasonLabel": "Alasan refund (min. 5 karakter)",
    "booking.tx.item.refundPlaceholder":
      "Contoh: Permintaan pembatalan dari pasien.",
    "booking.tx.item.refundBtn": "Refund (dummy)",
    "booking.tx.confirm.title": "Proses refund?",
    "booking.tx.confirm.desc":
      "Transaksi akan ditandai refund (dummy). Pastikan alasan refund sudah benar — tindakan ini untuk keperluan demo admin.",
    "booking.tx.confirm.yes": "Ya, refund",
    "booking.tx.confirm.no": "Tidak jadi",

    // calendar page
    "booking.cal.error.load": "Gagal memuat kalender.",
    "booking.cal.error.export": "Gagal mengekspor kalender.",
    "booking.cal.signIn": "Silakan masuk untuk melihat kalender janji temu.",
    "booking.cal.hint.patient":
      "Janji temu Anda dengan fisioterapis. Pengingat H-1 dikirim lewat notifikasi in-app (sekitar 24 jam sebelum waktu janji).",
    "booking.cal.hint.pt":
      "Jadwal kunjungan pasien Anda. Pengingat H-1 dikirim ke Anda dan pasien lewat notifikasi.",
    "booking.cal.hint.admin": "Semua janji temu dalam rentang bulan (admin).",
    "booking.cal.eyebrow": "Janji temu",
    "booking.cal.title": "Kalender",
    "booking.cal.link.bookings": "Daftar booking",
    "booking.cal.link.newAppointment": "Janji baru",
    "booking.cal.prevMonth": "Bulan sebelumnya",
    "booking.cal.nextMonth": "Bulan berikutnya",
    "booking.cal.today": "Hari ini",
    "booking.cal.exporting": "Mengekspor…",
    "booking.cal.downloadIcs": "Unduh .ics",
    "booking.cal.icsNote":
      "File .ics berisi janji temu bulan ini (kecuali dibatalkan). Impor ke Google Calendar, Apple Calendar, atau Outlook.",
    "booking.cal.empty.title": "Tidak ada janji di bulan ini",
    "booking.cal.empty.hint": "Buat booking baru atau pilih bulan lain.",

    // consultations page
    "booking.cons.error.pickTherapist": "Pilih fisioterapis.",
    "booking.cons.error.fastOnline":
      "Respons cepat (10 menit) hanya jika terapis sedang online. Pilih Standar atau pilih terapis dari daftar yang punya badge Online.",
    "booking.cons.toast.requested":
      "Permintaan konsultasi terkirim. Fisioterapis mendapat notifikasi.",
    "booking.cons.error.create": "Gagal membuat konsultasi.",
    "booking.cons.error.openChat": "Gagal membuka chat.",
    "booking.cons.toast.accepted": "Permintaan diterima. Pasien dapat membayar.",
    "booking.cons.toast.completed": "Konsultasi ditandai selesai.",
    "booking.cons.error.update": "Gagal memperbarui status.",
    "booking.cons.toast.cancelled": "Konsultasi dibatalkan.",
    "booking.cons.error.cancel": "Gagal membatalkan konsultasi.",
    "booking.cons.error.unknownFee":
      "Biaya konsultasi tidak diketahui untuk sesi ini.",
    "booking.cons.toast.paid":
      "Pembayaran terkirim. Admin akan mengonfirmasi; pantau di halaman Transaksi.",
    "booking.cons.error.pay": "Gagal membuat pembayaran.",
    "booking.cons.signIn": "Silakan masuk untuk melihat konsultasi.",
    "booking.cons.eyebrow": "Telehealth",
    "booking.cons.title": "Konsultasi",
    "booking.cons.desc.pt":
      "Terima permintaan pasien, tunggu pembayaran & konfirmasi admin, lalu sesi chat aktif.",
    "booking.cons.desc.admin":
      "Pantau permintaan konsultasi online di seluruh platform.",
    "booking.cons.desc.patient":
      "Ajukan keluhan awal, bayar setelah terapis menerima, lalu mulai sesi chat setelah admin mengonfirmasi pembayaran.",
    "booking.cons.link.findTherapist": "Cari fisioterapis",
    "booking.cons.link.chatList": "Daftar chat",
    "booking.cons.form.title": "Ajukan konsultasi baru",
    "booking.cons.form.flowPrefix": "Alur:",
    "booking.cons.form.flowAccept": "terapis menerima",
    "booking.cons.form.flowYou": "kamu",
    "booking.cons.form.flowAttach": "lampirkan bukti bayar",
    "booking.cons.form.flowThen": "lalu",
    "booking.cons.form.flowPay": "bayar",
    "booking.cons.form.flowSuffix":
      "chat otomatis aktif setelah pembayaran dikonfirmasi admin.",
    "booking.cons.form.therapistLabel": "Fisioterapis",
    "booking.cons.form.choose": "— Pilih —",
    "booking.cons.form.slaLegend": "Batas waktu balasan terapis setelah bayar",
    "booking.cons.form.standardTitle": "Standar (24 jam)",
    "booking.cons.form.standardDesc":
      "— cocok jika kamu memilih terapis tertentu; balasan bisa lebih lama.",
    "booking.cons.form.fastTitle": "Respons cepat (~10 menit)",
    "booking.cons.form.fastDescBefore": "— hanya jika terapis sedang",
    "booking.cons.form.fastOnlineWord": "online",
    "booking.cons.form.fastDescAfter":
      "(badge Online). Jika tidak ada balasan, pembayaran dikembalikan otomatis oleh sistem.",
    "booking.cons.form.complaintLabel": "Keluhan (min. 10 karakter)",
    "booking.cons.form.sending": "Mengirim…",
    "booking.cons.form.send": "Kirim",
    "booking.cons.list.title": "Daftar konsultasi",
    "booking.cons.empty.title": "Belum ada konsultasi",
    "booking.cons.empty.hintPatient":
      "Mulai dengan mengajukan keluhan awal ke fisioterapis pilihan Anda.",
    "booking.cons.empty.hintOther":
      "Permintaan dari pasien akan muncul di sini setelah mereka mengajukan konsultasi.",
    "booking.cons.action.request": "Ajukan konsultasi",
    "booking.cons.action.findTherapist": "Cari fisioterapis",
    "booking.cons.action.manageProfile": "Kelola profil",
    "booking.cons.item.fee": "Biaya:",
    "booking.cons.item.sla": "SLA:",
    "booking.cons.item.slaFast": "cepat (~10 min)",
    "booking.cons.item.slaStandard": "standar (~24 jam)",
    "booking.cons.btn.viewPayment": "Lihat status pembayaran",
    "booking.cons.pay.proofLabel": "Bukti pembayaran (wajib)",
    "booking.cons.pay.proofPlaceholder": "https://contoh.com/bukti.png",
    "booking.cons.pay.processing": "Memproses…",
    "booking.cons.pay.payPrefix": "Bayar",
    "booking.cons.btn.openChat": "Buka chat",
    "booking.cons.btn.accept": "Terima permintaan",
    "booking.cons.btn.complete": "Tandai selesai",
    "booking.cons.btn.cancel": "Batalkan",
    "booking.cons.confirm.title": "Batalkan konsultasi?",
    "booking.cons.confirm.desc":
      "Permintaan atau sesi konsultasi ini akan dibatalkan. Anda bisa mengajukan konsultasi baru nanti jika diperlukan.",
    "booking.cons.confirm.yes": "Ya, batalkan",
    "booking.cons.confirm.no": "Tidak jadi",
  },
  en: {
    // status-meta: booking status
    "booking.status.booking.pending": "Pending",
    "booking.status.booking.confirmed": "Confirmed",
    "booking.status.booking.inProgress": "In progress",
    "booking.status.booking.completed": "Completed",
    "booking.status.booking.cancelled": "Cancelled",
    // status-meta: transaction status
    "booking.status.transaction.pending": "Awaiting confirmation",
    "booking.status.transaction.paid": "Paid",
    "booking.status.transaction.refunded": "Refunded",
    "booking.status.transaction.failed": "Failed",
    // status-meta: therapist verification status
    "booking.status.therapistVerification.pending": "Awaiting verification",
    "booking.status.therapistVerification.approved": "Approved",
    "booking.status.therapistVerification.rejected": "Rejected",
    // status-meta: consultation status
    "booking.status.consultation.requested": "Awaiting therapist",
    "booking.status.consultation.accepted": "Awaiting payment",
    "booking.status.consultation.inProgress": "Active session",
    "booking.status.consultation.completed": "Completed",
    "booking.status.consultation.cancelled": "Cancelled",
    // status-meta: appointment type
    "booking.appointmentType.clinicVisit": "Clinic visit",
    "booking.appointmentType.homeVisit": "Home visit",

    // booking-flow: patient booking hints
    "booking.flow.bookingPatient.pending":
      "Waiting for the physiotherapist to confirm the appointment. Payment opens after confirmation.",
    "booking.flow.bookingPatient.confirmedAttachProof":
      "Appointment confirmed. Attach payment proof on the Transactions page.",
    "booking.flow.bookingPatient.confirmedWaiting":
      "Payment proof sent. Waiting for admin confirmation.",
    "booking.flow.bookingPatient.sessionRunning":
      "Session in progress or completed — if not paid yet, create a transaction on the Transactions page.",
    // booking-flow: therapist booking hints
    "booking.flow.bookingTherapist.pending":
      "Confirm the appointment so the patient can pay for the visit.",
    "booking.flow.bookingTherapist.confirmed":
      "The patient can pay in the Transactions menu. You can start the session after admin confirms payment.",
    "booking.flow.bookingTherapist.inProgress":
      "The visit session is in progress. Mark it complete after the meeting.",
    // booking-flow: patient consultation hints
    "booking.flow.consultationPatient.requested":
      "Waiting for the physiotherapist to accept. Payment opens after acceptance.",
    "booking.flow.consultationPatient.acceptedAttach":
      "The therapist has accepted. Attach the transfer proof, then pay to open the chat.",
    "booking.flow.consultationPatient.acceptedWaiting":
      "Payment proof sent. Waiting for admin confirmation — track it on the Transactions page.",
    "booking.flow.consultationPatient.inProgress":
      "Payment confirmed. Chat is active.",
    // booking-flow: therapist consultation hints
    "booking.flow.consultationTherapist.requested":
      "Accept the request so the patient can pay for the consultation.",
    "booking.flow.consultationTherapist.acceptedWaiting":
      "Waiting for the patient to pay and the admin to confirm payment.",
    "booking.flow.consultationTherapist.acceptedProofSent":
      "The patient has sent payment proof. Waiting for admin confirmation before the chat opens.",
    "booking.flow.consultationTherapist.inProgress":
      "Consultation session is active — the patient can use the chat.",
    // booking-flow: consultation patient label
    "booking.flow.consultationLabel.waitingAdmin": "Awaiting admin confirmation",
    "booking.flow.consultationLabel.readyToPay": "Ready to pay",

    // BookingForm
    "booking.form.loading": "Loading…",
    "booking.form.signIn.prefix": "Please sign in as a",
    "booking.form.signIn.role": "patient",
    "booking.form.signIn.suffix": "to create a booking.",
    "booking.form.signInButton": "Sign in",
    "booking.form.onlyPatient":
      "Only patient accounts can create a booking through this page.",
    "booking.form.error.forbidden":
      "Your account role cannot access the physiotherapist list on this endpoint (Patient or Admin required).",
    "booking.form.error.loadData": "Failed to load data.",
    "booking.form.error.loadSlots": "Failed to load slots.",
    "booking.form.error.invalidDate": "Invalid date/appointment.",
    "booking.form.error.submitFailed": "Booking failed.",
    "booking.form.success":
      "Booking created. Awaiting physiotherapist confirmation — once confirmed, pay on the Transactions page with payment proof.",
    "booking.form.formAriaLabel": "Appointment booking form",
    "booking.form.section.chooseTherapist": "Choose a physiotherapist",
    "booking.form.section.chooseTherapistHint":
      "Filter by category, then pick a therapist. The rates below follow the current profile snapshot.",
    "booking.form.label.filterCategory": "Filter category",
    "booking.form.option.allCategories": "All categories",
    "booking.form.label.physiotherapist": "Physiotherapist",
    "booking.form.option.choose": "— Select —",
    "booking.form.therapistRate.label": "This therapist's rates:",
    "booking.form.therapistRate.online": "online consultation",
    "booking.form.therapistRate.visit": "visit",
    "booking.form.therapistRate.frozen":
      "(frozen at the time the booking is created).",
    "booking.form.section.schedule": "Visit schedule",
    "booking.form.label.appointmentType": "Appointment type",
    "booking.form.label.slot": "Available slot (optional)",
    "booking.form.loadingSlots": "Loading slots…",
    "booking.form.option.noSlot": "No slot — use manual time below",
    "booking.form.label.appointmentTime":
      "Appointment time (required if no slot is selected)",
    "booking.form.section.locationNotes": "Location & notes",
    "booking.form.label.clinicAddress": "Clinic address (min. 10 characters)",
    "booking.form.label.homeAddress": "Home visit address (min. 10 characters)",
    "booking.form.label.notes": "Notes",
    "booking.form.findInTherapistList": "Search the therapist list",
    "booking.form.submitting": "Submitting…",
    "booking.form.submit": "Create booking",

    // PaymentProofLink
    "booking.proofLink.none": "No proof attached to this transaction yet.",
    "booking.proofLink.error": "Failed to open payment proof.",
    "booking.proofLink.opening": "Opening proof…",
    "booking.proofLink.view": "View payment proof",

    // appointment page
    "booking.appointment.eyebrow": "Booking",
    "booking.appointment.title": "Create an appointment",
    "booking.appointment.description":
      "Choose a physiotherapist, visit type, and a slot or manual time. After the therapist confirms, pay for the visit on the Transactions page with payment proof.",

    // bookings page
    "booking.bookings.toast.confirmed":
      "Booking confirmed. The patient can pay for the visit.",
    "booking.bookings.toast.started": "Session started.",
    "booking.bookings.toast.completed": "Booking marked as completed.",
    "booking.bookings.error.update": "Failed to update booking.",
    "booking.bookings.toast.cancelled": "Booking cancelled.",
    "booking.bookings.error.cancel": "Failed to cancel booking.",
    "booking.bookings.error.loadRescheduleSlots":
      "Failed to load reschedule slots.",
    "booking.bookings.error.pickSlotOrManual":
      "Choose a new slot or enter a manual appointment time.",
    "booking.bookings.error.invalidRescheduleTime": "Invalid reschedule time.",
    "booking.bookings.error.rescheduleFuture":
      "The reschedule time must be in the future.",
    "booking.bookings.toast.rescheduled": "Booking rescheduled successfully.",
    "booking.bookings.error.reschedule": "Failed to reschedule booking.",
    "booking.bookings.signIn": "Please sign in to view your bookings.",
    "booking.bookings.reschedule.notChosen": "Not selected yet",
    "booking.bookings.reschedule.invalidFormat": "Time format is not valid yet",
    "booking.bookings.desc.patient":
      "Visit flow: create an appointment → therapist confirms → pay with proof on Transactions → visit session.",
    "booking.bookings.desc.pt":
      "Confirm patient requests, then manage the visit sessions. The patient pays after you confirm.",
    "booking.bookings.desc.admin":
      "Manage appointments. Patients can cancel before completion; physiotherapists update the session flow.",
    "booking.bookings.eyebrow": "Appointments",
    "booking.bookings.title": "Bookings",
    "booking.bookings.link.calendar": "Calendar",
    "booking.bookings.link.newAppointment": "New appointment",
    "booking.bookings.link.transactions": "Transactions",
    "booking.bookings.link.findTherapist": "Find a therapist",
    "booking.bookings.link.manageSlots": "Manage slot schedule",
    "booking.bookings.empty.title": "No bookings yet",
    "booking.bookings.empty.hintPatient":
      "Create a new appointment or find a physiotherapist that fits your needs.",
    "booking.bookings.empty.hintPt":
      "New bookings will appear once a patient completes the appointment flow.",
    "booking.bookings.action.newAppointment": "Create new appointment",
    "booking.bookings.action.findTherapist": "Find a physiotherapist",
    "booking.bookings.action.manageSlots": "Manage slot schedule",
    "booking.bookings.label.location": "Location: ",
    "booking.bookings.label.notes": "Notes: ",
    "booking.bookings.btn.cancel": "Cancel booking",
    "booking.bookings.btn.reschedule": "Reschedule",
    "booking.bookings.rescheduleDisabled":
      "Reschedule is disabled because this booking's transaction is still active.",
    "booking.bookings.btn.payVisit": "Pay for visit",
    "booking.bookings.btn.viewPayment": "View payment status",
    "booking.bookings.btn.confirm": "Confirm",
    "booking.bookings.btn.startSession": "Start session",
    "booking.bookings.btn.complete": "Complete",
    "booking.bookings.confirm.title": "Cancel booking?",
    "booking.bookings.confirm.desc":
      "The appointment will be cancelled. You cannot restore this status after cancellation.",
    "booking.bookings.confirm.yes": "Yes, cancel",
    "booking.bookings.confirm.no": "Never mind",
    "booking.bookings.reschedule.closeAria": "Close reschedule",
    "booking.bookings.reschedule.title": "Reschedule booking",
    "booking.bookings.reschedule.subtitle":
      "Choose a new slot or set a manual time.",
    "booking.bookings.reschedule.oldSchedule": "Previous schedule:",
    "booking.bookings.reschedule.newSchedule": "New schedule:",
    "booking.bookings.reschedule.loadingSlots": "Loading latest slots…",
    "booking.bookings.reschedule.noSlot": "No slot (enter manual time)",
    "booking.bookings.reschedule.cancel": "Cancel",
    "booking.bookings.reschedule.saving": "Saving...",
    "booking.bookings.reschedule.save": "Save new schedule",

    // transactions page
    "booking.tx.error.pickBooking": "Choose a booking.",
    "booking.tx.toast.created":
      "Transaction created. Awaiting admin confirmation.",
    "booking.tx.error.create": "Failed to create transaction.",
    "booking.tx.toast.paymentConfirmed": "Payment confirmed.",
    "booking.tx.error.confirm": "Failed to confirm payment.",
    "booking.tx.toast.refunded": "Refund processed successfully (dummy).",
    "booking.tx.error.refund": "Refund failed.",
    "booking.tx.signIn": "Please sign in to view transactions.",
    "booking.tx.eyebrow": "Payments",
    "booking.tx.title": "Transactions",
    "booking.tx.pt.desc":
      "The transaction list is available to Patients and Admins. Physiotherapist accounts do not use this page.",
    "booking.tx.pt.note":
      "Use the shortcuts under the navbar for consultations, bookings, and chat. Payments are made by patients via the Transactions menu in their accounts.",
    "booking.tx.link.bookings": "Booking list",
    "booking.tx.link.consultations": "Consultations",
    "booking.tx.desc.admin":
      "Confirm dummy payments and refunds for eligible transactions.",
    "booking.tx.desc.patient":
      "Pay for a visit after the physiotherapist confirms the booking. The amount follows the visit rate at the time the booking was created. Admin confirms payment.",
    "booking.tx.create.title": "Create transaction (dummy)",
    "booking.tx.create.bookingLabel": "Booking & visit rate",
    "booking.tx.create.chooseBooking": "— Select a booking —",
    "booking.tx.create.noPendingBefore":
      "No therapist-confirmed bookings yet. Check the status on",
    "booking.tx.create.methodLabel": "Payment method",
    "booking.tx.method.bankTransfer": "Bank transfer",
    "booking.tx.method.eWallet": "E-wallet",
    "booking.tx.method.creditCard": "Credit card",
    "booking.tx.create.proofLabel": "Payment proof (required)",
    "booking.tx.create.proofHint":
      "Upload a screenshot/receipt, or an https link to proof in cloud storage. One of them is required before the transaction is created.",
    "booking.tx.create.proofPlaceholder":
      "https://example.com/payment-proof.png",
    "booking.tx.create.saving": "Saving…",
    "booking.tx.create.submit": "Create transaction",
    "booking.tx.create.footer1": "Payment for",
    "booking.tx.create.footerOnline": "online consultations",
    "booking.tx.create.footer2": "is created from the",
    "booking.tx.create.footer3":
      "page after the therapist accepts. The form above is only for",
    "booking.tx.create.footerBooking": "visit bookings",
    "booking.tx.create.footer4":
      "Payment proof is required; admin confirms payment.",
    "booking.tx.list.title": "Transaction list",
    "booking.tx.admin.seg1": "A",
    "booking.tx.admin.seg2":
      "transaction with attached proof: confirm the dummy payment via the button below (",
    "booking.tx.admin.seg3": "). A",
    "booking.tx.admin.seg4": " transaction: dummy refund via",
    "booking.tx.admin.seg5": "(reason min. 5 characters).",
    "booking.tx.empty.title": "No transactions yet",
    "booking.tx.empty.hintPatient":
      "Once the therapist confirms a booking, create a payment transaction from the form above.",
    "booking.tx.empty.hintAdmin":
      "Transactions from patients will appear here for confirmation.",
    "booking.tx.action.myBookings": "View my bookings",
    "booking.tx.action.newAppointment": "Create new appointment",
    "booking.tx.action.backDashboard": "Back to dashboard",
    "booking.tx.item.waitingAdmin": "Awaiting payment confirmation from admin",
    "booking.tx.item.confirmDisabled":
      "Payment confirmation is disabled until the patient attaches proof (URL or upload).",
    "booking.tx.item.processing": "Processing…",
    "booking.tx.item.confirmPay": "Confirm payment (dummy)",
    "booking.tx.item.refundReasonLabel": "Refund reason (min. 5 characters)",
    "booking.tx.item.refundPlaceholder":
      "Example: Cancellation request from the patient.",
    "booking.tx.item.refundBtn": "Refund (dummy)",
    "booking.tx.confirm.title": "Process refund?",
    "booking.tx.confirm.desc":
      "The transaction will be marked as refunded (dummy). Make sure the refund reason is correct — this action is for the admin demo.",
    "booking.tx.confirm.yes": "Yes, refund",
    "booking.tx.confirm.no": "Never mind",

    // calendar page
    "booking.cal.error.load": "Failed to load calendar.",
    "booking.cal.error.export": "Failed to export calendar.",
    "booking.cal.signIn": "Please sign in to view the appointment calendar.",
    "booking.cal.hint.patient":
      "Your appointments with physiotherapists. A day-before reminder is sent via in-app notifications (about 24 hours before the appointment time).",
    "booking.cal.hint.pt":
      "Your patients' visit schedule. A day-before reminder is sent to you and the patient via notifications.",
    "booking.cal.hint.admin": "All appointments within the month range (admin).",
    "booking.cal.eyebrow": "Appointments",
    "booking.cal.title": "Calendar",
    "booking.cal.link.bookings": "Booking list",
    "booking.cal.link.newAppointment": "New appointment",
    "booking.cal.prevMonth": "Previous month",
    "booking.cal.nextMonth": "Next month",
    "booking.cal.today": "Today",
    "booking.cal.exporting": "Exporting…",
    "booking.cal.downloadIcs": "Download .ics",
    "booking.cal.icsNote":
      "The .ics file contains this month's appointments (except cancelled ones). Import it into Google Calendar, Apple Calendar, or Outlook.",
    "booking.cal.empty.title": "No appointments this month",
    "booking.cal.empty.hint": "Create a new booking or pick another month.",

    // consultations page
    "booking.cons.error.pickTherapist": "Choose a physiotherapist.",
    "booking.cons.error.fastOnline":
      "Fast response (10 minutes) is only available when the therapist is online. Choose Standard or pick a therapist with an Online badge from the list.",
    "booking.cons.toast.requested":
      "Consultation request sent. The physiotherapist has been notified.",
    "booking.cons.error.create": "Failed to create consultation.",
    "booking.cons.error.openChat": "Failed to open chat.",
    "booking.cons.toast.accepted":
      "Request accepted. The patient can now pay.",
    "booking.cons.toast.completed": "Consultation marked as completed.",
    "booking.cons.error.update": "Failed to update status.",
    "booking.cons.toast.cancelled": "Consultation cancelled.",
    "booking.cons.error.cancel": "Failed to cancel consultation.",
    "booking.cons.error.unknownFee":
      "The consultation fee is unknown for this session.",
    "booking.cons.toast.paid":
      "Payment sent. The admin will confirm; track it on the Transactions page.",
    "booking.cons.error.pay": "Failed to create payment.",
    "booking.cons.signIn": "Please sign in to view consultations.",
    "booking.cons.eyebrow": "Telehealth",
    "booking.cons.title": "Consultations",
    "booking.cons.desc.pt":
      "Accept patient requests, wait for payment & admin confirmation, then the chat session becomes active.",
    "booking.cons.desc.admin":
      "Monitor online consultation requests across the platform.",
    "booking.cons.desc.patient":
      "Submit an initial complaint, pay after the therapist accepts, then start the chat session once the admin confirms payment.",
    "booking.cons.link.findTherapist": "Find a physiotherapist",
    "booking.cons.link.chatList": "Chat list",
    "booking.cons.form.title": "Request a new consultation",
    "booking.cons.form.flowPrefix": "Flow:",
    "booking.cons.form.flowAccept": "therapist accepts",
    "booking.cons.form.flowYou": "you",
    "booking.cons.form.flowAttach": "attach payment proof",
    "booking.cons.form.flowThen": "then",
    "booking.cons.form.flowPay": "pay",
    "booking.cons.form.flowSuffix":
      "the chat activates automatically after the admin confirms payment.",
    "booking.cons.form.therapistLabel": "Physiotherapist",
    "booking.cons.form.choose": "— Select —",
    "booking.cons.form.slaLegend": "Therapist reply deadline after payment",
    "booking.cons.form.standardTitle": "Standard (24 hours)",
    "booking.cons.form.standardDesc":
      "— suitable if you choose a specific therapist; the reply may take longer.",
    "booking.cons.form.fastTitle": "Fast response (~10 minutes)",
    "booking.cons.form.fastDescBefore": "— only if the therapist is currently",
    "booking.cons.form.fastOnlineWord": "online",
    "booking.cons.form.fastDescAfter":
      "(Online badge). If there is no reply, the payment is refunded automatically by the system.",
    "booking.cons.form.complaintLabel": "Complaint (min. 10 characters)",
    "booking.cons.form.sending": "Sending…",
    "booking.cons.form.send": "Send",
    "booking.cons.list.title": "Consultation list",
    "booking.cons.empty.title": "No consultations yet",
    "booking.cons.empty.hintPatient":
      "Start by submitting an initial complaint to your chosen physiotherapist.",
    "booking.cons.empty.hintOther":
      "Requests from patients will appear here after they submit a consultation.",
    "booking.cons.action.request": "Request a consultation",
    "booking.cons.action.findTherapist": "Find a physiotherapist",
    "booking.cons.action.manageProfile": "Manage profile",
    "booking.cons.item.fee": "Fee:",
    "booking.cons.item.sla": "SLA:",
    "booking.cons.item.slaFast": "fast (~10 min)",
    "booking.cons.item.slaStandard": "standard (~24 hours)",
    "booking.cons.btn.viewPayment": "View payment status",
    "booking.cons.pay.proofLabel": "Payment proof (required)",
    "booking.cons.pay.proofPlaceholder": "https://example.com/proof.png",
    "booking.cons.pay.processing": "Processing…",
    "booking.cons.pay.payPrefix": "Pay",
    "booking.cons.btn.openChat": "Open chat",
    "booking.cons.btn.accept": "Accept request",
    "booking.cons.btn.complete": "Mark as complete",
    "booking.cons.btn.cancel": "Cancel",
    "booking.cons.confirm.title": "Cancel consultation?",
    "booking.cons.confirm.desc":
      "This consultation request or session will be cancelled. You can request a new consultation later if needed.",
    "booking.cons.confirm.yes": "Yes, cancel",
    "booking.cons.confirm.no": "Never mind",
  },
};
