export const IMPORT_COLUMNS = [
  "lokomotif",
  "depo",
  "axle",
  "side",
  "tanggal",
  "km",
  "diameter_mm",
  "flange_thickness_mm",
  "flange_height_mm",
  "tread_wear_mm",
  "gauge_mm",
  "catatan",
];

export const IMPORT_TEMPLATE_ROWS = [
  [
    "CC205 01",
    "SMG",
    "1",
    "L",
    new Date().toISOString().slice(0, 10),
    "245000",
    "1045.2",
    "29.2",
    "27.4",
    "2.1",
    "1000.4",
    "Contoh baris - hapus sebelum impor",
  ],
];

export function buildTemplateCsv(): string {
  const escape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  return [IMPORT_COLUMNS, ...IMPORT_TEMPLATE_ROWS]
    .map((row) => row.map((cell) => escape(String(cell))).join(","))
    .join("\r\n");
}
