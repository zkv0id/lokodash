import {
  AlertOctagon,
  CircleCheckBig,
  CircleSlash,
  Gauge,
  TrainFront,
  Wrench,
} from "lucide-react";
import {
  buildDashboard,
  type DashboardView,
} from "@/lib/analytics";
import { loadDataset } from "@/lib/data";
import {
  ACTION_META,
  PARAM_KEYS,
  PARAM_META,
  PARAM_REQUIREMENT,
  isStatus,
} from "@/lib/domain";
import { formatDecimal } from "@/lib/utils";
import { BrandHeader } from "@/components/brand-header";
import { Filters } from "@/components/filters";
import { Heatmap } from "@/components/heatmap";
import { LocomotiveTable } from "@/components/locomotive-table";
import { ParameterSummary } from "@/components/parameter-summary";
import { ParetoChart } from "@/components/charts/pareto-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { StatusDistribution } from "@/components/status-distribution";
import {
  Legend,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function dateParam(value: string | string[] | undefined) {
  const text = first(value);
  return text && /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : undefined;
}

function viewParam(value: string | string[] | undefined): DashboardView {
  const text = first(value);
  if (text === "exkka" || text === "rcd" || text === "recent") return text;
  return "all";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { data, source } = await loadDataset();

  const depoParam = first(params.depo);
  const showAllDepos = depoParam === "all";
  const defaultDepoId =
    data.depos.find((item) => item.code === "KDR")?.id ?? data.depos[0]?.id;
  const depoId = showAllDepos
    ? undefined
    : depoParam && /^\d+$/.test(depoParam)
      ? Number(depoParam)
      : defaultDepoId;
  const statusParam = first(params.status);
  const status = isStatus(statusParam) ? statusParam : undefined;
  const from = dateParam(params.from);
  const to = dateParam(params.to);
  const view = viewParam(params.view);

  const dashboard = buildDashboard(data, {
    depoId,
    status,
    from,
    to,
    view: view === "all" ? undefined : view,
  });

  const activeDepo = depoId
    ? data.depos.find((item) => item.id === depoId)
    : undefined;
  const depoName = showAllDepos
    ? "Seluruh Depo Lokomotif CC205"
    : (activeDepo?.name ?? "Depo Lokomotif Kampung Durian Runtuh");
  const depoRegion = showAllDepos
    ? "Divisi Regional IV"
    : (activeDepo?.region ?? "Divisi Regional IV");

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
      <BrandHeader
        depoName={depoName}
        depoRegion={depoRegion}
        lastUpdate={dashboard.latestDate}
        source={source}
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-2 px-1">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Ringkasan per parameter
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Hitungan kondisi seluruh roda pada scope dan tanggal terpilih.
            </p>
          </div>
          <Legend />
        </div>
        <ParameterSummary summaries={dashboard.paramSummaries} />
      </div>

      <Filters
        depos={data.depos}
        defaultDepoId={defaultDepoId}
        counts={dashboard.statusCounts}
        presets={dashboard.presets}
        latestDate={dashboard.latestDate}
      />

      <div className="grid grid-cols-2 gap-2.5 [&>*:last-child]:col-span-2 sm:grid-cols-3 sm:gap-3 sm:[&>*:last-child]:col-span-1 lg:grid-cols-5">
        <StatCard
          label="Lokomotif"
          value={dashboard.kpis.lokomotif}
          hint={`${dashboard.rows.length} unit dalam scope`}
          icon={<TrainFront className="size-4" />}
        />
        <StatCard
          label="Roda dipantau"
          value={dashboard.kpis.wheels}
          hint={`${dashboard.kpis.normalRate}% normal`}
          icon={<Gauge className="size-4" />}
          tone="info"
        />
        <StatCard
          label="Roda urgent"
          value={dashboard.kpis.critical}
          hint={`${dashboard.kpis.warning} warning`}
          icon={<AlertOctagon className="size-4" />}
          tone="bad"
        />
        <StatCard
          label="Roda invalid"
          value={dashboard.kpis.invalid}
          hint="Di luar rentang ukur"
          icon={<CircleSlash className="size-4" />}
          tone="default"
        />
        <StatCard
          label="Perlu reprofile"
          value={dashboard.kpis.reprofileDue}
          hint={`Flange ${formatDecimal(dashboard.kpis.avgFlange)} mm`}
          icon={<Wrench className="size-4" />}
          tone="warn"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Tren keausan rata-rata"
          description="Tebal flange dan diameter roda dari seluruh pengukuran per bulan."
        >
          <TrendChart data={dashboard.trend} />
        </SectionCard>

        <SectionCard
          title="Distribusi status roda"
          description="Berdasarkan pengukuran terbaru tiap roda."
        >
          <StatusDistribution counts={dashboard.statusCounts} />
        </SectionCard>
      </div>

      <SectionCard
        title="Peta status per wheelset"
        description="Klik kotak roda untuk membuka riwayat pengukuran."
      >
        <Heatmap rows={dashboard.rows} />
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Monitoring per lokomotif"
          description="Nilai MIN dari seluruh roda, action status, dan estimasi lifetime."
          action={
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
              {dashboard.tableRows.length} lokomotif
            </span>
          }
        >
          <LocomotiveTable rows={dashboard.tableRows} />
        </SectionCard>

        <SectionCard
          title="Pareto parameter"
          description="Parameter yang paling sering melewati batas."
        >
          <ParetoChart data={dashboard.pareto} />
        </SectionCard>
      </div>

      <SectionCard
        title="Ambang batas keausan"
        description="Referensi evaluasi status roda pada dashboard ini."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PARAM_KEYS.map((key) => (
            <div
              key={key}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
            >
              <p className="text-xs font-medium text-slate-200">
                {PARAM_META[key].label}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {PARAM_REQUIREMENT[key]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
          <span className="mr-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Action status
          </span>
          {Object.entries(ACTION_META).map(([code, meta]) => (
            <span
              key={code}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${meta.className}`}
              title={meta.label}
            >
              {code}
              <span className="font-normal opacity-80">{meta.label}</span>
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
          <Legend />
          <div className="flex items-center gap-2">
            <StatusBadge status="normal" />
            <StatusBadge status="warning" />
            <StatusBadge status="critical" />
            <StatusBadge status="invalid" />
          </div>
        </div>
      </SectionCard>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[10px] text-slate-600">
        <CircleCheckBig className="size-3" />
        Estimasi lifetime dihitung dari laju keausan antar pengukuran terakhir.
        Nilai negatif berarti sudah melewati batas urgent.
      </p>
    </div>
  );
}
