/** Inclusive local calendar month range as ISO strings for API query. */
export function monthBoundsIso(year: number, month: number): {
  from: string;
  to: string;
} {
  const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** Day-of-month keys (1–31) for grouping items in the month grid. */
export function dayOfMonthKey(iso: string): number {
  return new Date(iso).getDate();
}
