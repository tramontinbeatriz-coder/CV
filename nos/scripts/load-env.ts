// Carrega .env / .env.local para os scripts de terminal (o Next faz isso sozinho no site).
import { existsSync } from "node:fs";
for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) process.loadEnvFile(f);
}
