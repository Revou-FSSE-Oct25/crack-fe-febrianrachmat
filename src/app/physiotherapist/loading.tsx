import { RouteListPageLoading } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <RouteListPageLoading
      label="Memuat halaman fisioterapis…"
      shell="wide"
      rows={4}
    />
  );
}
