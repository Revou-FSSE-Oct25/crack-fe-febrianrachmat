import { RouteListPageLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteListPageLoading
      label="Memuat analytics…"
      shell="admin"
      rows={4}
    />
  );
}
