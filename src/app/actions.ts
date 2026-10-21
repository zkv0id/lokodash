"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, hasDatabase } from "@/lib/db";
import { pengukuran } from "@/lib/schema";

export type MeasurementFormState = {
  ok: boolean;
  message: string;
};

const measurementSchema = z.object({
  lokomotifId: z.coerce
    .number()
    .int()
    .positive("Pilih lokomotif terlebih dahulu"),
  axle: z.coerce.number().int().min(1).max(6),
  side: z.enum(["L", "R"]),
  measuredAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal pengukuran tidak valid"),
  km: z.coerce.number().int().nonnegative("KM tidak boleh negatif"),
  diameterMm: z.coerce
    .number()
    .min(700, "Diameter minimal 700 mm")
    .max(1100, "Diameter maksimal 1100 mm"),
  flangeThicknessMm: z.coerce
    .number()
    .min(10, "Tebal flange minimal 10 mm")
    .max(45, "Tebal flange maksimal 45 mm"),
  flangeHeightMm: z.coerce
    .number()
    .min(15, "Tinggi flange minimal 15 mm")
    .max(45, "Tinggi flange maksimal 45 mm"),
  treadWearMm: z.coerce
    .number()
    .min(0, "Keausan tread tidak boleh negatif")
    .max(30, "Keausan tread maksimal 30 mm"),
  gaugeMm: z.coerce
    .number()
    .min(900, "Gauge minimal 900 mm")
    .max(1100, "Gauge maksimal 1100 mm"),
  note: z.string().max(500).optional(),
});

export async function saveMeasurement(
  _previous: MeasurementFormState,
  formData: FormData,
): Promise<MeasurementFormState> {
  if (!hasDatabase || !db) {
    return {
      ok: false,
      message:
        "DATABASE_URL belum diatur. Jalankan dalam mode demo atau hubungkan database terlebih dahulu.",
    };
  }

  const parsed = measurementSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Data pengukuran tidak valid.",
    };
  }

  const data = parsed.data;

  try {
    await db.insert(pengukuran).values({
      lokomotifId: data.lokomotifId,
      axle: data.axle,
      side: data.side,
      measuredAt: data.measuredAt,
      km: data.km,
      diameterMm: data.diameterMm,
      flangeThicknessMm: data.flangeThicknessMm,
      flangeHeightMm: data.flangeHeightMm,
      treadWearMm: data.treadWearMm,
      gaugeMm: data.gaugeMm,
      note: data.note?.trim() ? data.note.trim() : null,
    });
  } catch (error) {
    console.error("Gagal menyimpan pengukuran:", error);
    return {
      ok: false,
      message:
        "Gagal menyimpan. Periksa apakah pengukuran roda yang sama sudah ada pada tanggal tersebut.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/lokomotif/${data.lokomotifId}`);

  return { ok: true, message: "Pengukuran berhasil disimpan." };
}
