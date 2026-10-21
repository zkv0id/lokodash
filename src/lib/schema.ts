import {
  date,
  index,
  integer,
  pgTable,
  real,
  serial,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const depo = pgTable("depo", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 16 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  region: varchar("region", { length: 80 }).notNull(),
});

export const lokomotif = pgTable(
  "lokomotif",
  {
    id: serial("id").primaryKey(),
    nomor: varchar("nomor", { length: 32 }).notNull().unique(),
    depoId: integer("depo_id")
      .notNull()
      .references(() => depo.id),
    status: varchar("status", { length: 16 }).notNull().default("aktif"),
    totalKm: integer("total_km").notNull().default(0),
  },
  (table) => [index("lokomotif_depo_idx").on(table.depoId)],
);

export const pengukuran = pgTable(
  "pengukuran",
  {
    id: serial("id").primaryKey(),
    lokomotifId: integer("lokomotif_id")
      .notNull()
      .references(() => lokomotif.id, { onDelete: "cascade" }),
    axle: integer("axle").notNull(),
    side: varchar("side", { length: 1 }).notNull(),
    measuredAt: date("measured_at", { mode: "string" }).notNull(),
    km: integer("km").notNull(),
    diameterMm: real("diameter_mm").notNull(),
    flangeThicknessMm: real("flange_thickness_mm").notNull(),
    flangeHeightMm: real("flange_height_mm").notNull(),
    treadWearMm: real("tread_wear_mm").notNull(),
    gaugeMm: real("gauge_mm").notNull(),
    note: text("note"),
  },
  (table) => [
    uniqueIndex("pengukuran_wheel_date_idx").on(
      table.lokomotifId,
      table.axle,
      table.side,
      table.measuredAt,
    ),
    index("pengukuran_lokomotif_idx").on(table.lokomotifId),
  ],
);
