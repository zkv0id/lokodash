"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  saveMeasurement,
  type MeasurementFormState,
} from "@/app/actions";
import { AXLES, SIDES } from "@/lib/domain";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500/60";

const labelClass =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500";

const initialState: MeasurementFormState = { ok: false, message: "" };

export function MeasurementForm({
  lokomotifs,
  today,
  defaultLokomotifId,
}: {
  lokomotifs: { id: number; nomor: string }[];
  today: string;
  defaultLokomotifId?: number;
}) {
  const [state, formAction, pending] = useActionState(
    saveMeasurement,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="lokomotifId" className={labelClass}>
            Lokomotif
          </label>
          <select
            id="lokomotifId"
            name="lokomotifId"
            className={inputClass}
            defaultValue={defaultLokomotifId ?? ""}
            required
          >
            <option value="" disabled>
              Pilih lokomotif
            </option>
            {lokomotifs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nomor}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="axle" className={labelClass}>
            Posisi axle
          </label>
          <select id="axle" name="axle" className={inputClass} required>
            {AXLES.map((axle) => (
              <option key={axle} value={axle}>
                Axle {axle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="side" className={labelClass}>
            Sisi roda
          </label>
          <select id="side" name="side" className={inputClass} required>
            {SIDES.map((side) => (
              <option key={side} value={side}>
                {side === "L" ? "Kiri (L)" : "Kanan (R)"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="measuredAt" className={labelClass}>
            Tanggal ukur
          </label>
          <input
            id="measuredAt"
            name="measuredAt"
            type="date"
            defaultValue={today}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="km" className={labelClass}>
            KM tempuh
          </label>
          <input
            id="km"
            name="km"
            type="number"
            min={0}
            step={1}
            placeholder="cth. 245000"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="diameterMm" className={labelClass}>
            Diameter roda (mm)
          </label>
          <input
            id="diameterMm"
            name="diameterMm"
            type="number"
            step="0.1"
            placeholder="cth. 1045.2"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="flangeThicknessMm" className={labelClass}>
            Tebal flange (mm)
          </label>
          <input
            id="flangeThicknessMm"
            name="flangeThicknessMm"
            type="number"
            step="0.1"
            placeholder="cth. 29.2"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="flangeHeightMm" className={labelClass}>
            Tinggi flange (mm)
          </label>
          <input
            id="flangeHeightMm"
            name="flangeHeightMm"
            type="number"
            step="0.1"
            placeholder="cth. 27.4"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="treadWearMm" className={labelClass}>
            Keausan tread (mm)
          </label>
          <input
            id="treadWearMm"
            name="treadWearMm"
            type="number"
            step="0.1"
            placeholder="cth. 2.1"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="gaugeMm" className={labelClass}>
            Wheel gauge (mm)
          </label>
          <input
            id="gaugeMm"
            name="gaugeMm"
            type="number"
            step="0.1"
            placeholder="cth. 1000.4"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="note" className={labelClass}>
          Catatan (opsional)
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          placeholder="Kondisi visual, tindakan, atau temuan lain"
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {pending ? "Menyimpan..." : "Simpan pengukuran"}
        </button>

        {state.message ? (
          <p
            aria-live="polite"
            className={
              state.ok
                ? "text-xs text-emerald-400"
                : "text-xs text-rose-400"
            }
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
