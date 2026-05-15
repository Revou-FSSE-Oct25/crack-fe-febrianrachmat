import { RouteListPageLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteListPageLoading
      label="Memuat notifikasi…"
      shell="default"
      rows={6}
    />
  );
}
