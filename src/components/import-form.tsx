"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Link2,
  Loader2,
  Upload,
} from "lucide-react";
import { importData, type ImportState } from "@/app/import/actions";
import { buildTemplateCsv } from "@/lib/import-template";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500/60";

const initialState: ImportState = { ok: false, message: "", errors: [] };

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importData, initialState);
  const [fileName, setFileName] = useState("");

  function downloadTemplate() {
    const blob = new Blob([`\uFEFF${buildTemplateCsv()}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "template-import-wheelset.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Unggah file Excel/CSV, atau tarik data langsung dari Google Sheets.
        </p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5"
        >
          <Download className="size-3.5" />
          Unduh template
        </button>
      </div>

      <label
        htmlFor="file"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center transition hover:border-amber-500/40 hover:bg-amber-500/[0.03]"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25">
          <Upload className="size-5" />
        </span>
        <span className="text-sm font-medium text-slate-200">
          {fileName || "Pilih file Excel atau CSV"}
        </span>
        <span className="text-[11px] text-slate-500">
          .xlsx, .xls, .csv - maksimal 10 MB
        </span>
        <input
          id="file"
          name="file"
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
      </label>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-slate-600">
        <span className="h-px flex-1 bg-white/10" />
        atau
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div>
        <label
          htmlFor="sheetUrl"
          className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500"
        >
          <Link2 className="size-3.5" />
          URL Google Sheets
        </label>
        <input
          id="sheetUrl"
          name="sheetUrl"
          type="url"
          inputMode="url"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className={inputClass}
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
          Bagikan sheet sebagai &quot;Anyone with the link can view&quot; lalu
          tempel link-nya. Data akan ditarik ulang setiap kali impor dijalankan.
          Jika file juga dipilih, file yang dipakai.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}
        {pending ? "Mengimpor data..." : "Impor sekarang"}
      </button>

      {state.message ? (
        <div
          aria-live="polite"
          className={
            state.ok
              ? "rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3.5"
              : "rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-3.5"
          }
        >
          <p
            className={
              state.ok
                ? "flex items-start gap-2 text-xs text-emerald-300"
                : "flex items-start gap-2 text-xs text-rose-300"
            }
          >
            {state.ok ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{state.message}</span>
          </p>

          {state.summary ? (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">
                {state.summary.totalRows} baris terbaca
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                {state.summary.imported} baris tersimpan
              </span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-slate-400">
                {state.summary.mode === "database"
                  ? "Database"
                  : "Penyimpanan lokal"}
              </span>
            </div>
          ) : null}

          {state.errors.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[11px] text-amber-300/90">
              {state.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
