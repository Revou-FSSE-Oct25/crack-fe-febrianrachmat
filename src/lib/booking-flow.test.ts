import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bookingHasOpenTransaction,
  bookingPatientActionHint,
  consultationHasOpenTransaction,
  consultationStatusLabelForPatient,
  isBookingPayable,
} from "./booking-flow";
import type { Transaction } from "./api/contract";

describe("booking-flow helpers", () => {
  it("isBookingPayable matches backend payable statuses", () => {
    assert.equal(isBookingPayable("CONFIRMED"), true);
    assert.equal(isBookingPayable("PENDING"), false);
  });

  it("bookingPatientActionHint guides CONFIRMED without tx", () => {
    const hint = bookingPatientActionHint("CONFIRMED", false);
    assert.ok(hint?.includes("Transaksi"));
  });

  it("bookingHasOpenTransaction detects pending booking tx", () => {
    const txs: Transaction[] = [
      {
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
      },
    ];
    assert.equal(bookingHasOpenTransaction("b1", txs), true);
    assert.equal(bookingHasOpenTransaction("b2", txs), false);
  });

  it("consultation pay state labels distinguish waiting admin", () => {
    assert.equal(
      consultationStatusLabelForPatient("ACCEPTED", {
        id: "t1",
        bookingId: null,
        consultationId: "c1",
        patientId: "p1",
        amount: 1,
        paymentMethod: "BANK_TRANSFER",
        status: "PENDING",
        paidAt: null,
        refundedAt: null,
        refundReason: null,
        paymentProofUrl: "x",
        createdAt: "",
        updatedAt: "",
      }),
      "Menunggu konfirmasi admin",
    );
    assert.equal(
      consultationHasOpenTransaction(
        "c1",
        [
          {
            id: "t1",
            bookingId: null,
            consultationId: "c1",
            patientId: "p1",
            amount: 1,
            paymentMethod: "BANK_TRANSFER",
            status: "PENDING",
            paidAt: null,
            refundedAt: null,
            refundReason: null,
            paymentProofUrl: "x",
            createdAt: "",
            updatedAt: "",
          },
        ],
      ),
      true,
    );
  });
});
