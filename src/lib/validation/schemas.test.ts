import { describe, expect, it } from "vitest";
import {
  isHttpsUrl,
  isValidEmail,
  validateBookingCreate,
  validateChangePassword,
  validateLogin,
  validatePaymentProof,
  validateRegister,
} from "./schemas";

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });

  it("rejects invalid addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
  });
});

describe("isHttpsUrl", () => {
  it("requires https with sufficient length", () => {
    expect(isHttpsUrl("https://example.com/proof.png")).toBe(true);
    expect(isHttpsUrl("http://example.com")).toBe(false);
    expect(isHttpsUrl("https://x")).toBe(false);
  });
});

describe("validateLogin", () => {
  it("passes valid credentials", () => {
    expect(
      validateLogin({ email: "a@b.com", password: "password1" }),
    ).toEqual({ ok: true });
  });

  it("returns field errors for invalid input", () => {
    const result = validateLogin({ email: "bad", password: "short" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.email).toBeDefined();
      expect(result.fieldErrors.password).toBeDefined();
    }
  });
});

describe("validateRegister", () => {
  it("passes valid registration", () => {
    expect(
      validateRegister({
        fullName: "Budi Santoso",
        email: "budi@example.com",
        password: "password1",
      }),
    ).toEqual({ ok: true });
  });

  it("validates optional phone when provided", () => {
    const result = validateRegister({
      fullName: "Budi Santoso",
      email: "budi@example.com",
      password: "password1",
      phoneNumber: "0812",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.phoneNumber).toBeDefined();
    }
  });
});

describe("validateChangePassword", () => {
  it("requires matching confirmation", () => {
    const result = validateChangePassword({
      currentPassword: "oldpass1",
      newPassword: "newpass12",
      confirmPassword: "different",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.confirmPassword).toBeDefined();
    }
  });
});

describe("validateBookingCreate", () => {
  it("requires physiotherapist and schedule", () => {
    const result = validateBookingCreate({
      physiotherapistId: "",
      slotId: "",
      appointmentDateLocal: "",
      hasSelectedSlot: false,
      appointmentType: "CLINIC_VISIT",
      clinicAddress: "",
      homeVisitAddress: "",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.physiotherapistId).toBeDefined();
      expect(result.fieldErrors.appointmentDate).toBeDefined();
    }
  });

  it("requires clinic address for CLINIC_VISIT", () => {
    const result = validateBookingCreate({
      physiotherapistId: "pt-1",
      slotId: "slot-1",
      appointmentDateLocal: "",
      hasSelectedSlot: true,
      appointmentType: "CLINIC_VISIT",
      clinicAddress: "short",
      homeVisitAddress: "",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.clinicAddress).toBeDefined();
    }
  });

  it("passes when slot and addresses are valid", () => {
    expect(
      validateBookingCreate({
        physiotherapistId: "pt-1",
        slotId: "slot-1",
        appointmentDateLocal: "",
        hasSelectedSlot: true,
        appointmentType: "HOME_VISIT",
        clinicAddress: "",
        homeVisitAddress: "Jl. Merdeka No. 10 Jakarta",
      }),
    ).toEqual({ ok: true });
  });
});

describe("validatePaymentProof", () => {
  it("accepts https URL proof", () => {
    expect(
      validatePaymentProof({
        paymentProofUrl: "https://example.com/proof.png",
      }),
    ).toEqual({ ok: true });
  });

  it("rejects non-https URL", () => {
    const result = validatePaymentProof({
      paymentProofUrl: "http://example.com/proof.png",
    });
    expect(result.ok).toBe(false);
  });

  it("allows skip when requireProof is false", () => {
    expect(
      validatePaymentProof({ requireProof: false }),
    ).toEqual({ ok: true });
  });
});
