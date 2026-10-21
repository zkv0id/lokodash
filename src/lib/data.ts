import "server-only";

import type {
  Dataset,
  LokomotifStatus,
  WheelSide,
} from "./domain";
import { db, hasDatabase } from "./db";
import { demoDataset } from "./demo-data";
import { mergeImportRows } from "./import-merge";
import { readImportRows } from "./import-store";
import {
  depo as depoTable,
  lokomotif as lokomotifTable,
  pengukuran as pengukuranTable,
} from "./schema";

export type DataSource = "database" | "demo";

async function loadDemoData(): Promise<Dataset> {
  const imported = await readImportRows();
  return mergeImportRows(demoDataset, imported);
}

export async function loadDataset(): Promise<{
  data: Dataset;
  source: DataSource;
}> {
  if (!hasDatabase || !db) {
    return { data: await loadDemoData(), source: "demo" };
  }

  try {
    const [depos, lokomotifs, measurements] = await Promise.all([
      db.select().from(depoTable).orderBy(depoTable.name),
      db.select().from(lokomotifTable).orderBy(lokomotifTable.nomor),
      db.select().from(pengukuranTable).orderBy(pengukuranTable.measuredAt),
    ]);

    if (lokomotifs.length === 0) {
      return { data: await loadDemoData(), source: "demo" };
    }

    return {
      data: {
        depos,
        lokomotifs: lokomotifs.map((item) => ({
          ...item,
          status: item.status as LokomotifStatus,
        })),
        measurements: measurements.map((item) => ({
          ...item,
          side: item.side as WheelSide,
        })),
      },
      source: "database",
    };
  } catch (error) {
    console.error("Gagal memuat data dari database:", error);
    return { data: await loadDemoData(), source: "demo" };
  }
}
