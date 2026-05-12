import { apiFetch } from "./client";

/** Respons `AdminDashboardService.getOverview()` */
export type AdminDashboardOverview = {
  users: {
    total: number;
    patients: number;
    physiotherapists: number;
  };
  physiotherapistVerification: {
    pending: number;
    approved: number;
  };
  bookings: {
    total: number;
    byStatus: Array<{
      status: string;
      _count: { _all: number };
    }>;
  };
  transactions: {
    byStatus: Array<{
      status: string;
      _count: { _all: number };
    }>;
    totalRevenuePaid: string | number;
    totalRefundAmount: string | number;
  };
  reviews: {
    total: number;
    hidden: number;
  };
};

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  return apiFetch<AdminDashboardOverview>("/admin/dashboard/overview");
}
