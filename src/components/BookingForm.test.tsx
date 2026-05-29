import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookingForm from "./BookingForm";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { listAvailabilitySlotsForProfile } from "@/lib/api/availability-slots";
import { createBooking } from "@/lib/api/bookings";
import { listCategories } from "@/lib/api/categories";
import { browsePhysiotherapists } from "@/lib/api/physiotherapists";

const mockPush = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/contexts/toast-context", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/lib/api/categories", () => ({
  listCategories: vi.fn(),
}));

vi.mock("@/lib/api/physiotherapists", () => ({
  browsePhysiotherapists: vi.fn(),
}));

vi.mock("@/lib/api/availability-slots", () => ({
  listAvailabilitySlotsForProfile: vi.fn(),
}));

vi.mock("@/lib/api/bookings", () => ({
  createBooking: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseToast = vi.mocked(useToast);
const mockedListCategories = vi.mocked(listCategories);
const mockedBrowsePhysiotherapists = vi.mocked(browsePhysiotherapists);
const mockedListSlots = vi.mocked(listAvailabilitySlotsForProfile);
const mockedCreateBooking = vi.mocked(createBooking);

const patientUser = {
  id: "user-1",
  email: "patient@example.com",
  fullName: "Patient Demo",
  role: "PATIENT" as const,
};

const therapist = {
  id: "pt-1",
  user: { id: "u-pt", fullName: "Dr. Fisio" },
  category: { id: "cat-1", name: "Ortopedi" },
  consultationFee: 150000,
  visitFee: 250000,
  clinicAddress: "Jl. Klinik Sehat No. 10 Jakarta Pusat",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseToast.mockReturnValue({
    success: mockToastSuccess,
    error: vi.fn(),
    info: vi.fn(),
  });
  mockedListCategories.mockResolvedValue([
    { id: "cat-1", name: "Ortopedi", slug: "ortopedi" },
  ]);
  mockedBrowsePhysiotherapists.mockResolvedValue({
    items: [therapist],
    total: 1,
    page: 1,
    limit: 50,
  });
  mockedListSlots.mockResolvedValue({
    items: [
      {
        id: "slot-1",
        startTime: "2099-06-15T09:00:00.000Z",
        endTime: "2099-06-15T10:00:00.000Z",
        isBooked: false,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
  });
  mockedCreateBooking.mockResolvedValue({ id: "booking-1" });
});

describe("BookingForm", () => {
  it("shows loading state while auth is initializing", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isReady: false,
      login: vi.fn(),
      register: vi.fn(),
      completeOAuthLogin: vi.fn(),
      logout: vi.fn(),
      syncUserFromProfile: vi.fn(),
    });

    render(<BookingForm />);
    expect(screen.getByText("Memuat…")).toBeInTheDocument();
  });

  it("prompts unauthenticated users to log in", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isReady: true,
      login: vi.fn(),
      register: vi.fn(),
      completeOAuthLogin: vi.fn(),
      logout: vi.fn(),
      syncUserFromProfile: vi.fn(),
    });

    render(<BookingForm />);
    expect(
      screen.getByText(/Silakan masuk sebagai/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("blocks non-patient roles", () => {
    mockedUseAuth.mockReturnValue({
      user: { ...patientUser, role: "PHYSIOTHERAPIST" },
      isReady: true,
      login: vi.fn(),
      register: vi.fn(),
      completeOAuthLogin: vi.fn(),
      logout: vi.fn(),
      syncUserFromProfile: vi.fn(),
    });

    render(<BookingForm />);
    expect(
      screen.getByText(/Hanya akun pasien yang dapat membuat booking/i),
    ).toBeInTheDocument();
  });

  it("renders booking form for patient and loads lists", async () => {
    mockedUseAuth.mockReturnValue({
      user: patientUser,
      isReady: true,
      login: vi.fn(),
      register: vi.fn(),
      completeOAuthLogin: vi.fn(),
      logout: vi.fn(),
      syncUserFromProfile: vi.fn(),
    });

    render(<BookingForm />);

    await waitFor(() => {
      expect(mockedListCategories).toHaveBeenCalled();
      expect(mockedBrowsePhysiotherapists).toHaveBeenCalled();
    });

    expect(
      screen.getByRole("form", { name: "Form booking janji temu" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Fisioterapis/i)).toBeInTheDocument();
  });

  it("shows validation error when schedule is missing", async () => {
    mockedUseAuth.mockReturnValue({
      user: patientUser,
      isReady: true,
      login: vi.fn(),
      register: vi.fn(),
      completeOAuthLogin: vi.fn(),
      logout: vi.fn(),
      syncUserFromProfile: vi.fn(),
    });

    const user = userEvent.setup();
    render(<BookingForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Fisioterapis/i)).toBeEnabled();
    });

    await user.selectOptions(screen.getByLabelText(/Fisioterapis/i), "pt-1");

    await waitFor(() => {
      expect(screen.getByLabelText(/Slot tersedia/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Buat booking" }));

    expect(
      await screen.findByText(/Periksa formulir booking/i),
    ).toBeInTheDocument();
    expect(mockedCreateBooking).not.toHaveBeenCalled();
  });

  it("submits booking when form is valid", async () => {
    mockedUseAuth.mockReturnValue({
      user: patientUser,
      isReady: true,
      login: vi.fn(),
      register: vi.fn(),
      completeOAuthLogin: vi.fn(),
      logout: vi.fn(),
      syncUserFromProfile: vi.fn(),
    });

    const user = userEvent.setup();
    render(<BookingForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Fisioterapis/i)).toBeEnabled();
    });

    await user.selectOptions(screen.getByLabelText(/Fisioterapis/i), "pt-1");

    await waitFor(() => {
      expect(mockedListSlots).toHaveBeenCalledWith("pt-1", expect.any(Object));
    });

    await user.selectOptions(screen.getByLabelText(/Slot tersedia/i), "slot-1");
    await user.click(screen.getByRole("button", { name: "Buat booking" }));

    await waitFor(() => {
      expect(mockedCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          physiotherapistId: "pt-1",
          appointmentType: "CLINIC_VISIT",
          slotId: "slot-1",
        }),
      );
    });

    expect(mockPush).toHaveBeenCalledWith("/bookings");
    expect(mockToastSuccess).toHaveBeenCalled();
  });
});
