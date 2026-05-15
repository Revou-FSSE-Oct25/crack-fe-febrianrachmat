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

/** GET /users/me */
export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Category dari GET /categories */
export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Profil fisioterapis hasil browse (subset yang dipakai UI) */
export type PhysiotherapistBrowseItem = {
  id: string;
  bio: string | null;
  clinicAddress: string | null;
  consultationFee: string | number | null;
  visitFee: string | number | null;
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
