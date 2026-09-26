import "./load-env";
import { migrate } from "drizzle-orm/libsql/migrator";
import { mkdirSync } from "node:fs";

async function main() {
  const url = process.env.DATABASE_URL ?? "file:./data/nos.db";
  if (url.startsWith("file:")) mkdirSync("./data", { recursive: true });
  const { db } = await import("../src/lib/db");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ banco atualizado");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
