import type { AppointmentType } from "@/lib/api/types";
import {
  validationFailed,
  type FieldErrors,
  type ValidationResult,
} from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isHttpsUrl(url: string): boolean {
  const u = url.trim();
  return u.startsWith("https://") && u.length > 12;
}

export function validateLogin(input: {
  email: string;
  password: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  if (!isValidEmail(input.email)) {
    fieldErrors.email = "Format email tidak valid.";
  }
  if (input.password.length < 8) {
    fieldErrors.password = "Kata sandi minimal 8 karakter.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa email dan kata sandi.", fieldErrors);
  }
  return { ok: true };
}

export function validateRegister(input: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  if (input.fullName.trim().length < 3) {
    fieldErrors.fullName = "Nama minimal 3 karakter.";
  }
  if (!isValidEmail(input.email)) {
    fieldErrors.email = "Format email tidak valid.";
  }
  if (input.password.length < 8) {
    fieldErrors.password = "Kata sandi minimal 8 karakter.";
  }
  const phone = input.phoneNumber?.trim();
  if (phone && phone.length < 8) {
    fieldErrors.phoneNumber = "Nomor telepon minimal 8 digit.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa isian formulir pendaftaran.", fieldErrors);
  }
  return { ok: true };
}

export function validatePatientProfileUpdate(input: {
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  const dob = input.dateOfBirth?.trim();
  if (dob) {
    const parsed = new Date(`${dob}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      fieldErrors.dateOfBirth = "Tanggal lahir tidak valid.";
    } else if (parsed > new Date()) {
      fieldErrors.dateOfBirth = "Tanggal lahir tidak boleh di masa depan.";
    }
  }
  const gender = input.gender?.trim();
  if (gender && !["M", "F", "OTHER"].includes(gender)) {
    fieldErrors.gender = "Pilih jenis kelamin yang valid.";
  }
  const address = input.address?.trim();
  if (address && address.length < 5) {
    fieldErrors.address = "Alamat minimal 5 karakter.";
  }
  const emergencyName = input.emergencyContactName?.trim();
  if (emergencyName && emergencyName.length < 3) {
    fieldErrors.emergencyContactName =
      "Nama kontak darurat minimal 3 karakter.";
  }
  const emergencyPhone = input.emergencyContactPhone?.trim();
  if (emergencyPhone && emergencyPhone.length < 8) {
    fieldErrors.emergencyContactPhone =
      "Telepon kontak darurat minimal 8 digit.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa data medis.", fieldErrors);
  }
  return { ok: true };
}

export function validateProfileUpdate(input: {
  fullName: string;
  phoneNumber?: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  if (input.fullName.trim().length < 3) {
    fieldErrors.fullName = "Nama minimal 3 karakter.";
  }
  const phone = input.phoneNumber?.trim();
  if (phone && phone.length < 8) {
    fieldErrors.phoneNumber = "Nomor telepon minimal 8 digit.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa data profil.", fieldErrors);
  }
  return { ok: true };
}

export function validateChangePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  if (!input.currentPassword) {
    fieldErrors.currentPassword = "Password saat ini wajib diisi.";
  }
  if (input.newPassword.length < 8) {
    fieldErrors.newPassword = "Password baru minimal 8 karakter.";
  }
  if (input.newPassword !== input.confirmPassword) {
    fieldErrors.confirmPassword = "Konfirmasi password tidak cocok.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa isian ganti password.", fieldErrors);
  }
  return { ok: true };
}

export function validateBookingCreate(input: {
  physiotherapistId: string;
  slotId: string;
  appointmentDateLocal: string;
  hasSelectedSlot: boolean;
  appointmentType: AppointmentType;
  clinicAddress: string;
  homeVisitAddress: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  if (!input.physiotherapistId) {
    fieldErrors.physiotherapistId = "Pilih fisioterapis.";
  }
  if (!input.hasSelectedSlot && !input.appointmentDateLocal) {
    fieldErrors.appointmentDate =
      "Pilih slot tersedia atau isi tanggal & waktu janji.";
  }
  const clinic = input.clinicAddress.trim();
  const home = input.homeVisitAddress.trim();
  if (input.appointmentType === "CLINIC_VISIT" && clinic.length < 10) {
    fieldErrors.clinicAddress =
      "Alamat klinik minimal 10 karakter untuk kunjungan klinik.";
  }
  if (input.appointmentType === "HOME_VISIT" && home.length < 10) {
    fieldErrors.homeVisitAddress =
      "Alamat kunjungan rumah minimal 10 karakter untuk home visit.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa formulir booking.", fieldErrors);
  }
  return { ok: true };
}

export function validateComplaint(complaint: string): ValidationResult {
  if (complaint.trim().length < 10) {
    return validationFailed("Keluhan minimal 10 karakter.", {
      complaint: "Keluhan minimal 10 karakter.",
    });
  }
  return { ok: true };
}

export function validatePaymentProof(input: {
  proofFile?: File | null;
  paymentProofUrl?: string;
  requireProof?: boolean;
}): ValidationResult {
  const hasFile = Boolean(input.proofFile);
  const url = input.paymentProofUrl?.trim() ?? "";
  if (hasFile) return { ok: true };
  if (url) {
    if (!isHttpsUrl(url)) {
      return validationFailed("URL bukti harus memakai https://", {
        paymentProofUrl: "URL bukti harus memakai https://",
      });
    }
    return { ok: true };
  }
  if (input.requireProof !== false) {
    return validationFailed(
      "Lampirkan file bukti atau URL https bukti pembayaran.",
      { paymentProofUrl: "Bukti pembayaran wajib." },
    );
  }
  return { ok: true };
}

export function validateRefundReason(reason: string): ValidationResult {
  if (reason.trim().length < 5) {
    return validationFailed("Alasan refund minimal 5 karakter.", {
      reason: "Alasan refund minimal 5 karakter.",
    });
  }
  return { ok: true };
}

export function validateReviewWrite(input: {
  bookingId: string;
  rating: number;
  comment: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  if (!input.bookingId) {
    fieldErrors.bookingId = "Pilih booking.";
  }
  if (!Number.isFinite(input.rating) || input.rating < 1 || input.rating > 5) {
    fieldErrors.rating = "Rating antara 1 dan 5.";
  }
  if (input.comment.trim().length < 10) {
    fieldErrors.comment = "Ulasan minimal 10 karakter.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa formulir ulasan.", fieldErrors);
  }
  return { ok: true };
}

export function validateBroadcast(input: {
  title: string;
  body: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  if (input.title.trim().length < 3) {
    fieldErrors.title = "Judul minimal 3 karakter.";
  }
  if (input.body.trim().length < 3) {
    fieldErrors.body = "Isi minimal 3 karakter.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa broadcast.", fieldErrors);
  }
  return { ok: true };
}

export function validateDirectNotification(input: {
  userId: string;
  title: string;
  body: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};
  if (!input.userId.trim()) {
    fieldErrors.userId = "User ID wajib diisi.";
  }
  if (input.title.trim().length < 3) {
    fieldErrors.title = "Judul minimal 3 karakter.";
  }
  if (input.body.trim().length < 3) {
    fieldErrors.body = "Isi minimal 3 karakter.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return validationFailed("Periksa notifikasi langsung.", fieldErrors);
  }
  return { ok: true };
}

export function validateCategoryName(name: string): ValidationResult {
  if (name.trim().length < 3) {
    return validationFailed("Nama minimal 3 karakter.", {
      name: "Nama minimal 3 karakter.",
    });
  }
  return { ok: true };
}

export function validateRejectReason(reason: string): ValidationResult {
  if (reason.trim().length < 5) {
    return validationFailed("Alasan penolakan minimal 5 karakter.", {
      reason: "Alasan penolakan minimal 5 karakter.",
    });
  }
  return { ok: true };
}
