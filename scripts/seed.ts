import { config } from "dotenv";

async function main() {
  config({ path: ".env.local" });
  config();

  const { sql } = await import("drizzle-orm");
  const { db, hasDatabase } = await import("../src/lib/db");
  const { depo, lokomotif, pengukuran } = await import("../src/lib/schema");
  const { buildDemoDataset } = await import("../src/lib/demo-data");

  if (!hasDatabase || !db) {
    console.error(
      "DATABASE_URL belum diset. Salin .env.example ke .env.local lalu isi koneksi Postgres.",
    );
    process.exit(1);
  }

  const data = buildDemoDataset();

  console.log("Menghapus data lama...");
  await db.delete(pengukuran);
  await db.delete(lokomotif);
  await db.delete(depo);

  console.log(
    `Memasukkan ${data.depos.length} depo, ${data.lokomotifs.length} lokomotif, ${data.measurements.length} pengukuran...`,
  );

  await db.insert(depo).values(data.depos);
  await db.insert(lokomotif).values(data.lokomotifs);

  const chunkSize = 500;
  for (let index = 0; index < data.measurements.length; index += chunkSize) {
    await db
      .insert(pengukuran)
      .values(data.measurements.slice(index, index + chunkSize));
  }

  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('depo', 'id'), COALESCE((SELECT MAX(id) FROM depo), 1), true)`,
  );
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('lokomotif', 'id'), COALESCE((SELECT MAX(id) FROM lokomotif), 1), true)`,
  );
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('pengukuran', 'id'), COALESCE((SELECT MAX(id) FROM pengukuran), 1), true)`,
  );

  console.log("Seed selesai.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed gagal:", error);
  process.exit(1);
});
