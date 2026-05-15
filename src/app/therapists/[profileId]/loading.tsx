import { RouteListPageLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteListPageLoading
      label="Memuat profil fisioterapis…"
      shell="default"
      rows={3}
    />
  );
}
