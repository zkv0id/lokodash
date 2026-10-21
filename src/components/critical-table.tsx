import Link from "next/link";
import type { WheelView } from "@/lib/analytics";
import { PARAM_META } from "@/lib/domain";
import { cn, formatDecimal, formatNumber } from "@/lib/utils";
import { StatusBadge } from "./ui";

const ISSUE_CLASS = {
  warning: "bg-amber-500/10 text-amber-300",
  critical: "bg-rose-500/10 text-rose-300",
  invalid: "bg-slate-500/10 text-slate-300",
} as const;

function IssueChips({ row }: { row: WheelView }) {
  return (
    <div className="flex flex-wrap gap-1">
      {row.issues.map((issue) => (
        <span
          key={issue.param}
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] tabular-nums",
            ISSUE_CLASS[issue.status],
          )}
        >
          {PARAM_META[issue.param].short} {formatDecimal(issue.value)}
          {PARAM_META[issue.param].unit}
        </span>
      ))}
    </div>
  );
}

export function CriticalTable({
  rows,
  lokomotifs,
}: {
  rows: WheelView[];
  lokomotifs: { id: number; nomor: string }[];
}) {
  const nomorById = new Map(lokomotifs.map((item) => [item.id, item.nomor]));

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-xs text-slate-500">
        Semua roda dalam batas normal pada filter ini.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <Link
            key={`${row.lokomotifId}-${row.axle}-${row.side}`}
            href={`/lokomotif/${row.lokomotifId}?wheel=${row.axle}${row.side}`}
            className="block rounded-xl border border-white/5 bg-white/[0.02] p-3 transition active:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">
                  {nomorById.get(row.lokomotifId) ?? `#${row.lokomotifId}`}
                </span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                  {row.axle}
                  {row.side}
                </span>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-2">
              <IssueChips row={row} />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              {formatNumber(row.measurement.km)} km
            </p>
          </Link>
        ))}
      </div>

      <div className="-mx-1 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <th className="px-2 py-2 font-medium">Lokomotif</th>
              <th className="px-2 py-2 font-medium">Roda</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Temuan</th>
              <th className="px-2 py-2 text-right font-medium">KM</th>
              <th className="px-2 py-2 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.lokomotifId}-${row.axle}-${row.side}`}
                className="border-b border-white/[0.04] transition last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-2 py-2.5 font-medium text-slate-200">
                  {nomorById.get(row.lokomotifId) ?? `#${row.lokomotifId}`}
                </td>
                <td className="px-2 py-2.5 font-mono text-slate-300">
                  {row.axle}
                  {row.side}
                </td>
                <td className="px-2 py-2.5">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-2 py-2.5">
                  <IssueChips row={row} />
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-slate-400">
                  {formatNumber(row.measurement.km)}
                </td>
                <td className="px-2 py-2.5 text-right">
                  <Link
                    href={`/lokomotif/${row.lokomotifId}?wheel=${row.axle}${row.side}`}
                    className="text-[11px] text-amber-400/90 transition hover:text-amber-300"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
