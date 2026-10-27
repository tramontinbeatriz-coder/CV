import "./load-env";
import { migrate } from "drizzle-orm/libsql/migrator";
import { mkdirSync } from "node:fs";

async function main() {
  const { db, databaseUrl } = await import("../src/lib/db");
  if (databaseUrl().startsWith("file:")) mkdirSync("./data", { recursive: true });
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ banco atualizado");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
