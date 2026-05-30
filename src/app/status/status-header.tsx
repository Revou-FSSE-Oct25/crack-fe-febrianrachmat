"use client";

import { PageHeader } from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";

export function StatusHeader() {
  const { t } = useLanguage();

  return (
    <PageHeader
      eyebrow={t("mkt.statusEyebrow")}
      title={t("mkt.statusTitle")}
      description={t("mkt.statusDesc")}
    />
  );
}
