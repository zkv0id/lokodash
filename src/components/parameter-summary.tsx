import {
  AlertOctagon,
  ArrowUpDown,
  CircleCheckBig,
  CircleSlash,
  Gauge,
  Ruler,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ParamSummary } from "@/lib/analytics";
import {
  PARAM_META,
  PARAM_REQUIREMENT,
  STATUS_ORDER,
  statusLabel,
  type Status,
} from "@/lib/domain";
import { cn, formatDecimal } from "@/lib/utils";

const PARAM_ICON: Record<
  "diameter" | "flangeThickness" | "flangeHeight",
  LucideIcon
> = {
  diameter: Gauge,
  flangeThickness: Ruler,
  flangeHeight: ArrowUpDown,
};

const STATUS_STYLE: Record<
  Status,
  { icon: LucideIcon; row: string; count: string; dot: string }
> = {
  critical: {
    icon: AlertOctagon,
    row: "border-rose-400/15 bg-rose-500/[0.07]",
    count: "text-rose-300",
    dot: "bg-rose-400",
  },
  warning: {
    icon: TriangleAlert,
    row: "border-amber-400/15 bg-amber-500/[0.06]",
    count: "text-amber-300",
    dot: "bg-amber-400",
  },
  normal: {
    icon: CircleCheckBig,
    row: "border-emerald-400/15 bg-emerald-500/[0.05]",
    count: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  invalid: {
    icon: CircleSlash,
    row: "border-slate-400/15 bg-slate-500/[0.06]",
    count: "text-slate-300",
    dot: "bg-slate-400",
  },
};

function rangeLabel(
  range: { min: number; max: number } | null,
  status: Status,
): string {
  if (status === "invalid") return "Out of range";
  if (!range) return "Belum ada data";
  if (range.min === range.max) return formatDecimal(range.min);
  return `${formatDecimal(range.min)} – ${formatDecimal(range.max)}`;
}

export function ParameterSummary({
  summaries,
}: {
  summaries: ParamSummary[];
}) {
  const monitored = summaries.filter(
    (item): item is ParamSummary & { param: keyof typeof PARAM_ICON } =>
      item.param in PARAM_ICON,
  );

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {monitored.map((summary) => {
        const Icon = PARAM_ICON[summary.param];
        const total = STATUS_ORDER.reduce(
          (sum, status) => sum + summary.counts[status],
          0,
        );
        return (
          <div
            key={summary.param}
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/55 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/5 bg-white/[0.03] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-400/20">
                  <Icon className="size-3.5" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                  {PARAM_META[summary.param].short}
                </p>
              </div>
              <span className="text-[10px] tabular-nums text-slate-500">
                {total} data
              </span>
            </div>

            <div className="space-y-1.5 p-2">
              {STATUS_ORDER.map((status) => {
                const style = STATUS_STYLE[status];
                const StatusIcon = style.icon;
                const count = summary.counts[status];
                return (
                  <div
                    key={status}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2",
                      style.row,
                    )}
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        <StatusIcon className={cn("size-3", style.count)} />
                        {statusLabel(status)}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] tabular-nums text-slate-500">
                        {rangeLabel(summary.ranges[status], status)}
                        {status !== "invalid" && summary.ranges[status]
                          ? ` ${PARAM_META[summary.param].unit}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-xl font-semibold tabular-nums",
                        style.count,
                      )}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="border-t border-white/5 px-3 py-2 text-[10px] leading-relaxed text-slate-500">
              {PARAM_REQUIREMENT[summary.param]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
