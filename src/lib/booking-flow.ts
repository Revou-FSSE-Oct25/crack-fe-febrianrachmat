import type { BookingStatus, Transaction, TransactionStatus } from "./api/contract";

/** Status booking yang boleh dibayar pasien (selaras backend `bookings.service`). */
export const BOOKING_PAYABLE_STATUSES: readonly BookingStatus[] = [
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

const OPEN_TX_STATUSES: readonly TransactionStatus[] = ["PENDING", "PAID"];

export function isBookingPayable(status: string): boolean {
  return BOOKING_PAYABLE_STATUSES.includes(status as BookingStatus);
}

export function bookingHasOpenTransaction(
  bookingId: string,
  transactions: Transaction[],
): boolean {
  return transactions.some(
    (t) =>
      t.bookingId === bookingId &&
      OPEN_TX_STATUSES.includes(t.status),
  );
}

export function consultationHasOpenTransaction(
  consultationId: string,
  transactions: Transaction[],
): boolean {
  return transactions.some(
    (t) =>
      t.consultationId === consultationId &&
      OPEN_TX_STATUSES.includes(t.status),
  );
}

export function getOpenTransactionForConsultation(
  consultationId: string,
  transactions: Transaction[],
): Transaction | undefined {
  return transactions.find(
    (t) =>
      t.consultationId === consultationId &&
      OPEN_TX_STATUSES.includes(t.status),
  );
}

export function bookingPatientActionHint(
  status: string,
  hasOpenTransaction: boolean,
): string | null {
  if (status === "PENDING") {
    return "Menunggu fisioterapis mengonfirmasi janji. Pembayaran dibuka setelah dikonfirmasi.";
  }
  if (status === "CONFIRMED" && !hasOpenTransaction) {
    return "Janji dikonfirmasi. Lampirkan bukti bayar di halaman Transaksi.";
  }
  if (status === "CONFIRMED" && hasOpenTransaction) {
    return "Bukti bayar terkirim. Menunggu konfirmasi admin.";
  }
  if (
    (status === "IN_PROGRESS" || status === "COMPLETED") &&
    !hasOpenTransaction
  ) {
    return "Sesi berjalan atau selesai — jika belum bayar, buat transaksi di halaman Transaksi.";
  }
  return null;
}

export function bookingTherapistActionHint(status: string): string | null {
  if (status === "PENDING") {
    return "Konfirmasi janji agar pasien dapat melakukan pembayaran kunjungan.";
  }
  if (status === "CONFIRMED") {
    return "Pasien dapat membayar di menu Transaksi. Anda dapat memulai sesi setelah pembayaran dikonfirmasi admin.";
  }
  if (status === "IN_PROGRESS") {
    return "Sesi kunjungan berlangsung. Tandai selesai setelah pertemuan.";
  }
  return null;
}

export function consultationPatientActionHint(
  status: string,
  openTx: Transaction | undefined,
): string | null {
  if (status === "REQUESTED") {
    return "Menunggu fisioterapis menerima. Pembayaran dibuka setelah diterima.";
  }
  if (status === "ACCEPTED" && !openTx) {
    return "Terapis sudah menerima. Lampirkan bukti transfer lalu bayar untuk membuka chat.";
  }
  if (status === "ACCEPTED" && openTx?.status === "PENDING") {
    return "Bukti bayar terkirim. Menunggu konfirmasi admin — pantau di halaman Transaksi.";
  }
  if (status === "IN_PROGRESS") {
    return "Pembayaran dikonfirmasi. Chat aktif.";
  }
  return null;
}

export function consultationTherapistActionHint(
  status: string,
  openTx: Transaction | undefined,
): string | null {
  if (status === "REQUESTED") {
    return "Terima permintaan agar pasien dapat membayar konsultasi.";
  }
  if (status === "ACCEPTED" && !openTx) {
    return "Menunggu pasien membayar dan admin mengonfirmasi pembayaran.";
  }
  if (status === "ACCEPTED" && openTx?.status === "PENDING") {
    return "Pasien sudah mengirim bukti bayar. Menunggu konfirmasi admin sebelum chat terbuka.";
  }
  if (status === "IN_PROGRESS") {
    return "Sesi konsultasi aktif — pasien dapat menggunakan chat.";
  }
  return null;
}

export function consultationStatusLabelForPatient(
  status: string,
  openTx: Transaction | undefined,
): string {
  if (status === "ACCEPTED" && openTx?.status === "PENDING") {
    return "Menunggu konfirmasi admin";
  }
  if (status === "ACCEPTED" && !openTx) {
    return "Siap dibayar";
  }
  const map: Record<string, string> = {
    REQUESTED: "Menunggu terapis",
    ACCEPTED: "Menunggu pembayaran",
    IN_PROGRESS: "Sesi aktif",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };
  return map[status] ?? status.replaceAll("_", " ");
}
