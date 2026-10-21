import type { ReactNode } from "react";
import type { Status } from "@/lib/domain";
import { statusLabel } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-slate-900/50 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur md:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={className}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </Card>
  );
}

const BADGE: Record<Status, string> = {
  normal:
    "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25",
  warning: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-400/25",
  critical: "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-400/25",
  invalid: "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-400/25",
};

const CELL: Record<Status, string> = {
  normal: "bg-emerald-500/70 hover:bg-emerald-400",
  warning: "bg-amber-400/80 hover:bg-amber-300",
  critical: "bg-rose-500/85 hover:bg-rose-400",
  invalid: "bg-slate-400/70 hover:bg-slate-300",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        BADGE[status],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "normal"
            ? "bg-emerald-400"
            : status === "warning"
              ? "bg-amber-400"
              : status === "critical"
                ? "bg-rose-400"
                : "bg-slate-400",
        )}
      />
      {statusLabel(status)}
    </span>
  );
}

export function statusCellClass(status: Status) {
  return CELL[status];
}

const TONE: Record<string, string> = {
  default: "text-slate-100",
  good: "text-emerald-300",
  warn: "text-amber-300",
  bad: "text-rose-300",
  info: "text-sky-300",
};

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: keyof typeof TONE;
}) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium uppercase leading-tight tracking-[0.1em] text-slate-500 sm:text-[11px] sm:tracking-[0.12em]">
          {label}
        </p>
        {icon ? <span className="shrink-0 text-slate-500">{icon}</span> : null}
      </div>
      <p className="mt-2 flex items-baseline gap-1 sm:mt-3">
        <span
          className={cn(
            "text-xl font-semibold tabular-nums sm:text-2xl",
            TONE[tone],
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-[10px] text-slate-500 sm:text-xs">{unit}</span>
        ) : null}
      </p>
      {hint ? (
        <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:mt-1 sm:text-[11px]">
          {hint}
        </p>
      ) : null}
    </Card>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-emerald-500/70" /> Normal
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-amber-400/80" /> Warning
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-rose-500/85" /> Urgent
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-slate-400/70" /> Invalid
      </span>
    </div>
  );
}
