import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  DatabaseZap,
  FileSpreadsheet,
  FlaskConical,
  RefreshCw,
  TableProperties,
} from "lucide-react";
import { loadDataset } from "@/lib/data";
import { IMPORT_COLUMNS } from "@/lib/import-template";
import { ImportForm } from "@/components/import-form";
import { SectionCard } from "@/components/ui";

export const metadata: Metadata = {
  title: "Impor Data Pengukuran",
  description:
    "Impor data pengukuran roda CC205 dari Excel, CSV, atau Google Sheets ke dashboard monitoring.",
};

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const { data, source } = await loadDataset();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke dashboard
      </Link>

      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber-400/80">
          Data Import
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
          Impor data pengukuran
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-slate-400">
          Unggah Excel/CSV atau hubungkan Google Sheets. Data langsung
          menggantikan pengukuran roda pada tanggal yang sama dan dashboard
          diperbarui otomatis.
        </p>
      </div>

      <div
        className={
          source === "database"
            ? "flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-3.5 py-2.5 text-xs text-emerald-300"
            : "flex items-start gap-2 rounded-xl border border-sky-400/20 bg-sky-500/[0.06] px-3.5 py-2.5 text-xs text-sky-300"
        }
      >
        {source === "database" ? (
          <DatabaseZap className="mt-0.5 size-4 shrink-0" />
        ) : (
          <FlaskConical className="mt-0.5 size-4 shrink-0" />
        )}
        {source === "database" ? (
          <span>
            Terhubung ke database. Hasil impor disimpan permanen ke PostgreSQL.
          </span>
        ) : (
          <span>
            Mode demo aktif. Hasil impor disimpan lokal di{" "}
            <code>.data/imports.json</code> sehingga dashboard tetap berubah
            tanpa database. Hubungkan <code>DATABASE_URL</code> untuk
            penyimpanan permanen.
          </span>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Sumber data"
          description="Excel, CSV, atau Google Sheets."
        >
          <ImportForm />
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Data saat ini"
            description="Ringkasan dataset yang tampil di dashboard."
          >
            <dl className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Lokomotif</dt>
                <dd className="font-medium tabular-nums text-slate-200">
                  {data.lokomotifs.length}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Depo</dt>
                <dd className="font-medium tabular-nums text-slate-200">
                  {data.depos.length}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Baris pengukuran</dt>
                <dd className="font-medium tabular-nums text-slate-200">
                  {data.measurements.length}
                </dd>
              </div>
            </dl>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-400 transition hover:text-amber-300"
            >
              Lihat dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          </SectionCard>

          <SectionCard
            title="Cara kerja impor"
            description="Aman diulang tanpa membuat data ganda."
          >
            <ul className="space-y-3 text-[11px] leading-relaxed text-slate-400">
              <li className="flex gap-2">
                <RefreshCw className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                Baris dengan lokomotif, axle, sisi, dan tanggal yang sama akan
                diperbarui, bukan diduplikasi.
              </li>
              <li className="flex gap-2">
                <TableProperties className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                Depo dan lokomotif baru otomatis dibuat dari kolom{" "}
                <code>depo</code> dan <code>lokomotif</code>.
              </li>
              <li className="flex gap-2">
                <FileSpreadsheet className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                Format tanggal yang didukung: <code>YYYY-MM-DD</code>,{" "}
                <code>DD/MM/YYYY</code>, atau tanggal Excel.
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Format kolom"
        description="Baris pertama harus berupa header. Nama kolom tidak peka huruf besar/kecil."
      >
        <div className="flex flex-wrap gap-1.5">
          {IMPORT_COLUMNS.map((column) => (
            <span
              key={column}
              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-slate-300"
            >
              {column}
            </span>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 text-[11px] leading-relaxed text-slate-500">
          <p>
            Kolom wajib: <code>lokomotif</code>, <code>axle</code> (1-6),{" "}
            <code>side</code> (L/R), <code>tanggal</code>, <code>km</code>,{" "}
            <code>diameter_mm</code>, <code>flange_thickness_mm</code>,{" "}
            <code>flange_height_mm</code>, <code>tread_wear_mm</code>,{" "}
            <code>gauge_mm</code>.
          </p>
          <p>
            Kolom opsional: <code>depo</code>, <code>catatan</code>. Satuan
            dimensi dalam milimeter. Status roda dihitung ulang otomatis dari
            ambang batas.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
