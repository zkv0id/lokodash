import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardPlus, TrainFront } from "lucide-react";
import { buildDetail } from "@/lib/analytics";
import { loadDataset } from "@/lib/data";
import {
  PARAM_META,
  statusLabel,
  wheelStatus,
  type LokomotifStatus,
} from "@/lib/domain";
import { cn, formatDate, formatDecimal, formatNumber } from "@/lib/utils";
import { WheelsetTrend } from "@/components/charts/wheelset-trend";
import {
  Card,
  SectionCard,
  StatCard,
  StatusBadge,
  statusCellClass,
} from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lokomotifId = Number(id);
  if (!Number.isInteger(lokomotifId) || lokomotifId <= 0) {
    return { title: "Lokomotif tidak ditemukan" };
  }

  const { data } = await loadDataset();
  const lokomotif = data.lokomotifs.find((item) => item.id === lokomotifId);
  if (!lokomotif) return { title: "Lokomotif tidak ditemukan" };

  const depo = data.depos.find((item) => item.id === lokomotif.depoId);
  const title = `${lokomotif.nomor} - Detail Roda`;
  const description = `Status wheelset, temuan parameter, riwayat pengukuran, dan estimasi lifetime ${lokomotif.nomor} di ${depo?.name ?? "depo lokomotif"}.`;

  return {
    title,
    description,
    alternates: { canonical: `/lokomotif/${lokomotif.id}` },
    openGraph: {
      title,
      description,
      url: `/lokomotif/${lokomotif.id}`,
    },
  };
}

export const dynamic = "force-dynamic";

const LOCO_STATUS_STYLE: Record<LokomotifStatus, string> = {
  aktif: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25",
  perawatan: "bg-amber-500/10 text-amber-300 ring-amber-400/25",
  rusak: "bg-rose-500/10 text-rose-300 ring-rose-400/25",
};

export default async function LokomotifDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ wheel?: string }>;
}) {
  const { id } = await params;
  const { wheel } = await searchParams;
  const lokomotifId = Number(id);

  if (!Number.isInteger(lokomotifId) || lokomotifId <= 0) notFound();

  const { data } = await loadDataset();
  const detail = buildDetail(data, lokomotifId, wheel);
  if (!detail) notFound();

  const selectedWheel = detail.wheels.find(
    (item) =>
      item.axle === detail.selected?.axle && item.side === detail.selected?.side,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke dashboard
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25">
            <TrainFront className="size-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
                {detail.lokomotif.nomor}
              </h1>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset",
                  LOCO_STATUS_STYLE[detail.lokomotif.status],
                )}
              >
                {detail.lokomotif.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {detail.depo?.name ?? "Depo tidak diketahui"} -{" "}
              {detail.depo?.region ?? "-"}
            </p>
          </div>
        </div>

        <Link
          href={`/input?loko=${detail.lokomotif.id}`}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          <ClipboardPlus className="size-4" />
          Input pengukuran
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Roda urgent"
          value={detail.counts.critical}
          hint={`${detail.counts.warning} warning`}
          tone="bad"
        />
        <StatCard
          label="Roda warning"
          value={detail.counts.warning}
          hint={`${detail.counts.invalid} invalid`}
          tone="warn"
        />
        <StatCard
          label="Roda invalid"
          value={detail.counts.invalid}
          hint="Di luar rentang ukur"
        />
        <StatCard
          label="Roda normal"
          value={detail.counts.normal}
          hint={`dari ${detail.wheels.length} roda`}
          tone="good"
        />
        <StatCard
          label="Estimasi lifetime"
          value={detail.lifetime.days === null ? "—" : detail.lifetime.days}
          unit={detail.lifetime.days === null ? undefined : "hari"}
          hint={
            detail.lifetime.param
              ? `Batas ${PARAM_META[detail.lifetime.param].label.toLowerCase()}`
              : `${formatDecimal(detail.avgDiameter)} mm diameter`
          }
          tone={detail.lifetime.days !== null && detail.lifetime.days < 0 ? "bad" : "info"}
        />
      </div>

      <SectionCard
        title="Tren tebal flange per axle"
        description="Rata-rata sisi kiri dan kanan untuk setiap posisi axle."
      >
        <WheelsetTrend data={detail.trend} />
      </SectionCard>

      <SectionCard
        title="Kondisi wheelset terbaru"
        description="Klik roda untuk melihat riwayat pengukurannya."
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {detail.wheels.map((wheelItem) => {
            const active =
              wheelItem.axle === detail.selected?.axle &&
              wheelItem.side === detail.selected?.side;
            return (
              <Link
                key={`${wheelItem.axle}${wheelItem.side}`}
                href={`/lokomotif/${detail.lokomotif.id}?wheel=${wheelItem.axle}${wheelItem.side}`}
                className={cn(
                  "rounded-xl border p-3 transition",
                  active
                    ? "border-amber-400/50 bg-amber-500/[0.06]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/15",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-slate-200">
                    {wheelItem.axle}
                    {wheelItem.side}
                  </span>
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      statusCellClass(wheelItem.status),
                    )}
                  />
                </div>
                <p className="mt-2.5 text-[10px] uppercase tracking-wide text-slate-500">
                  Diameter
                </p>
                <p className="text-sm tabular-nums text-slate-200">
                  {formatDecimal(wheelItem.measurement.diameterMm)}
                  <span className="ml-0.5 text-[10px] text-slate-500">mm</span>
                </p>
                <p className="mt-1.5 text-[10px] uppercase tracking-wide text-slate-500">
                  Flange
                </p>
                <p className="text-sm tabular-nums text-slate-200">
                  {formatDecimal(wheelItem.measurement.flangeThicknessMm)}
                  <span className="ml-0.5 text-[10px] text-slate-500">mm</span>
                </p>
                <div className="mt-2.5">
                  <StatusBadge status={wheelItem.status} />
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title={`Riwayat roda ${detail.selected ? `${detail.selected.axle}${detail.selected.side}` : "-"}`}
          description="Pengukuran terbaru berada di urutan teratas."
        >
          <div className="space-y-2 md:hidden">
            {detail.history.map((item) => {
              const status = wheelStatus(item);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-slate-200">
                        {formatDate(item.measuredAt)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {formatNumber(item.km)} km
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <dt className="text-slate-500">Diameter</dt>
                      <dd className="mt-0.5 tabular-nums text-slate-300">
                        {formatDecimal(item.diameterMm)} mm
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">T. Flange</dt>
                      <dd className="mt-0.5 tabular-nums text-slate-300">
                        {formatDecimal(item.flangeThicknessMm)} mm
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">H. Flange</dt>
                      <dd className="mt-0.5 tabular-nums text-slate-300">
                        {formatDecimal(item.flangeHeightMm)} mm
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Tread</dt>
                      <dd className="mt-0.5 tabular-nums text-slate-300">
                        {formatDecimal(item.treadWearMm)} mm
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Gauge</dt>
                      <dd className="mt-0.5 tabular-nums text-slate-300">
                        {formatDecimal(item.gaugeMm)} mm
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
            {detail.history.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                Belum ada riwayat pengukuran.
              </p>
            ) : null}
          </div>

          <div className="-mx-1 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[680px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.1em] text-slate-500">
                  <th className="px-2 py-2 font-medium">Tanggal</th>
                  <th className="px-2 py-2 font-medium">KM</th>
                  <th className="px-2 py-2 text-right font-medium">Diameter</th>
                  <th className="px-2 py-2 text-right font-medium">T. Flange</th>
                  <th className="px-2 py-2 text-right font-medium">H. Flange</th>
                  <th className="px-2 py-2 text-right font-medium">Tread</th>
                  <th className="px-2 py-2 text-right font-medium">Gauge</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.history.map((item) => {
                  const status = wheelStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="px-2 py-2.5 text-slate-300">
                        {formatDate(item.measuredAt)}
                      </td>
                      <td className="px-2 py-2.5 tabular-nums text-slate-400">
                        {formatNumber(item.km)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-slate-300">
                        {formatDecimal(item.diameterMm)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-slate-300">
                        {formatDecimal(item.flangeThicknessMm)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-slate-300">
                        {formatDecimal(item.flangeHeightMm)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-slate-300">
                        {formatDecimal(item.treadWearMm)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-slate-300">
                        {formatDecimal(item.gaugeMm)}
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
                {detail.history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-2 py-8 text-center text-slate-500"
                    >
                      Belum ada riwayat pengukuran.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <Card>
          <h2 className="text-sm font-semibold text-slate-100">
            Temuan roda terpilih
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {selectedWheel
              ? `Roda ${selectedWheel.axle}${selectedWheel.side} - ${statusLabel(selectedWheel.status)}`
              : "Belum ada data"}
          </p>

          {selectedWheel ? (
            <div className="mt-4 space-y-2">
              {selectedWheel.issues.length === 0 ? (
                <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  Semua parameter dalam batas normal.
                </p>
              ) : (
                selectedWheel.issues.map((issue) => (
                  <div
                    key={issue.param}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                  >
                    <div>
                      <p className="text-xs text-slate-300">
                        {PARAM_META[issue.param].label}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formatDecimal(issue.value)}
                        {PARAM_META[issue.param].unit}
                      </p>
                    </div>
                    <StatusBadge status={issue.status} />
                  </div>
                ))
              )}

              <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[11px] leading-relaxed text-slate-500">
                Pengukuran terakhir{" "}
                <span className="text-slate-300">
                  {formatDate(selectedWheel.measurement.measuredAt)}
                </span>{" "}
                pada{" "}
                <span className="text-slate-300">
                  {formatNumber(selectedWheel.measurement.km)} km
                </span>
                . Estimasi lifetime{" "}
                <span
                  className={
                    selectedWheel.lifetime.days !== null &&
                    selectedWheel.lifetime.days < 0
                      ? "text-rose-300"
                      : "text-slate-300"
                  }
                >
                  {selectedWheel.lifetime.days === null
                    ? "belum dapat dihitung"
                    : `${selectedWheel.lifetime.days} hari`}
                </span>
                .
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
