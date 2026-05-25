import type { ReviewSourceType } from "@/lib/api/contract";

export function reviewSourceLabel(source: ReviewSourceType): string {
  return source === "CONSULTATION" ? "Konsultasi online" : "Kunjungan";
}
