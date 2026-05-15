import { RouteListPageLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteListPageLoading
      label="Memuat profil…"
      shell="default"
      rows={2}
    />
  );
}
