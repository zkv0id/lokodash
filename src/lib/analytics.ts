import type {
  ActionCode,
  Dataset,
  Depo,
  Issue,
  LifetimeEstimate,
  Lokomotif,
  ParamKey,
  Status,
  WheelMeasurement,
  WheelSide,
} from "./domain";
import {
  ACTION_META,
  AXLES,
  PARAM_KEYS,
  PARAM_META,
  SIDES,
  STATUS_RANK,
  URGENT_LIMIT,
  paramStatus,
  wheelIssues,
  wheelStatus,
  worstStatus,
} from "./domain";

export type WheelView = {
  lokomotifId: number;
  axle: number;
  side: WheelSide;
  measurement: WheelMeasurement;
  status: Status;
  issues: Issue[];
  lifetime: LifetimeEstimate;
};

export type ParamValue = {
  value: number;
  status: Status;
};

export type LokomotifView = {
  lokomotif: Lokomotif;
  depo: Depo | undefined;
  wheels: WheelView[];
  worst: Status;
  critical: number;
  warning: number;
  invalid: number;
  inspectionDate: string | null;
  minima: {
    diameter: ParamValue | null;
    flangeThickness: ParamValue | null;
    flangeHeight: ParamValue | null;
  };
  action: ActionCode;
  lifetime: LifetimeEstimate;
};

export type ParamSummary = {
  param: ParamKey;
  counts: StatusCounts;
  ranges: Record<Status, { min: number; max: number } | null>;
};

export type TrendPoint = {
  month: string;
  diameter: number;
  flangeThickness: number;
  flangeHeight: number;
  treadWear: number;
  critical: number;
  warning: number;
  invalid: number;
};

export type ParetoPoint = {
  param: ParamKey;
  label: string;
  count: number;
  critical: number;
  warning: number;
  invalid: number;
};

export type StatusCounts = Record<Status, number>;

export type DashboardView = "all" | "exkka" | "rcd" | "recent";

export type DashboardFilter = {
  depoId?: number;
  status?: Status;
  from?: string;
  to?: string;
  view?: DashboardView;
};

export type DashboardPresets = {
  exKka: number;
  rcd: number;
  recent: number;
};

export type DashboardModel = {
  rows: LokomotifView[];
  tableRows: LokomotifView[];
  wheels: WheelView[];
  scopedWheels: WheelView[];
  trend: TrendPoint[];
  pareto: ParetoPoint[];
  statusCounts: StatusCounts;
  paramSummaries: ParamSummary[];
  criticalRows: WheelView[];
  depos: Depo[];
  latestDate: string;
  presets: DashboardPresets;
  kpis: {
    lokomotif: number;
    wheels: number;
    critical: number;
    warning: number;
    invalid: number;
    reprofileDue: number;
    avgDiameter: number;
    avgFlange: number;
    normalRate: number;
  };
};

export type DetailTrendPoint = {
  month: string;
  [key: `a${number}`]: number | string;
};

export type DetailModel = {
  lokomotif: Lokomotif;
  depo: Depo | undefined;
  wheels: WheelView[];
  counts: StatusCounts;
  avgDiameter: number;
  avgFlange: number;
  trend: DetailTrendPoint[];
  selected: { axle: number; side: WheelSide } | null;
  selectedWheel: WheelView | null;
  lifetime: LifetimeEstimate;
  history: WheelMeasurement[];
};

function wheelId(lokomotifId: number, axle: number, side: string): string {
  return `${lokomotifId}-${axle}-${side}`;
}

function shiftDate(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

function inRange(iso: string, from?: string, to?: string): boolean {
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function latestMeasurements(
  measurements: WheelMeasurement[],
): WheelMeasurement[] {
  const latest = new Map<string, WheelMeasurement>();
  for (const measurement of measurements) {
    const key = wheelId(
      measurement.lokomotifId,
      measurement.axle,
      measurement.side,
    );
    const current = latest.get(key);
    if (!current || measurement.measuredAt > current.measuredAt) {
      latest.set(key, measurement);
    }
  }
  return [...latest.values()];
}

function buildHistoryMap(
  measurements: WheelMeasurement[],
): Map<string, WheelMeasurement[]> {
  const history = new Map<string, WheelMeasurement[]>();
  for (const measurement of measurements) {
    const key = wheelId(
      measurement.lokomotifId,
      measurement.axle,
      measurement.side,
    );
    const bucket = history.get(key);
    if (bucket) bucket.push(measurement);
    else history.set(key, [measurement]);
  }
  for (const bucket of history.values()) {
    bucket.sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  }
  return history;
}

function daysToLimit(
  key: Exclude<ParamKey, "gauge">,
  latest: number,
  previous: number,
  elapsedDays: number,
): number | null {
  const limit = URGENT_LIMIT[key];
  if (!limit) return null;
  const rate = (latest - previous) / elapsedDays;
  if (limit.direction === "below") {
    if (rate >= 0) return null;
    return (latest - limit.value) / -rate;
  }
  if (rate <= 0) return null;
  return (limit.value - latest) / rate;
}

function gaugeDaysToLimit(
  latest: number,
  previous: number,
  elapsedDays: number,
): number | null {
  const rate = (latest - previous) / elapsedDays;
  if (rate < 0) return (latest - 993) / -rate;
  if (rate > 0) return (1007 - latest) / rate;
  return null;
}

function estimateWheelLifetime(
  history: WheelMeasurement[],
): LifetimeEstimate {
  if (history.length < 2) return { days: null, param: null };
  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const elapsed = daysBetween(previous.measuredAt, latest.measuredAt);

  let bestDays: number | null = null;
  let bestParam: ParamKey | null = null;

  for (const key of PARAM_KEYS) {
    if (paramStatus(key, latest[PARAM_META[key].field] as number) === "invalid") {
      continue;
    }
    const latestValue = latest[PARAM_META[key].field] as number;
    const previousValue = previous[PARAM_META[key].field] as number;
    const days =
      key === "gauge"
        ? gaugeDaysToLimit(latestValue, previousValue, elapsed)
        : daysToLimit(key, latestValue, previousValue, elapsed);

    if (days === null || !Number.isFinite(days)) continue;
    if (bestDays === null || days < bestDays) {
      bestDays = days;
      bestParam = key;
    }
  }

  return {
    days: bestDays === null ? null : Math.round(bestDays),
    param: bestParam,
  };
}

function estimateLocoLifetime(wheels: WheelView[]): LifetimeEstimate {
  let best: LifetimeEstimate = { days: null, param: null };
  for (const wheel of wheels) {
    const days = wheel.lifetime.days;
    if (days === null) continue;
    if (best.days === null || days < best.days) {
      best = { days, param: wheel.lifetime.param };
    }
  }
  return best;
}

function minimumFor(
  wheels: WheelView[],
  key: ParamKey,
): ParamValue | null {
  let best: ParamValue | null = null;
  for (const wheel of wheels) {
    const value = wheel.measurement[PARAM_META[key].field] as number;
    if (best === null || value < best.value) {
      best = { value, status: paramStatus(key, value) };
    }
  }
  return best;
}

function resolveAction(
  minima: LokomotifView["minima"],
  wheels: WheelView[],
): ActionCode {
  const diameter = minima.diameter?.status;
  const flange = minima.flangeThickness?.status;
  const height = minima.flangeHeight?.status;

  if (diameter === "invalid" || flange === "invalid" || height === "invalid") {
    return "CEK";
  }
  if (diameter === "critical") return "GR";
  if (diameter === "warning" && (flange === "critical" || height === "critical")) {
    return "BGR";
  }
  if (flange === "critical" || height === "critical") return "B";

  const hasOtherCritical = wheels.some((wheel) =>
    wheel.issues.some(
      (issue) =>
        issue.status === "critical" &&
        issue.param !== "diameter" &&
        issue.param !== "flangeThickness" &&
        issue.param !== "flangeHeight",
    ),
  );
  if (hasOtherCritical) return "B";

  const hasWarning = wheels.some(
    (wheel) =>
      wheel.status === "warning" ||
      wheel.issues.some((issue) => issue.status === "warning"),
  );
  return hasWarning ? "W" : "OK";
}

function emptyCounts(): StatusCounts {
  return { normal: 0, warning: 0, critical: 0, invalid: 0 };
}

export function countStatuses(wheels: WheelView[]): StatusCounts {
  const counts = emptyCounts();
  for (const wheel of wheels) counts[wheel.status] += 1;
  return counts;
}

function buildParamSummaries(wheels: WheelView[]): ParamSummary[] {
  return PARAM_KEYS.map((param) => {
    const counts = emptyCounts();
    const ranges: ParamSummary["ranges"] = {
      normal: null,
      warning: null,
      critical: null,
      invalid: null,
    };

    for (const wheel of wheels) {
      const value = wheel.measurement[PARAM_META[param].field] as number;
      const status = paramStatus(param, value);
      counts[status] += 1;
      const current = ranges[status];
      ranges[status] = current
        ? { min: Math.min(current.min, value), max: Math.max(current.max, value) }
        : { min: value, max: value };
    }

    return { param, counts, ranges };
  });
}

function actionSortValue(action: ActionCode): number {
  const order: ActionCode[] = ["CEK", "GR", "BGR", "B", "W", "OK"];
  return order.indexOf(action);
}

export function buildDashboard(
  data: Dataset,
  filter: DashboardFilter = {},
): DashboardModel {
  const depos = data.depos;
  const depoMap = new Map(depos.map((item) => [item.id, item]));
  const allLokomotifs = filter.depoId
    ? data.lokomotifs.filter((item) => item.depoId === filter.depoId)
    : data.lokomotifs;
  const allIds = new Set(allLokomotifs.map((item) => item.id));
  const baseMeasurements = data.measurements.filter((item) =>
    allIds.has(item.lokomotifId),
  );
  const baseLatest = latestMeasurements(baseMeasurements);
  const latestDate = baseMeasurements.reduce(
    (latest, item) => (item.measuredAt > latest ? item.measuredAt : latest),
    "",
  );
  const recentCutoff = latestDate ? shiftDate(latestDate, -30) : undefined;

  const presets: DashboardPresets = {
    exKka: allLokomotifs.filter((item) => item.status === "perawatan").length,
    rcd: baseLatest.filter((item) => {
      const status = paramStatus("diameter", item.diameterMm);
      return status === "critical" || status === "invalid";
    }).length,
    recent: recentCutoff
      ? new Set(
          baseMeasurements
            .filter((item) => item.measuredAt >= recentCutoff)
            .map((item) => item.lokomotifId),
        ).size
      : 0,
  };

  let lokomotifs = allLokomotifs;
  if (filter.view === "exkka") {
    lokomotifs = lokomotifs.filter((item) => item.status === "perawatan");
  }

  const lokomotifIds = new Set(lokomotifs.map((item) => item.id));
  let measurements = baseMeasurements.filter(
    (item) =>
      lokomotifIds.has(item.lokomotifId) &&
      inRange(item.measuredAt, filter.from, filter.to),
  );

  if (filter.view === "recent" && recentCutoff && !filter.from && !filter.to) {
    measurements = measurements.filter(
      (item) => item.measuredAt >= recentCutoff,
    );
  }

  const historyMap = buildHistoryMap(measurements);
  let latest = latestMeasurements(measurements);

  if (filter.view === "rcd") {
    latest = latest.filter((item) => {
      const status = paramStatus("diameter", item.diameterMm);
      return status === "critical" || status === "invalid";
    });
  }

  const latestMap = new Map(
    latest.map((item) => [
      wheelId(item.lokomotifId, item.axle, item.side),
      item,
    ]),
  );

  const rows: LokomotifView[] = lokomotifs.flatMap<LokomotifView>(
    (lokomotif) => {
      const wheels = AXLES.flatMap<WheelView>((axle) =>
        SIDES.flatMap<WheelView>((side) => {
          const measurement = latestMap.get(
            wheelId(lokomotif.id, axle, side),
          );
          if (!measurement) return [];
          const history =
            historyMap.get(wheelId(lokomotif.id, axle, side)) ?? [measurement];
          return [
            {
              lokomotifId: lokomotif.id,
              axle,
              side,
              measurement,
              status: wheelStatus(measurement),
              issues: wheelIssues(measurement),
              lifetime: estimateWheelLifetime(history),
            },
          ];
        }),
      );

      if (wheels.length === 0) return [];

      const worst = wheels.reduce<Status>(
        (acc, wheel) => worstStatus(acc, wheel.status),
        "normal",
      );
      const minima = {
        diameter: minimumFor(wheels, "diameter"),
        flangeThickness: minimumFor(wheels, "flangeThickness"),
        flangeHeight: minimumFor(wheels, "flangeHeight"),
      };
      const inspectionDate = wheels.reduce(
        (latestDate, wheel) =>
          wheel.measurement.measuredAt > latestDate
            ? wheel.measurement.measuredAt
            : latestDate,
        "",
      );

      return [
        {
          lokomotif,
          depo: depoMap.get(lokomotif.depoId),
          wheels,
          worst,
          critical: wheels.filter((wheel) => wheel.status === "critical").length,
          warning: wheels.filter((wheel) => wheel.status === "warning").length,
          invalid: wheels.filter((wheel) => wheel.status === "invalid").length,
          inspectionDate: inspectionDate || null,
          minima,
          action: resolveAction(minima, wheels),
          lifetime: estimateLocoLifetime(wheels),
        },
      ];
    },
  );

  const wheels = rows.flatMap((row) => row.wheels);
  const scopedWheels =
    filter.status === undefined
      ? wheels
      : wheels.filter((wheel) => wheel.status === filter.status);

  const statusCounts = countStatuses(wheels);
  const critical = scopedWheels.filter(
    (wheel) => wheel.status === "critical",
  ).length;
  const warning = scopedWheels.filter(
    (wheel) => wheel.status === "warning",
  ).length;
  const invalid = scopedWheels.filter(
    (wheel) => wheel.status === "invalid",
  ).length;

  const byMonth = new Map<string, WheelMeasurement[]>();
  for (const measurement of measurements) {
    const month = measurement.measuredAt.slice(0, 7);
    const bucket = byMonth.get(month);
    if (bucket) bucket.push(measurement);
    else byMonth.set(month, [measurement]);
  }

  const trend: TrendPoint[] = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, items]) => {
      const monthCounts = countStatuses(
        items.map<WheelView>((item) => ({
          lokomotifId: item.lokomotifId,
          axle: item.axle,
          side: item.side,
          measurement: item,
          status: wheelStatus(item),
          issues: wheelIssues(item),
          lifetime: { days: null, param: null },
        })),
      );
      return {
        month,
        diameter: round(mean(items.map((item) => item.diameterMm))),
        flangeThickness: round(
          mean(items.map((item) => item.flangeThicknessMm)),
        ),
        flangeHeight: round(mean(items.map((item) => item.flangeHeightMm))),
        treadWear: round(mean(items.map((item) => item.treadWearMm))),
        critical: monthCounts.critical,
        warning: monthCounts.warning,
        invalid: monthCounts.invalid,
      };
    });

  const pareto: ParetoPoint[] = PARAM_KEYS.map((param) => {
    let criticalCount = 0;
    let warningCount = 0;
    let invalidCount = 0;
    for (const wheel of scopedWheels) {
      for (const issue of wheel.issues) {
        if (issue.param !== param) continue;
        if (issue.status === "critical") criticalCount += 1;
        else if (issue.status === "invalid") invalidCount += 1;
        else warningCount += 1;
      }
    }
    return {
      param,
      label: PARAM_META[param].short,
      count: criticalCount + warningCount + invalidCount,
      critical: criticalCount,
      warning: warningCount,
      invalid: invalidCount,
    };
  })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const nomorById = new Map(lokomotifs.map((item) => [item.id, item.nomor]));
  const criticalRows = scopedWheels
    .filter((wheel) => wheel.status !== "normal")
    .sort((a, b) => {
      const rank = STATUS_RANK[b.status] - STATUS_RANK[a.status];
      if (rank !== 0) return rank;
      const issueRank = b.issues.length - a.issues.length;
      if (issueRank !== 0) return issueRank;
      return (nomorById.get(a.lokomotifId) ?? "").localeCompare(
        nomorById.get(b.lokomotifId) ?? "",
      );
    })
    .slice(0, 15);

  const tableRows = (
    filter.status === undefined
      ? rows
      : rows.filter((row) =>
          row.wheels.some((wheel) => wheel.status === filter.status),
        )
  )
    .slice()
    .sort((a, b) => {
      if (a.lifetime.days === null && b.lifetime.days === null) {
        return actionSortValue(a.action) - actionSortValue(b.action);
      }
      if (a.lifetime.days === null) return 1;
      if (b.lifetime.days === null) return -1;
      return a.lifetime.days - b.lifetime.days;
    });

  return {
    rows,
    tableRows,
    wheels,
    scopedWheels,
    trend,
    pareto,
    statusCounts,
    paramSummaries: buildParamSummaries(wheels),
    criticalRows,
    depos,
    latestDate,
    presets,
    kpis: {
      lokomotif: rows.length,
      wheels: scopedWheels.length,
      critical,
      warning,
      invalid,
      reprofileDue: critical + warning,
      avgDiameter: round(
        mean(scopedWheels.map((wheel) => wheel.measurement.diameterMm)),
      ),
      avgFlange: round(
        mean(scopedWheels.map((wheel) => wheel.measurement.flangeThicknessMm)),
      ),
      normalRate:
        scopedWheels.length === 0
          ? 0
          : round(
              (scopedWheels.filter((wheel) => wheel.status === "normal")
                .length /
                scopedWheels.length) *
                100,
            ),
    },
  };
}

export function buildDetail(
  data: Dataset,
  lokomotifId: number,
  wheelParam?: string,
): DetailModel | null {
  const lokomotif = data.lokomotifs.find((item) => item.id === lokomotifId);
  if (!lokomotif) return null;
  const depo = data.depos.find((item) => item.id === lokomotif.depoId);
  const measurements = data.measurements.filter(
    (item) => item.lokomotifId === lokomotifId,
  );
  const historyMap = buildHistoryMap(measurements);
  const latest = latestMeasurements(measurements);
  const wheels: WheelView[] = latest
    .map<WheelView>((measurement) => ({
      lokomotifId,
      axle: measurement.axle,
      side: measurement.side,
      measurement,
      status: wheelStatus(measurement),
      issues: wheelIssues(measurement),
      lifetime: estimateWheelLifetime(
        historyMap.get(wheelId(lokomotifId, measurement.axle, measurement.side)) ??
          [measurement],
      ),
    }))
    .sort((a, b) => a.axle - b.axle || a.side.localeCompare(b.side));

  const counts = countStatuses(wheels);
  const months = [
    ...new Set(measurements.map((item) => item.measuredAt.slice(0, 7))),
  ].sort();

  const trend: DetailTrendPoint[] = months.map((month) => {
    const point: DetailTrendPoint = { month };
    for (const axle of AXLES) {
      const values = measurements
        .filter(
          (item) =>
            item.axle === axle && item.measuredAt.slice(0, 7) === month,
        )
        .map((item) => item.flangeThicknessMm);
      point[`a${axle}`] = round(mean(values));
    }
    return point;
  });

  const match = wheelParam?.match(/^([1-6])([LR])$/);
  let selected: { axle: number; side: WheelSide } | null = match
    ? { axle: Number(match[1]), side: match[2] as WheelSide }
    : null;

  if (!selected) {
    const worst = [...wheels].sort(
      (a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status],
    )[0];
    selected = worst ? { axle: worst.axle, side: worst.side } : null;
  }

  const history = selected
    ? measurements
        .filter(
          (item) => item.axle === selected?.axle && item.side === selected?.side,
        )
        .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
    : [];

  const selectedWheel =
    wheels.find(
      (item) => item.axle === selected?.axle && item.side === selected?.side,
    ) ?? null;

  return {
    lokomotif,
    depo,
    wheels,
    counts,
    avgDiameter: round(mean(wheels.map((wheel) => wheel.measurement.diameterMm))),
    avgFlange: round(
      mean(wheels.map((wheel) => wheel.measurement.flangeThicknessMm)),
    ),
    trend,
    selected,
    selectedWheel,
    lifetime: selectedWheel?.lifetime ?? { days: null, param: null },
    history,
  };
}

export function actionLabel(action: ActionCode): string {
  return ACTION_META[action].label;
}
