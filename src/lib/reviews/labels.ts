import type { ReviewSourceType } from "@/lib/api/contract";
import { translate } from "@/lib/i18n/dictionary";
import type { Language } from "@/lib/i18n/storage";

export function reviewSourceLabel(
  source: ReviewSourceType,
  language: Language = "id",
): string {
  return source === "CONSULTATION"
    ? translate(language, "review.onlineConsultationPrefix")
    : translate(language, "review.sourceVisit");
}
