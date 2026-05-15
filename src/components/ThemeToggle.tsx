"use client";

import { IconMoon, IconSun } from "@/components/nav-icons";
import { useTheme } from "@/contexts/theme-context";

const btnClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200/90 bg-white/90 backdrop-blur-sm hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-200/90 hover:shadow-sm transition-[box-shadow,colors,transform] duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-600/80 dark:hover:bg-slate-700 dark:hover:text-teal-200 dark:hover:ring-teal-700/60";

export default function ThemeToggle() {
  const { resolvedDark, toggle } = useTheme();

  return (
    <button
      type="button"
      className={btnClass}
      onClick={toggle}
      aria-label={resolvedDark ? "Mode terang" : "Mode gelap"}
      title={resolvedDark ? "Mode terang" : "Mode gelap"}
    >
      {resolvedDark ? <IconSun /> : <IconMoon />}
      <span className="sr-only">
        {resolvedDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      </span>
    </button>
  );
}
