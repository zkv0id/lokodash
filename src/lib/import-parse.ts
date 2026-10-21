import * as XLSX from "xlsx";
import type { WheelSide } from "./domain";
import type { ImportRow } from "./import-merge";

export type ImportParseResult = {
  rows: ImportRow[];
  errors: string[];
  totalRows: number;
};

type CanonicalKey =
  | "lokomotif"
  | "depo"
  | "depoCode"
  | "depoName"
  | "depoRegion"
  | "axle"
  | "side"
  | "date"
  | "km"
  | "diameter"
  | "flangeThickness"
  | "flangeHeight"
  | "treadWear"
  | "gauge"
  | "note";

const ALIASES: Record<CanonicalKey, string[]> = {
  lokomotif: ["lokomotif", "nomorlokomotif", "nomorloko", "loko", "loco", "unit"],
  depo: ["depo", "depot", "depokode", "kodedepo"],
  depoCode: ["kodedepo", "depocode"],
  depoName: ["namadepo", "deponama", "deponame"],
  depoRegion: ["wilayah", "region", "daerah"],
  axle: ["axle", "poros", "as", "posisiaxle", "axis", "nomoraxle"],
  side: ["side", "sisi", "sisiroda", "posisi", "arah"],
  date: ["tanggal", "tanggaluukur", "measuredat", "date", "tanggalpengukuran"],
  km: ["km", "kmtempuh", "kilometer", "kilometertempuh"],
  diameter: ["diameter", "diametermm", "diameterroda", "diameterwheel"],
  flangeThickness: [
    "tebalflange",
    "tebalfange",
    "flangethickness",
    "flangethicknessmm",
    "flangetebal",
  ],
  flangeHeight: [
    "tinggiflange",
    "tinggifange",
    "flangeheight",
    "flangeheightmm",
    "flangetinggi",
  ],
  treadWear: [
    "keausantread",
    "treadwear",
    "treadwearmm",
    "weartread",
    "keausanroda",
  ],
  gauge: ["wheelgauge", "gauge", "gauche", "lebartrek", "gaugeMm".toLowerCase()],
  note: ["catatan", "note", "keterangan", "remark", "remarks"],
};

const REQUIRED: CanonicalKey[] = [
  "lokomotif",
  "axle",
  "side",
  "date",
  "km",
  "diameter",
  "flangeThickness",
  "flangeHeight",
  "treadWear",
  "gauge",
];

const REQUIRED_LABEL: Record<string, string> = {
  lokomotif: "lokomotif",
  axle: "axle",
  side: "side",
  date: "tanggal",
  km: "km",
  diameter: "diameter_mm",
  flangeThickness: "flange_thickness_mm",
  flangeHeight: "flange_height_mm",
  treadWear: "tread_wear_mm",
  gauge: "gauge_mm",
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function buildHeaderMap(headerRow: unknown[]): Map<CanonicalKey, number> {
  const map = new Map<CanonicalKey, number>();
  headerRow.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    if (!normalized) return;
    for (const [key, aliases] of Object.entries(ALIASES) as [
      CanonicalKey,
      string[],
    ][]) {
      if (map.has(key)) continue;
      if (aliases.includes(normalized)) {
        map.set(key, index);
        break;
      }
    }
  });
  return map;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  let text = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/mm$/i, "");
  if (!text) return Number.NaN;

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else {
      text = text.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    text = text.replace(",", ".");
  }

  return Number(text);
}

function parseDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 20000) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const month = String(parsed.m).padStart(2, "0");
    const day = String(parsed.d).padStart(2, "0");
    return `${parsed.y}-${month}-${day}`;
  }

  const text = String(value ?? "").trim();
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const dmy = text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
  if (dmy) {
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function parseSide(value: unknown): WheelSide | null {
  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["l", "k", "kiri", "left", "1"].includes(text)) return "L";
  if (["r", "ka", "kanan", "right", "2"].includes(text)) return "R";
  return null;
}

function pick(row: unknown[], index: number | undefined): unknown {
  if (index === undefined) return "";
  return row[index] ?? "";
}

function sanitizeCode(value: string): string {
  const code = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 16);
  return code || "IMPORT";
}

export function parseMatrix(matrix: unknown[][]): ImportParseResult {
  const errors: string[] = [];
  if (matrix.length === 0) {
    return { rows: [], errors: ["File kosong atau tidak memiliki header."], totalRows: 0 };
  }

  const headerMap = buildHeaderMap(matrix[0] ?? []);
  const missing = REQUIRED.filter((key) => !headerMap.has(key));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        `Kolom wajib tidak ditemukan: ${missing
          .map((key) => REQUIRED_LABEL[key])
          .join(", ")}. Gunakan template yang disediakan.`,
      ],
      totalRows: Math.max(0, matrix.length - 1),
    };
  }

  const rows: ImportRow[] = [];
  const dataRows = matrix.slice(1);
  let skipped = 0;

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (row.every((cell) => String(cell ?? "").trim() === "")) return;

    const lokomotifNomor = String(pick(row, headerMap.get("lokomotif"))).trim();
    const axleRaw = String(pick(row, headerMap.get("axle"))).trim();
    const combined = axleRaw.match(/^([1-6])\s*[-/]?\s*([LR])$/i);
    const axle = combined ? Number(combined[1]) : parseNumber(axleRaw);
    const side = combined
      ? (combined[2].toUpperCase() as WheelSide)
      : parseSide(pick(row, headerMap.get("side")));
    const measuredAt = parseDate(pick(row, headerMap.get("date")));
    const km = parseNumber(pick(row, headerMap.get("km")));
    const diameterMm = parseNumber(pick(row, headerMap.get("diameter")));
    const flangeThicknessMm = parseNumber(
      pick(row, headerMap.get("flangeThickness")),
    );
    const flangeHeightMm = parseNumber(pick(row, headerMap.get("flangeHeight")));
    const treadWearMm = parseNumber(pick(row, headerMap.get("treadWear")));
    const gaugeMm = parseNumber(pick(row, headerMap.get("gauge")));

    const problems: string[] = [];
    if (!lokomotifNomor) problems.push("lokomotif kosong");
    if (!Number.isInteger(axle) || axle < 1 || axle > 6) {
      problems.push("axle harus 1-6");
    }
    if (!side) problems.push("side harus L atau R");
    if (!measuredAt) problems.push("tanggal tidak valid");
    if (!Number.isFinite(km) || km < 0) problems.push("km tidak valid");
    if (!Number.isFinite(diameterMm) || diameterMm < 700 || diameterMm > 1100) {
      problems.push("diameter harus 700-1100 mm");
    }
    if (
      !Number.isFinite(flangeThicknessMm) ||
      flangeThicknessMm < 10 ||
      flangeThicknessMm > 45
    ) {
      problems.push("tebal flange harus 10-45 mm");
    }
    if (
      !Number.isFinite(flangeHeightMm) ||
      flangeHeightMm < 15 ||
      flangeHeightMm > 45
    ) {
      problems.push("tinggi flange harus 15-45 mm");
    }
    if (
      !Number.isFinite(treadWearMm) ||
      treadWearMm < 0 ||
      treadWearMm > 30
    ) {
      problems.push("tread wear harus 0-30 mm");
    }
    if (!Number.isFinite(gaugeMm) || gaugeMm < 900 || gaugeMm > 1100) {
      problems.push("gauge harus 900-1100 mm");
    }

    if (problems.length > 0) {
      skipped += 1;
      if (errors.length < 20) {
        errors.push(`Baris ${rowNumber}: ${problems.join("; ")}.`);
      }
      return;
    }

    const depoRaw = String(pick(row, headerMap.get("depo"))).trim();
    const depoCodeRaw =
      String(pick(row, headerMap.get("depoCode"))).trim() || depoRaw;
    const depoNameRaw =
      String(pick(row, headerMap.get("depoName"))).trim() || depoRaw;
    const depoRegionRaw =
      String(pick(row, headerMap.get("depoRegion"))).trim() || "-";
    const note = String(pick(row, headerMap.get("note"))).trim();

    if (!side || !measuredAt) return;

    rows.push({
      depoCode: depoCodeRaw ? sanitizeCode(depoCodeRaw) : "IMPORT",
      depoName: depoNameRaw || "Depo Import",
      depoRegion: depoRegionRaw,
      lokomotifNomor,
      axle,
      side,
      measuredAt,
      km: Math.round(km),
      diameterMm,
      flangeThicknessMm,
      flangeHeightMm,
      treadWearMm,
      gaugeMm,
      note: note || null,
    });
  });

  if (skipped > errors.length) {
    errors.push(`... dan ${skipped - errors.length} baris lain dilewati.`);
  }

  if (rows.length === 0 && errors.length === 0) {
    errors.push("Tidak ada baris data yang bisa diimpor.");
  }

  return { rows, errors, totalRows: dataRows.length };
}

export function parseSpreadsheetBuffer(
  buffer: ArrayBuffer,
  filename: string,
): ImportParseResult {
  try {
    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      dense: false,
    });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { rows: [], errors: ["Workbook tidak memiliki sheet."], totalRows: 0 };
    }
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
      blankrows: false,
    });
    const result = parseMatrix(matrix);
    if (result.rows.length === 0 && result.errors.length === 0) {
      result.errors.push(
        `Sheet "${sheetName}" pada ${filename} tidak berisi data.`,
      );
    }
    return result;
  } catch (error) {
    console.error("Gagal membaca spreadsheet:", error);
    return {
      rows: [],
      errors: [
        "File tidak bisa dibaca. Pastikan format .xlsx, .xls, atau .csv yang valid.",
      ],
      totalRows: 0,
    };
  }
}

function parseCsvText(text: string): ImportParseResult {
  return parseSpreadsheetBuffer(new TextEncoder().encode(text).buffer, "data.csv");
}

export function normalizeGoogleSheetUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.hostname !== "docs.google.com") return null;

  const gid =
    url.searchParams.get("gid") ??
    url.hash.match(/gid=(\d+)/)?.[1] ??
    undefined;

  const published = url.pathname.match(
    /\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/,
  );
  if (published) {
    if (url.pathname.endsWith("/pub") && url.searchParams.get("output") === "csv") {
      return url.toString();
    }
    const pubUrl = new URL(
      `https://docs.google.com/spreadsheets/d/e/${published[1]}/pub`,
    );
    pubUrl.searchParams.set("output", "csv");
    if (gid) pubUrl.searchParams.set("gid", gid);
    return pubUrl.toString();
  }

  const match = url.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return null;

  const exportUrl = new URL(
    `https://docs.google.com/spreadsheets/d/${match[1]}/export`,
  );
  exportUrl.searchParams.set("format", "csv");
  if (gid) exportUrl.searchParams.set("gid", gid);
  return exportUrl.toString();
}

export async function fetchGoogleSheet(input: string): Promise<ImportParseResult> {
  const exportUrl =
    input.includes("format=csv") && input.startsWith("https://docs.google.com")
      ? input.trim()
      : normalizeGoogleSheetUrl(input);

  if (!exportUrl) {
    return {
      rows: [],
      errors: [
        "URL Google Sheets tidak valid. Salin link spreadsheet (docs.google.com/spreadsheets/...).",
      ],
      totalRows: 0,
    };
  }

  try {
    const response = await fetch(exportUrl, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return {
        rows: [],
        errors: [
          "Gagal mengambil Google Sheets. Pastikan akses link 'Anyone with the link' atau publikasikan sheet.",
        ],
        totalRows: 0,
      };
    }

    const text = await response.text();
    if (text.trim().startsWith("<")) {
      return {
        rows: [],
        errors: [
          "Google Sheets mengembalikan halaman login. Ubah akses sheet menjadi 'Anyone with the link can view'.",
        ],
        totalRows: 0,
      };
    }

    return parseCsvText(text);
  } catch (error) {
    console.error("Gagal fetch Google Sheets:", error);
    return {
      rows: [],
      errors: [
        "Tidak bisa menghubungi Google Sheets. Periksa koneksi internet atau URL.",
      ],
      totalRows: 0,
    };
  }
}
