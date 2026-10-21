import { Database, FlaskConical } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function BrandHeader({
  depoName,
  depoRegion,
  lastUpdate,
  source,
}: {
  depoName: string;
  depoRegion: string;
  lastUpdate: string;
  source: "database" | "demo";
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/55 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      <div className="flex flex-col items-center gap-4 px-4 py-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black italic tracking-tighter text-sky-400">
            KAI
          </span>
          <span className="mb-1 h-5 w-1.5 -skew-x-12 rounded-sm bg-amber-500" />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-300/80 sm:text-[11px]">
            Data Pantauan Roda Lokomotif CC205
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-50 sm:text-xl md:text-2xl">
            {depoName}
          </h1>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">
            {depoRegion}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold tracking-tight text-slate-100">
            Danantara
          </p>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Indonesia
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-white/[0.02] px-4 py-2 text-[10px] text-slate-500 sm:px-6">
        <span
          className={
            source === "database"
              ? "inline-flex items-center gap-1.5 text-emerald-300"
              : "inline-flex items-center gap-1.5 text-sky-300"
          }
        >
          {source === "database" ? (
            <Database className="size-3" />
          ) : (
            <FlaskConical className="size-3" />
          )}
          {source === "database" ? "Database aktif" : "Mode data demo"}
        </span>
        <span>
          Data last updated:{" "}
          <span className="text-slate-300">
            {lastUpdate ? formatDate(lastUpdate) : "Belum ada data"}
          </span>
        </span>
      </div>
    </div>
  );
}
