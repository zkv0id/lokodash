import { Fragment } from "react";
import Link from "next/link";
import type { LokomotifView } from "@/lib/analytics";
import { AXLES, SIDES, statusLabel } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { statusCellClass } from "./ui";

export function Heatmap({ rows }: { rows: LokomotifView[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-slate-500">
        Tidak ada lokomotif pada filter ini.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {rows.map((row) => {
          const wheels = new Map(
            row.wheels.map((wheel) => [`${wheel.axle}${wheel.side}`, wheel]),
          );

          return (
            <div
              key={row.lokomotif.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/lokomotif/${row.lokomotif.id}`}
                  className="truncate text-xs font-medium text-slate-200 transition hover:text-amber-300"
                >
                  {row.lokomotif.nomor}
                </Link>
                <span className="shrink-0 text-[10px] text-slate-500">
                  {row.wheels.length} roda
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-6 gap-1.5">
                {AXLES.map((axle) => (
                  <div key={axle}>
                    <div className="flex gap-0.5">
                      {SIDES.map((side) => {
                        const wheel = wheels.get(`${axle}${side}`);
                        return wheel ? (
                          <Link
                            key={side}
                            href={`/lokomotif/${row.lokomotif.id}?wheel=${axle}${side}`}
                            title={`Roda ${axle}${side} - ${statusLabel(wheel.status)}`}
                            aria-label={`Roda ${axle}${side} - ${statusLabel(wheel.status)}`}
                            className={cn(
                              "h-5 flex-1 rounded-[3px] transition active:opacity-70",
                              statusCellClass(wheel.status),
                            )}
                          />
                        ) : (
                          <span
                            key={side}
                            className="h-5 flex-1 rounded-[3px] bg-slate-800"
                          />
                        );
                      })}
                    </div>
                    <span className="mt-1 block text-center text-[9px] tabular-nums text-slate-600">
                      {axle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto pb-1 md:block">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[150px_repeat(12,minmax(0,1fr))] items-center gap-1">
            <div className="pr-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">
              Lokomotif
            </div>
            {AXLES.flatMap((axle) =>
              SIDES.map((side) => (
                <div
                  key={`${axle}${side}`}
                  className="text-center text-[10px] font-medium text-slate-500"
                >
                  {axle}
                  {side}
                </div>
              )),
            )}

            {rows.map((row) => (
              <Fragment key={row.lokomotif.id}>
                <Link
                  href={`/lokomotif/${row.lokomotif.id}`}
                  className="flex items-center gap-2 truncate pr-2 text-[11px] font-medium text-slate-300 transition hover:text-amber-300"
                  title={`${row.lokomotif.nomor} - ${row.depo?.name ?? ""}`}
                >
                  <span className="truncate">{row.lokomotif.nomor}</span>
                </Link>
                {row.wheels.map((wheel) => (
                  <Link
                    key={`${wheel.axle}${wheel.side}`}
                    href={`/lokomotif/${row.lokomotif.id}?wheel=${wheel.axle}${wheel.side}`}
                    title={`${row.lokomotif.nomor} roda ${wheel.axle}${wheel.side} - ${statusLabel(wheel.status)}`}
                    className={cn(
                      "h-6 rounded-[4px] transition",
                      statusCellClass(wheel.status),
                    )}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
