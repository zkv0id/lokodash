"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import {
  fetchGoogleSheet,
  parseSpreadsheetBuffer,
  type ImportParseResult,
} from "@/lib/import-parse";
import type { ImportRow } from "@/lib/import-merge";
import { readImportRows, saveImportRows } from "@/lib/import-store";
import {
  depo as depoTable,
  lokomotif as lokomotifTable,
  pengukuran as pengukuranTable,
} from "@/lib/schema";

export type ImportState = {
  ok: boolean;
  message: string;
  errors: string[];
  summary?: {
    totalRows: number;
    imported: number;
    mode: "database" | "demo";
  };
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function rowKey(row: ImportRow): string {
  return [
    row.depoCode.toLowerCase(),
    row.lokomotifNomor.toLowerCase(),
    row.axle,
    row.side,
    row.measuredAt,
  ].join("|");
}

async function persistToDatabase(rows: ImportRow[]): Promise<void> {
  if (!db) throw new Error("Database tidak tersedia.");

  const depoCache = new Map<string, number>();
  const lokomotifCache = new Map<string, number>();

  for (const row of rows) {
    const depoKey = row.depoCode.toLowerCase();
    let depoId = depoCache.get(depoKey);

    if (!depoId) {
      const [depoRow] = await db
        .insert(depoTable)
        .values({
          code: row.depoCode,
          name: row.depoName,
          region: row.depoRegion,
        })
        .onConflictDoUpdate({
          target: depoTable.code,
          set: { name: row.depoName, region: row.depoRegion },
        })
        .returning({ id: depoTable.id });
      depoId = depoRow.id;
      depoCache.set(depoKey, depoId);
    }

    const lokomotifKey = row.lokomotifNomor.toLowerCase();
    let lokomotifId = lokomotifCache.get(lokomotifKey);

    if (!lokomotifId) {
      const [lokomotifRow] = await db
        .insert(lokomotifTable)
        .values({
          nomor: row.lokomotifNomor,
          depoId,
          status: "aktif",
          totalKm: row.km,
        })
        .onConflictDoUpdate({
          target: lokomotifTable.nomor,
          set: {
            depoId,
            totalKm: sql`GREATEST(${lokomotifTable.totalKm}, ${row.km})`,
          },
        })
        .returning({ id: lokomotifTable.id });
      lokomotifId = lokomotifRow.id;
      lokomotifCache.set(lokomotifKey, lokomotifId);
    }

    await db
      .insert(pengukuranTable)
      .values({
        lokomotifId,
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
      })
      .onConflictDoUpdate({
        target: [
          pengukuranTable.lokomotifId,
          pengukuranTable.axle,
          pengukuranTable.side,
          pengukuranTable.measuredAt,
        ],
        set: {
          km: row.km,
          diameterMm: row.diameterMm,
          flangeThicknessMm: row.flangeThicknessMm,
          flangeHeightMm: row.flangeHeightMm,
          treadWearMm: row.treadWearMm,
          gaugeMm: row.gaugeMm,
          note: row.note,
        },
      });
  }
}

async function persistToLocalStore(rows: ImportRow[]): Promise<void> {
  const existing = await readImportRows();
  const merged = new Map<string, ImportRow>();
  for (const row of existing) merged.set(rowKey(row), row);
  for (const row of rows) merged.set(rowKey(row), row);
  await saveImportRows([...merged.values()]);
}

export async function importData(
  _previous: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const file = formData.get("file");
  const sheetUrl = String(formData.get("sheetUrl") ?? "").trim();

  if ((!file || !(file instanceof File) || file.size === 0) && !sheetUrl) {
    return {
      ok: false,
      message: "Pilih file Excel/CSV atau tempel URL Google Sheets.",
      errors: [],
    };
  }

  let parsed: ImportParseResult;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return {
        ok: false,
        message: "Ukuran file maksimal 10 MB.",
        errors: [],
      };
    }

    const buffer = await file.arrayBuffer();
    parsed = parseSpreadsheetBuffer(buffer, file.name);
  } else {
    parsed = await fetchGoogleSheet(sheetUrl);
  }

  if (parsed.rows.length === 0) {
    return {
      ok: false,
      message: "Tidak ada data valid yang bisa diimpor.",
      errors: parsed.errors,
    };
  }

  const mode = hasDatabase && db ? "database" : "demo";

  try {
    if (mode === "database") {
      await persistToDatabase(parsed.rows);
    } else {
      await persistToLocalStore(parsed.rows);
    }
  } catch (error) {
    console.error("Gagal menyimpan hasil import:", error);
    return {
      ok: false,
      message:
        "Data terbaca, tetapi gagal disimpan. Periksa koneksi database lalu coba lagi.",
      errors: parsed.errors,
    };
  }

  revalidatePath("/", "layout");

  return {
    ok: true,
    message:
      mode === "database"
        ? `${parsed.rows.length} baris berhasil diimpor ke database. Dashboard otomatis diperbarui.`
        : `${parsed.rows.length} baris berhasil diimpor. Dashboard otomatis diperbarui.`,
    errors: parsed.errors,
    summary: {
      totalRows: parsed.totalRows,
      imported: parsed.rows.length,
      mode,
    },
  };
}
