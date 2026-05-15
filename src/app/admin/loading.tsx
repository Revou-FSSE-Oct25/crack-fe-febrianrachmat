import { RouteListPageLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteListPageLoading
      label="Memuat panel admin…"
      shell="admin"
      rows={4}
    />
  );
}
