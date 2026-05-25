type StatBarProps = {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
  barClassName?: string;
};

export function StatBar({
  label,
  value,
  max,
  valueLabel,
  barClassName = "bg-teal-600",
}: StatBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium tabular-nums text-slate-900">
          {valueLabel ?? value}
        </span>
      </div>
      <div
        className="h-2.5 rounded-full bg-slate-100 overflow-hidden"
        role="presentation"
      >
        <div
          className={`h-full rounded-full transition-all ${barClassName}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type TrendBarsProps = {
  labels: string[];
  values: number[];
  formatValue?: (n: number) => string;
};

export function TrendBars({ labels, values, formatValue }: TrendBarsProps) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-1 sm:gap-1.5 h-32">
      {labels.map((label, i) => {
        const v = values[i] ?? 0;
        const h = Math.max(4, Math.round((v / max) * 100));
        const short = label.slice(5);
        return (
          <div
            key={label}
            className="flex flex-1 flex-col items-center justify-end gap-1 min-w-0"
            title={`${label}: ${formatValue ? formatValue(v) : v}`}
          >
            <div
              className="w-full max-w-[2rem] rounded-t-md bg-teal-600/90"
              style={{ height: `${h}%` }}
            />
            <span className="text-[10px] text-slate-500 tabular-nums truncate w-full text-center">
              {short}
            </span>
          </div>
        );
      })}
    </div>
  );
}
