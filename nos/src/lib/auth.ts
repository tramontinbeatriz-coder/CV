import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { adminUsers } from "./db/schema";
import { SESSION_COOKIE, signSession, verifySession, type Session } from "./session";

/**
 * Login do painel: e-mail + senha (hash bcrypt no banco) e sessão em cookie
 * httpOnly assinado (JWT, AUTH_SECRET). O proxy.ts barra /admin sem sessão e
 * cada ação do painel chama requireAdmin() de novo — nunca confiamos só no proxy.
 */

const DUMMY_HASH = bcrypt.hashSync("nao-existe", 10);

// Limite simples contra tentativa e erro (por instância do servidor).
const attempts = new Map<string, { count: number; until: number }>();

export async function login(email: string, password: string, ip = "local") {
  const key = `${ip}:${email.toLowerCase()}`;
  const a = attempts.get(key);
  if (a && a.count >= 5 && a.until > Date.now()) {
    return { ok: false as const, error: "muitas tentativas. espere alguns minutos." };
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.trim().toLowerCase()))
    .limit(1);
  // compara mesmo sem usuário, para não revelar pelo tempo de resposta quais e-mails existem
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    const next = { count: (a?.count ?? 0) + 1, until: Date.now() + 10 * 60_000 };
    attempts.set(key, next);
    return { ok: false as const, error: "e-mail ou senha incorretos." };
  }
  attempts.delete(key);

  const token = await signSession({ sub: user.id, email: user.email, name: user.name ?? "" });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true as const };
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** Use no início de toda página/ação do painel. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function changePassword(userId: string, current: string, next: string) {
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, userId)).limit(1);
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return { ok: false as const, error: "senha atual incorreta." };
  }
  await db.update(adminUsers).set({ passwordHash: await hashPassword(next) }).where(eq(adminUsers.id, userId));
  return { ok: true as const };
}
