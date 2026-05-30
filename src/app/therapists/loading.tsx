"use client";

import { RouteListPageLoading } from "@/components/ui/route-loading";
import { useLanguage } from "@/contexts/language-context";

export default function Loading() {
  const { t } = useLanguage();
  return <RouteListPageLoading label={t("ui.loadingTherapists")} rows={6} />;
}
