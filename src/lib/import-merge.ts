import type { Dataset, Lokomotif, WheelMeasurement, WheelSide } from "./domain";

export type ImportRow = {
  depoCode: string;
  depoName: string;
  depoRegion: string;
  lokomotifNomor: string;
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

function nextId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function measurementKey(
  lokomotifId: number,
  axle: number,
  side: string,
  measuredAt: string,
) {
  return `${lokomotifId}-${axle}-${side}-${measuredAt}`;
}

/**
 * Merges parsed spreadsheet rows into a dataset. Rows win over existing data
 * when they describe the same wheel on the same date.
 */
export function mergeImportRows(base: Dataset, rows: ImportRow[]): Dataset {
  if (rows.length === 0) return base;

  const depos = [...base.depos];
  const depoByCode = new Map(
    depos.map((item) => [item.code.trim().toLowerCase(), item]),
  );

  const lokomotifs = [...base.lokomotifs];
  const lokomotifByNomor = new Map(
    lokomotifs.map((item) => [item.nomor.trim().toLowerCase(), item]),
  );

  const measurements = [...base.measurements];
  const measurementByKey = new Map(
    measurements.map((item, index) => [
      measurementKey(item.lokomotifId, item.axle, item.side, item.measuredAt),
      index,
    ]),
  );

  for (const row of rows) {
    const depoCode = row.depoCode.trim().toUpperCase();
    const depoKey = depoCode.toLowerCase();
    let depo = depoByCode.get(depoKey);

    if (!depo) {
      depo = {
        id: nextId(depos),
        code: depoCode,
        name: row.depoName,
        region: row.depoRegion,
      };
      depos.push(depo);
      depoByCode.set(depoKey, depo);
    }

    const lokomotifKey = row.lokomotifNomor.trim().toLowerCase();
    let lokomotif = lokomotifByNomor.get(lokomotifKey);

    if (!lokomotif) {
      lokomotif = {
        id: nextId(lokomotifs),
        nomor: row.lokomotifNomor.trim(),
        depoId: depo.id,
        status: "aktif",
        totalKm: row.km,
      };
      lokomotifs.push(lokomotif);
      lokomotifByNomor.set(lokomotifKey, lokomotif);
    } else if (row.km > lokomotif.totalKm) {
      const index = lokomotifs.findIndex((item) => item.id === lokomotif?.id);
      if (index >= 0) {
        lokomotifs[index] = { ...lokomotifs[index], totalKm: row.km };
        lokomotif = lokomotifs[index];
      }
    }

    const key = measurementKey(
      lokomotif.id,
      row.axle,
      row.side,
      row.measuredAt,
    );
    const existingIndex = measurementByKey.get(key);

    if (existingIndex !== undefined) {
      measurements[existingIndex] = {
        ...measurements[existingIndex],
        km: row.km,
        diameterMm: row.diameterMm,
        flangeThicknessMm: row.flangeThicknessMm,
        flangeHeightMm: row.flangeHeightMm,
        treadWearMm: row.treadWearMm,
        gaugeMm: row.gaugeMm,
        note: row.note,
      };
    } else {
      const measurement: WheelMeasurement = {
        id: nextId(measurements),
        lokomotifId: lokomotif.id,
        axle: row.axle,
        side: row.side,
        measuredAt: row.measuredAt,
        km: row.km,
        diameterMm: row.diameterMm,
        flangeThicknessMm: row.flangeThicknessMm,
        flangeHeightMm: row.flangeHeightMm,
        treadWearMm: row.treadWearMm,
        gaugeMm: row.gaugeMm,
        note: row.note,
      };
      measurements.push(measurement);
      measurementByKey.set(key, measurements.length - 1);
    }
  }

  return { depos, lokomotifs, measurements };
}

export function totalKmFor(lokomotifs: Lokomotif[]): number {
  return lokomotifs.reduce((sum, item) => sum + item.totalKm, 0);
}
