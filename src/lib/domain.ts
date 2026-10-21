export type Status = "normal" | "warning" | "critical" | "invalid";
export type WheelSide = "L" | "R";
export type LokomotifStatus = "aktif" | "perawatan" | "rusak";

export type ParamKey =
  | "diameter"
  | "flangeThickness"
  | "flangeHeight"
  | "treadWear"
  | "gauge";

export type Depo = {
  id: number;
  code: string;
  name: string;
  region: string;
};

export type Lokomotif = {
  id: number;
  nomor: string;
  depoId: number;
  status: LokomotifStatus;
  totalKm: number;
};

export type WheelMeasurement = {
  id: number;
  lokomotifId: number;
  axle: number;
  side: WheelSide;
  measuredAt: string;
  km: number;
  diameterMm: number;
  flangeThicknessMm: number;
  flangeHeightMm: number;
  treadWearMm: number;
  gaugeMm: number;
  note: string | null;
};

export type Issue = {
  param: ParamKey;
  status: Exclude<Status, "normal">;
  value: number;
};

export type Dataset = {
  depos: Depo[];
  lokomotifs: Lokomotif[];
  measurements: WheelMeasurement[];
};

export type LifetimeEstimate = {
  days: number | null;
  param: ParamKey | null;
};

export type ActionCode = "GR" | "BGR" | "B" | "W" | "OK" | "CEK";

export const AXLES = [1, 2, 3, 4, 5, 6] as const;
export const SIDES: WheelSide[] = ["L", "R"];

export const PARAM_KEYS: ParamKey[] = [
  "diameter",
  "flangeThickness",
  "flangeHeight",
  "treadWear",
  "gauge",
];

export const STATUS_ORDER: Status[] = [
  "critical",
  "warning",
  "normal",
  "invalid",
];

export const STATUS_RANK: Record<Status, number> = {
  normal: 0,
  warning: 1,
  critical: 2,
  invalid: 3,
};

export const PARAM_META: Record<
  ParamKey,
  { label: string; short: string; unit: string; field: keyof WheelMeasurement }
> = {
  diameter: {
    label: "Diameter roda",
    short: "Diameter",
    unit: "mm",
    field: "diameterMm",
  },
  flangeThickness: {
    label: "Tebal flange",
    short: "Tebal flange",
    unit: "mm",
    field: "flangeThicknessMm",
  },
  flangeHeight: {
    label: "Tinggi flange",
    short: "Tinggi flange",
    unit: "mm",
    field: "flangeHeightMm",
  },
  treadWear: {
    label: "Keausan tread",
    short: "Tread wear",
    unit: "mm",
    field: "treadWearMm",
  },
  gauge: {
    label: "Wheel gauge",
    short: "Gauge",
    unit: "mm",
    field: "gaugeMm",
  },
};

export const PARAM_REQUIREMENT: Record<ParamKey, string> = {
  diameter:
    "Urgent < 999 mm · Warning 999-1015 mm · Normal 1016-1067 mm · Invalid < 900 / > 1067 mm",
  flangeThickness:
    "Urgent < 24 mm · Warning 24-26 mm · Normal > 26 mm · Invalid < 15 / > 40 mm",
  flangeHeight:
    "Normal ≤ 30 mm · Warning 30-33 mm · Urgent ≥ 33 mm · Invalid < 20 / > 40 mm",
  treadWear:
    "Normal ≤ 7 mm · Warning 7-9 mm · Urgent > 9 mm · Invalid < 0 / > 30 mm",
  gauge:
    "Normal 996-1004 mm · Warning 993-996 / 1004-1007 mm · Urgent < 993 / > 1007 mm",
};

export const ACTION_META: Record<
  ActionCode,
  { label: string; className: string }
> = {
  GR: {
    label: "Ganti roda",
    className: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  },
  BGR: {
    label: "Bubut + ganti roda",
    className: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
  },
  B: {
    label: "Bubut / reprofile",
    className: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
  },
  W: {
    label: "Pantau",
    className: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  },
  OK: {
    label: "Aman",
    className: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  },
  CEK: {
    label: "Cek data",
    className: "bg-slate-500/15 text-slate-300 ring-slate-400/30",
  },
};

export const URGENT_LIMIT: Partial<
  Record<ParamKey, { direction: "below" | "above"; value: number }>
> = {
  diameter: { direction: "below", value: 999 },
  flangeThickness: { direction: "below", value: 24 },
  flangeHeight: { direction: "above", value: 33 },
  treadWear: { direction: "above", value: 9 },
};

export function wheelKey(axle: number, side: WheelSide): string {
  return `${axle}${side}`;
}

export function paramStatus(key: ParamKey, value: number): Status {
  switch (key) {
    case "diameter":
      if (value < 900 || value > 1067) return "invalid";
      if (value < 999) return "critical";
      if (value < 1016) return "warning";
      return "normal";
    case "flangeThickness":
      if (value < 15 || value > 40) return "invalid";
      if (value < 24) return "critical";
      if (value < 26) return "warning";
      return "normal";
    case "flangeHeight":
      if (value < 20 || value > 40) return "invalid";
      if (value >= 33) return "critical";
      if (value > 30) return "warning";
      return "normal";
    case "treadWear":
      if (value < 0 || value > 30) return "invalid";
      if (value > 9) return "critical";
      if (value > 7) return "warning";
      return "normal";
    case "gauge":
      if (value < 900 || value > 1100) return "invalid";
      if (value < 993 || value > 1007) return "critical";
      if (value < 996 || value > 1004) return "warning";
      return "normal";
  }
}

export function wheelIssues(m: WheelMeasurement): Issue[] {
  return PARAM_KEYS.flatMap((key) => {
    const value = m[PARAM_META[key].field] as number;
    const status = paramStatus(key, value);
    return status === "normal" ? [] : [{ param: key, status, value }];
  });
}

export function wheelStatus(m: WheelMeasurement): Status {
  return PARAM_KEYS.reduce<Status>((worst, key) => {
    const value = m[PARAM_META[key].field] as number;
    return worstStatus(worst, paramStatus(key, value));
  }, "normal");
}

export function worstStatus(a: Status, b: Status): Status {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b;
}

export function statusLabel(status: Status): string {
  return status === "normal"
    ? "Normal"
    : status === "warning"
      ? "Warning"
      : status === "critical"
        ? "Urgent"
        : "Invalid";
}

export function isStatus(value: string | undefined): value is Status {
  return (
    value === "normal" ||
    value === "warning" ||
    value === "critical" ||
    value === "invalid"
  );
}
