import {
  adminPageShell,
  ListSkeleton,
  pageShell,
  widePageShell,
} from "@/components/ui/page-shell";

type RouteListPageLoadingProps = {
  label?: string;
  shell?: "wide" | "default" | "admin";
  rows?: number;
};

function resolveShell(shell: RouteListPageLoadingProps["shell"]): string {
  if (shell === "admin") return adminPageShell;
  if (shell === "default") return pageShell;
  return widePageShell;
}

/** Skeleton untuk halaman list/data (Next.js `loading.tsx`). */
export function RouteListPageLoading({
  label = "Memuat…",
  shell = "wide",
  rows = 4,
}: RouteListPageLoadingProps) {
  return (
    <main
      className={resolveShell(shell)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="animate-pulse space-y-8">
        <header className="space-y-3">
          <div className="h-5 w-24 rounded-full bg-teal-100" />
          <div className="h-9 w-56 max-w-full rounded-xl bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded-lg bg-slate-100" />
        </header>
        <ListSkeleton rows={rows} />
      </div>
      <span className="sr-only">{label}</span>
    </main>
  );
}

/** Skeleton thread chat (pesan bolak-balik). */
export function RouteChatThreadLoading({
  label = "Memuat percakapan…",
}: {
  label?: string;
}) {
  return (
    <main
      className={`${pageShell} max-w-3xl pb-16`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 rounded-lg bg-slate-200" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-12 max-w-[85%] rounded-2xl bg-slate-100 ${
                i % 2 === 0 ? "mr-auto" : "ml-auto"
              }`}
            />
          ))}
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </main>
  );
}
