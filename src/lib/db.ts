import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

export const hasDatabase = Boolean(url);

export const db = url
  ? drizzle(postgres(url, { max: 1, prepare: false }), { schema })
  : null;
