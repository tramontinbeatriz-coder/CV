/**
 * Cria (ou atualiza a senha de) uma pessoa com acesso ao painel.
 *   npm run admin:create -- email@exemplo.com "senha-forte" "Nome"
 */
import "./load-env";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  const [email, password, name] = process.argv.slice(2);
  if (!email || !password || password.length < 8) {
    console.error('uso: npm run admin:create -- email@exemplo.com "senha com 8+ caracteres" "Nome"');
    process.exit(1);
  }
  const { db } = await import("../src/lib/db");
  const { adminUsers } = await import("../src/lib/db/schema");
  const passwordHash = await bcrypt.hash(password, 12);
  const normalized = email.trim().toLowerCase();
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, normalized));
  if (existing) {
    await db.update(adminUsers).set({ passwordHash, name: name ?? existing.name }).where(eq(adminUsers.id, existing.id));
    console.log(`✓ senha atualizada para ${normalized}`);
  } else {
    await db.insert(adminUsers).values({ email: normalized, passwordHash, name: name ?? null });
    console.log(`✓ acesso criado para ${normalized}`);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
