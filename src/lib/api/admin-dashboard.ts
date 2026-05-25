import { apiFetch } from "./client";

type StatusCountRow = {
  status: string;
  _count: { _all: number };
};

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
    byStatus: StatusCountRow[];
  };
  consultations: {
    total: number;
    byStatus: StatusCountRow[];
  };
  transactions: {
    byStatus: StatusCountRow[];
    totalRevenuePaid: string | number;
    totalRefundAmount: string | number;
  };
  reviews: {
    total: number;
    hidden: number;
    visible: number;
    averageRating: number | null;
    bySource: { booking: number; consultation: number };
    ratingDistribution: Array<{ rating: number; count: number }>;
  };
  auditLogs: {
    total: number;
  };
};

export type AdminDashboardAnalytics = {
  generatedAt: string;
  periodDays: number;
  periodStart: string;
  trends: {
    labels: string[];
    newUsers: number[];
    newBookings: number[];
    newConsultations: number[];
    paidRevenue: number[];
  };
  reviews: {
    averageRating: number | null;
    ratingDistribution: Array<{ rating: number; count: number }>;
    bySource: { booking: number; consultation: number };
  };
  paymentMix: {
    paidBookingCount: number;
    paidConsultationCount: number;
    paidBookingRevenue: string | number;
    paidConsultationRevenue: string | number;
  };
  topTherapistsByRating: Array<{
    physiotherapistId: string;
    fullName: string;
    averageRating: number | null;
    reviewCount: number;
  }>;
  auditLogsInPeriod: number;
};

function asRecord(v: unknown): Record<string, unknown> {
  return v != null && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function mapStatusRows(raw: unknown): StatusCountRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const r = asRecord(item);
    const count = asRecord(r._count);
    return {
      status: String(r.status ?? ""),
      _count: { _all: Number(count._all ?? 0) },
    };
  });
}

function mapOverview(raw: unknown): AdminDashboardOverview {
  const r = asRecord(raw);
  const users = asRecord(r.users);
  const verification = asRecord(r.physiotherapistVerification);
  const bookings = asRecord(r.bookings);
  const consultations = asRecord(r.consultations);
  const transactions = asRecord(r.transactions);
  const reviews = asRecord(r.reviews);
  const bySource = asRecord(reviews.bySource);
  const auditLogs = asRecord(r.auditLogs);
  const dist = Array.isArray(reviews.ratingDistribution)
    ? reviews.ratingDistribution.map((row) => {
        const d = asRecord(row);
        return { rating: Number(d.rating ?? 0), count: Number(d.count ?? 0) };
      })
    : [];

  return {
    users: {
      total: Number(users.total ?? 0),
      patients: Number(users.patients ?? 0),
      physiotherapists: Number(users.physiotherapists ?? 0),
    },
    physiotherapistVerification: {
      pending: Number(verification.pending ?? 0),
      approved: Number(verification.approved ?? 0),
    },
    bookings: {
      total: Number(bookings.total ?? 0),
      byStatus: mapStatusRows(bookings.byStatus),
    },
    consultations: {
      total: Number(consultations.total ?? 0),
      byStatus: mapStatusRows(consultations.byStatus),
    },
    transactions: {
      byStatus: mapStatusRows(transactions.byStatus),
      totalRevenuePaid: transactions.totalRevenuePaid as string | number,
      totalRefundAmount: transactions.totalRefundAmount as string | number,
    },
    reviews: {
      total: Number(reviews.total ?? 0),
      hidden: Number(reviews.hidden ?? 0),
      visible: Number(reviews.visible ?? 0),
      averageRating:
        reviews.averageRating != null ? Number(reviews.averageRating) : null,
      bySource: {
        booking: Number(bySource.booking ?? 0),
        consultation: Number(bySource.consultation ?? 0),
      },
      ratingDistribution: dist,
    },
    auditLogs: { total: Number(auditLogs.total ?? 0) },
  };
}

function mapNumberArray(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((n) => Number(n ?? 0));
}

function mapAnalytics(raw: unknown): AdminDashboardAnalytics {
  const r = asRecord(raw);
  const trends = asRecord(r.trends);
  const reviews = asRecord(r.reviews);
  const bySource = asRecord(reviews.bySource);
  const paymentMix = asRecord(r.paymentMix);
  const dist = Array.isArray(reviews.ratingDistribution)
    ? reviews.ratingDistribution.map((row) => {
        const d = asRecord(row);
        return { rating: Number(d.rating ?? 0), count: Number(d.count ?? 0) };
      })
    : [];
  const top = Array.isArray(r.topTherapistsByRating)
    ? r.topTherapistsByRating.map((row) => {
        const t = asRecord(row);
        return {
          physiotherapistId: String(t.physiotherapistId ?? ""),
          fullName: String(t.fullName ?? ""),
          averageRating:
            t.averageRating != null ? Number(t.averageRating) : null,
          reviewCount: Number(t.reviewCount ?? 0),
        };
      })
    : [];

  return {
    generatedAt: String(r.generatedAt ?? ""),
    periodDays: Number(r.periodDays ?? 30),
    periodStart: String(r.periodStart ?? ""),
    trends: {
      labels: Array.isArray(trends.labels)
        ? trends.labels.map((l) => String(l))
        : [],
      newUsers: mapNumberArray(trends.newUsers),
      newBookings: mapNumberArray(trends.newBookings),
      newConsultations: mapNumberArray(trends.newConsultations),
      paidRevenue: mapNumberArray(trends.paidRevenue),
    },
    reviews: {
      averageRating:
        reviews.averageRating != null ? Number(reviews.averageRating) : null,
      ratingDistribution: dist,
      bySource: {
        booking: Number(bySource.booking ?? 0),
        consultation: Number(bySource.consultation ?? 0),
      },
    },
    paymentMix: {
      paidBookingCount: Number(paymentMix.paidBookingCount ?? 0),
      paidConsultationCount: Number(paymentMix.paidConsultationCount ?? 0),
      paidBookingRevenue: paymentMix.paidBookingRevenue as string | number,
      paidConsultationRevenue:
        paymentMix.paidConsultationRevenue as string | number,
    },
    topTherapistsByRating: top,
    auditLogsInPeriod: Number(r.auditLogsInPeriod ?? 0),
  };
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  const raw = await apiFetch<unknown>("/admin/dashboard/overview");
  return mapOverview(raw);
}

export async function getAdminDashboardAnalytics(
  params?: { days?: number },
): Promise<AdminDashboardAnalytics> {
  const q = new URLSearchParams();
  if (params?.days != null) q.set("days", String(params.days));
  const suffix = q.toString() ? `?${q}` : "";
  const raw = await apiFetch<unknown>(`/admin/dashboard/analytics${suffix}`);
  return mapAnalytics(raw);
}
