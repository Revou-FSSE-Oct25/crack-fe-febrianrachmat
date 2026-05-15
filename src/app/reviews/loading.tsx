import { RouteListPageLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteListPageLoading
      label="Memuat ulasan…"
      shell="default"
      rows={4}
    />
  );
}
