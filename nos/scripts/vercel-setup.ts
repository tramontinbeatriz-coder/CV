/**
 * Roda antes do build NA VERCEL (fora dela não faz nada):
 * cria/atualiza as tabelas no Turso e, se ainda não houver ninguém com acesso ao painel,
 * cria o primeiro acesso com ADMIN_EMAIL + ADMIN_PASSWORD.
 * Assim dá para publicar sem rodar nada no computador.
 */
import bcrypt from "bcryptjs";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main() {
  if (!process.env.VERCEL) return;
  const { db, databaseUrl } = await import("../src/lib/db");
  if (databaseUrl().startsWith("file:")) {
    throw new Error(
      "Falta o banco: conecte um banco Turso em Storage (ou defina DATABASE_URL e DATABASE_AUTH_TOKEN). Veja docs/DEPLOY.md.",
    );
  }
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ banco atualizado");

  const { adminUsers } = await import("../src/lib/db/schema");
  const admins = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (admins.length) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    console.warn("! defina ADMIN_EMAIL e ADMIN_PASSWORD (8+ caracteres) para criar o acesso ao painel");
    return;
  }
  await db.insert(adminUsers).values({ email, name: "admin", passwordHash: await bcrypt.hash(password, 12) });
  console.log(`✓ acesso ao painel criado para ${email}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
