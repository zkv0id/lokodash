import type { StatusCounts } from "@/lib/analytics";

const ROWS = [
  { key: "normal", label: "Normal", bar: "bg-emerald-500/70", dot: "bg-emerald-400" },
  { key: "warning", label: "Warning", bar: "bg-amber-400/80", dot: "bg-amber-400" },
  { key: "critical", label: "Urgent", bar: "bg-rose-500/85", dot: "bg-rose-400" },
  { key: "invalid", label: "Invalid", bar: "bg-slate-400/70", dot: "bg-slate-400" },
] as const;

export function StatusDistribution({ counts }: { counts: StatusCounts }) {
  const total =
    counts.normal + counts.warning + counts.critical + counts.invalid;
  const safeTotal = total === 0 ? 1 : total;

  return (
    <div>
      <p className="text-3xl font-semibold tabular-nums text-slate-100">
        {total}
        <span className="ml-1.5 text-xs font-normal text-slate-500">
          roda terpantau
        </span>
      </p>

      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-800">
        {ROWS.map((row) => {
          const value = counts[row.key];
          if (value === 0) return null;
          return (
            <div
              key={row.key}
              className={row.bar}
              style={{ width: `${(value / safeTotal) * 100}%` }}
            />
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {ROWS.map((row) => {
          const value = counts[row.key];
          const percent = total === 0 ? 0 : (value / total) * 100;
          return (
            <div
              key={row.key}
              className="flex items-center justify-between text-xs"
            >
              <span className="flex items-center gap-2 text-slate-400">
                <span className={`size-2 rounded-full ${row.dot}`} />
                {row.label}
              </span>
              <span className="tabular-nums text-slate-300">
                {value}
                <span className="ml-2 text-slate-500">
                  {percent.toFixed(0)}%
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
