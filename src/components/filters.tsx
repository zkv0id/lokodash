"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarRange,
  Filter,
  History,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import type { FormEvent } from "react";
import type { StatusCounts } from "@/lib/analytics";
import { STATUS_ORDER, statusLabel, type Status } from "@/lib/domain";
import { cn } from "@/lib/utils";

const selectClass =
  "w-full min-w-0 rounded-lg border border-white/10 bg-slate-950/70 px-2.5 py-2.5 text-xs text-slate-200 outline-none transition focus:border-amber-500/60 sm:w-auto sm:px-3 sm:py-2";

const CHIP_STYLE: Record<Status, string> = {
  critical:
    "data-[active=true]:bg-rose-500/20 data-[active=true]:text-rose-200 data-[active=true]:ring-rose-400/40",
  warning:
    "data-[active=true]:bg-amber-500/20 data-[active=true]:text-amber-200 data-[active=true]:ring-amber-400/40",
  normal:
    "data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-200 data-[active=true]:ring-emerald-400/40",
  invalid:
    "data-[active=true]:bg-slate-500/25 data-[active=true]:text-slate-100 data-[active=true]:ring-slate-400/40",
};

export function Filters({
  depos,
  defaultDepoId,
  counts,
  presets,
  latestDate,
}: {
  depos: { id: number; code: string; name: string }[];
  defaultDepoId?: number;
  counts: StatusCounts;
  presets: { exKka: number; rcd: number; recent: number };
  latestDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const depo =
    params.get("depo") ?? (defaultDepoId ? String(defaultDepoId) : "");
  const status = params.get("status") ?? "";
  const view = params.get("view") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const explicitDepo = params.get("depo");
  const hasFilter = Boolean(
    (explicitDepo && explicitDepo !== String(defaultDepoId ?? "")) ||
      status ||
      view ||
      from ||
      to,
  );

  function update(next: Record<string, string | undefined>) {
    const query = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) query.set(key, value);
      else query.delete(key);
    }
    const qs = query.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function applyRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextFrom = String(form.get("from") ?? "");
    const nextTo = String(form.get("to") ?? "");
    update({ from: nextFrom, to: nextTo, view: undefined });
  }

  return (
    <div className="space-y-2.5 rounded-2xl border border-white/[0.06] bg-slate-900/40 p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <SlidersHorizontal className="size-3" />
            Select condition
          </span>
          {STATUS_ORDER.map((key) => {
            const active = status === key;
            return (
              <button
                key={key}
                type="button"
                data-active={active}
                onClick={() =>
                  update({ status: active ? undefined : key, view: undefined })
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-slate-400 ring-1 ring-inset ring-transparent transition hover:bg-white/[0.06] hover:text-slate-200",
                  CHIP_STYLE[key],
                )}
              >
                {statusLabel(key)}
                <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-300">
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter depo"
            value={depo}
            onChange={(event) =>
              update({ depo: event.target.value, view: undefined })
            }
            className={selectClass}
          >
            <option value="all">Semua depo</option>
            {depos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
          {hasFilter ? (
            <button
              type="button"
              onClick={() => router.push(pathname, { scroll: false })}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              <RotateCcw className="size-3" />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/5 pt-2.5 xl:flex-row xl:items-center xl:justify-between">
        <form
          key={`${from}-${to}`}
          onSubmit={applyRange}
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className="mr-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <CalendarRange className="size-3" />
            Date range
          </span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            max={latestDate || undefined}
            aria-label="Tanggal mulai"
            className="rounded-lg border border-white/10 bg-slate-950/70 px-2 py-1.5 text-[11px] text-slate-200 outline-none focus:border-amber-500/60"
          />
          <span className="text-[10px] text-slate-500">s/d</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            max={latestDate || undefined}
            aria-label="Tanggal akhir"
            className="rounded-lg border border-white/10 bg-slate-950/70 px-2 py-1.5 text-[11px] text-slate-200 outline-none focus:border-amber-500/60"
          />
          <button
            type="submit"
            className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition hover:bg-white/15"
          >
            Terapkan
          </button>
          {from || to ? (
            <span className="text-[10px] text-slate-500">
              {from || "awal"} - {to || "akhir"}
            </span>
          ) : null}
        </form>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-active={view === "exkka"}
            onClick={() =>
              update({
                view: view === "exkka" ? undefined : "exkka",
                from: undefined,
                to: undefined,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-medium text-sky-200 transition hover:bg-sky-500/20 data-[active=true]:ring-2 data-[active=true]:ring-sky-400/40"
          >
            <Filter className="size-3" />
            EX KKA
            <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] tabular-nums">
              {presets.exKka}
            </span>
          </button>
          <button
            type="button"
            data-active={view === "rcd"}
            onClick={() =>
              update({
                view: view === "rcd" ? undefined : "rcd",
                from: undefined,
                to: undefined,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400/20 bg-teal-500/10 px-2.5 py-1.5 text-[11px] font-medium text-teal-200 transition hover:bg-teal-500/20 data-[active=true]:ring-2 data-[active=true]:ring-teal-400/40"
          >
            <Filter className="size-3" />
            PANTAUAN RCD
            <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] tabular-nums">
              {presets.rcd}
            </span>
          </button>
          <button
            type="button"
            data-active={view === "recent"}
            onClick={() =>
              update({
                view: view === "recent" ? undefined : "recent",
                from: undefined,
                to: undefined,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-200 transition hover:bg-amber-500/20 data-[active=true]:ring-2 data-[active=true]:ring-amber-400/40"
          >
            <History className="size-3" />
            RECENT DATA
            <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] tabular-nums">
              {presets.recent}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
