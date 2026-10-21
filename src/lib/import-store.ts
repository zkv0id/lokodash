import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImportRow } from "./import-merge";

const DATA_DIR = path.join(process.cwd(), ".data");
const IMPORT_FILE = path.join(DATA_DIR, "imports.json");

export async function readImportRows(): Promise<ImportRow[]> {
  try {
    const raw = await readFile(IMPORT_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ImportRow[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    console.error("Gagal membaca data import lokal:", error);
    return [];
  }
}

export async function saveImportRows(rows: ImportRow[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(IMPORT_FILE, JSON.stringify(rows), "utf8");
}
