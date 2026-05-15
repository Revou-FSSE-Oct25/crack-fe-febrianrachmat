/** Selaras dengan Prisma `UserRole` di backend */
export type UserRole = "ADMIN" | "PATIENT" | "PHYSIOTHERAPIST";

/** Payload JWT dari GET /auth/me */
export type AuthMePayload = {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};

/** Respons login/register dari AuthService */
export type AuthUserResponse = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type LoginResponseData = {
  accessToken: string;
  user: AuthUserResponse;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** GET /patients/me */
export type PatientProfile = {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
};

/** GET /users/me */
export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** GET /users/me/activity-summary */
export type UserActivitySummary =
  | {
      role: "PATIENT";
      bookings: { total: number; pending: number; completed: number };
      consultations: {
        total: number;
        active: number;
        completed: number;
      };
      transactionsPending: number;
      reviews: number;
      lastActivityAt: string | null;
    }
  | {
      role: "PHYSIOTHERAPIST";
      bookings: { total: number; pending: number; completed: number };
      consultations: {
        total: number;
        active: number;
        completed: number;
      };
      reviews: number;
      lastActivityAt: string | null;
    }
  | {
      role: "ADMIN";
      pendingVerifications: number;
      transactionsPending: number;
      consultationsActive: number;
    };

/** Category dari GET /categories */
export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Profil fisioterapis hasil browse / GET /physiotherapists/:profileId */
export type PhysiotherapistBrowseItem = {
  id: string;
  bio: string | null;
  education?: string | null;
  experienceYears?: number;
  clinicAddress: string | null;
  consultationFee: string | number | null;
  visitFee: string | number | null;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  /** ISO timestamp; if in the future, therapist recently sent a dashboard heartbeat. */
  onlineUntil?: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
  category: Category | null;
};

export type AppointmentType = "HOME_VISIT" | "CLINIC_VISIT";
