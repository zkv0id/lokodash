import Link from "next/link";
import { ArrowUpRight, Timer } from "lucide-react";
import type { LokomotifView, ParamValue } from "@/lib/analytics";
import { ACTION_META, PARAM_META, type Status } from "@/lib/domain";
import { cn, formatDate, formatDecimal } from "@/lib/utils";

const VALUE_STYLE: Record<Status, string> = {
  normal: "bg-emerald-500/15 text-emerald-200",
  warning: "bg-amber-500/20 text-amber-200",
  critical: "bg-rose-500/25 text-rose-100",
  invalid: "bg-slate-500/25 text-slate-100",
};

function ValueCell({ value }: { value: ParamValue | null }) {
  if (!value) {
    return <span className="text-slate-600">—</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex min-w-[3.5rem] justify-center rounded-md px-2 py-1 text-[11px] font-medium tabular-nums",
        VALUE_STYLE[value.status],
      )}
    >
      {formatDecimal(value.value)}
    </span>
  );
}

function LifetimeCell({
  days,
  param,
}: {
  days: number | null;
  param: LokomotifView["lifetime"]["param"];
}) {
  if (days === null) {
    return <span className="text-slate-600">—</span>;
  }
  const tone =
    days < 0
      ? "text-rose-300"
      : days <= 30
        ? "text-amber-300"
        : "text-emerald-300";
  return (
    <span
      className={cn("inline-flex items-center gap-1 tabular-nums", tone)}
      title={
        param
          ? `Berdasarkan laju keausan ${PARAM_META[param].label.toLowerCase()}`
          : undefined
      }
    >
      <Timer className="size-3" />
      {days} Hari
    </span>
  );
}

function ActionBadge({ action }: { action: LokomotifView["action"] }) {
  const meta = ACTION_META[action];
  return (
    <span
      title={meta.label}
      className={cn(
        "inline-flex min-w-10 justify-center rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ring-inset",
        meta.className,
      )}
    >
      {action}
    </span>
  );
}

export function LocomotiveTable({ rows }: { rows: LokomotifView[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-xs text-slate-500">
        Tidak ada lokomotif pada filter ini.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {rows.map((row, index) => (
          <Link
            key={row.lokomotif.id}
            href={`/lokomotif/${row.lokomotif.id}`}
            className="block rounded-xl border border-white/5 bg-white/[0.02] p-3 transition active:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-[10px] tabular-nums text-slate-600">
                  {index + 1}.
                </span>
                <span className="truncate text-sm font-medium text-slate-200">
                  {row.lokomotif.nomor}
                </span>
                <ArrowUpRight className="size-3 shrink-0 text-slate-600" />
              </div>
              <ActionBadge action={row.action} />
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Inspeksi {row.inspectionDate ? formatDate(row.inspectionDate) : "—"}
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-500">
                  Min diameter
                </p>
                <div className="mt-0.5">
                  <ValueCell value={row.minima.diameter} />
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-500">
                  Min t. flange
                </p>
                <div className="mt-0.5">
                  <ValueCell value={row.minima.flangeThickness} />
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-500">
                  Min h. flange
                </p>
                <div className="mt-0.5">
                  <ValueCell value={row.minima.flangeHeight} />
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
              <span className="text-slate-500">Estimasi lifetime</span>
              <LifetimeCell
                days={row.lifetime.days}
                param={row.lifetime.param}
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="-mx-1 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[780px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.1em] text-slate-500">
              <th className="px-2 py-2 text-right font-medium">No</th>
              <th className="px-2 py-2 font-medium">Lokomotif</th>
              <th className="px-2 py-2 font-medium">Inspection date</th>
              <th className="px-2 py-2 text-center font-medium">Min diameter</th>
              <th className="px-2 py-2 text-center font-medium">
                Min flange thickness
              </th>
              <th className="px-2 py-2 text-center font-medium">
                Min flange height
              </th>
              <th className="px-2 py-2 text-center font-medium">
                Action status
              </th>
              <th className="px-2 py-2 text-right font-medium">
                Estimated lifetime
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.lokomotif.id}
                className="border-b border-white/[0.04] transition last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-2 py-2.5 text-right tabular-nums text-slate-600">
                  {index + 1}.
                </td>
                <td className="px-2 py-2.5">
                  <Link
                    href={`/lokomotif/${row.lokomotif.id}`}
                    className="inline-flex items-center gap-1 font-medium text-slate-200 transition hover:text-amber-300"
                  >
                    {row.lokomotif.nomor}
                    <ArrowUpRight className="size-3 text-slate-600" />
                  </Link>
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    {row.depo?.code ?? "-"} · {row.wheels.length} roda
                  </span>
                </td>
                <td className="px-2 py-2.5 text-slate-400">
                  {row.inspectionDate ? formatDate(row.inspectionDate) : "—"}
                </td>
                <td className="px-2 py-2.5 text-center">
                  <ValueCell value={row.minima.diameter} />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <ValueCell value={row.minima.flangeThickness} />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <ValueCell value={row.minima.flangeHeight} />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <ActionBadge action={row.action} />
                </td>
                <td className="px-2 py-2.5 text-right">
                  <LifetimeCell
                    days={row.lifetime.days}
                    param={row.lifetime.param}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
