import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, DatabaseZap, FlaskConical } from "lucide-react";
import { loadDataset } from "@/lib/data";
import { PARAM_KEYS, PARAM_META, PARAM_REQUIREMENT } from "@/lib/domain";
import { MeasurementForm } from "@/components/measurement-form";
import { SectionCard } from "@/components/ui";

export const metadata: Metadata = {
  title: "Input Pengukuran Roda",
  description:
    "Catat pengukuran wheelset CC205 dan dapatkan status Urgent, Warning, Normal, atau Invalid secara otomatis.",
};

export const dynamic = "force-dynamic";

export default async function InputPage({
  searchParams,
}: {
  searchParams: Promise<{ loko?: string }>;
}) {
  const params = await searchParams;
  const { data, source } = await loadDataset();
  const today = new Date().toISOString().slice(0, 10);
  const defaultLokomotifId =
    params.loko && /^\d+$/.test(params.loko)
      ? Number(params.loko)
      : undefined;

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
          Field Measurement
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
          Input pengukuran roda
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-slate-400">
          Catat hasil pengukuran wheelset. Status akan dihitung otomatis
          terhadap ambang batas keausan.
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
            Terhubung ke database. Pengukuran akan langsung disimpan dan
            tercermin di dashboard.
          </span>
        ) : (
          <span>
            Mode demo aktif. Isi <code>DATABASE_URL</code> lalu jalankan{" "}
            <code>npm run db:push</code> dan <code>npm run db:seed</code> agar
            pengukuran dapat disimpan permanen.
          </span>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Form pengukuran"
          description="Semua nilai dimensi dalam milimeter."
        >
          <MeasurementForm
            lokomotifs={data.lokomotifs.map((item) => ({
              id: item.id,
              nomor: item.nomor,
            }))}
            today={today}
            defaultLokomotifId={defaultLokomotifId}
          />
        </SectionCard>

        <SectionCard
          title="Ambang batas"
          description="Nilai referensi status otomatis."
        >
          <div className="space-y-2.5">
            {PARAM_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <p className="text-xs font-medium text-slate-200">
                  {PARAM_META[key].label}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  {PARAM_REQUIREMENT[key]}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
