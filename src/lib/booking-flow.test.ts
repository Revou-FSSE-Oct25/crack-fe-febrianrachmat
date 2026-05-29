import { describe, expect, it } from "vitest";
import {
  bookingHasOpenTransaction,
  bookingPatientActionHint,
  bookingTherapistActionHint,
  consultationHasOpenTransaction,
  consultationPatientActionHint,
  consultationStatusLabelForPatient,
  isBookingPayable,
} from "./booking-flow";
import type { Transaction } from "./api/contract";

const pendingTx: Transaction = {
  id: "t1",
  bookingId: "b1",
  consultationId: null,
  patientId: "p1",
  amount: 100000,
  paymentMethod: "BANK_TRANSFER",
  status: "PENDING",
  paidAt: null,
  refundedAt: null,
  refundReason: null,
  paymentProofUrl: "https://example.com/p.png",
  createdAt: "",
  updatedAt: "",
};

describe("booking-flow helpers", () => {
  it("isBookingPayable matches backend payable statuses", () => {
    expect(isBookingPayable("CONFIRMED")).toBe(true);
    expect(isBookingPayable("IN_PROGRESS")).toBe(true);
    expect(isBookingPayable("COMPLETED")).toBe(true);
    expect(isBookingPayable("PENDING")).toBe(false);
    expect(isBookingPayable("CANCELLED")).toBe(false);
  });

  it("bookingPatientActionHint guides CONFIRMED without tx", () => {
    const hint = bookingPatientActionHint("CONFIRMED", false);
    expect(hint).toContain("Transaksi");
  });

  it("bookingPatientActionHint guides PENDING state", () => {
    const hint = bookingPatientActionHint("PENDING", false);
    expect(hint).toContain("Menunggu fisioterapis");
  });

  it("bookingTherapistActionHint guides PENDING state", () => {
    const hint = bookingTherapistActionHint("PENDING");
    expect(hint).toContain("Konfirmasi janji");
  });

  it("bookingHasOpenTransaction detects pending booking tx", () => {
    expect(bookingHasOpenTransaction("b1", [pendingTx])).toBe(true);
    expect(bookingHasOpenTransaction("b2", [pendingTx])).toBe(false);
  });

  it("consultation pay state labels distinguish waiting admin", () => {
    const consultationPendingTx: Transaction = {
      ...pendingTx,
      bookingId: null,
      consultationId: "c1",
    };
    expect(
      consultationStatusLabelForPatient("ACCEPTED", consultationPendingTx),
    ).toBe("Menunggu konfirmasi admin");
    expect(consultationStatusLabelForPatient("ACCEPTED", undefined)).toBe("Siap dibayar");
    expect(
      consultationHasOpenTransaction("c1", [
        { ...consultationPendingTx, consultationId: "c1", bookingId: null },
      ]),
    ).toBe(true);
  });

  it("consultationPatientActionHint guides accepted without payment", () => {
    const hint = consultationPatientActionHint("ACCEPTED", undefined);
    expect(hint).toContain("Lampirkan bukti transfer");
  });
});
