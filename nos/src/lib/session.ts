import { SignJWT, jwtVerify } from "jose";

/** Funções de sessão sem dependências de Node — usadas também no proxy.ts. */
export const SESSION_COOKIE = "nos_admin";

export type Session = { sub: string; email: string; name: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET precisa ter pelo menos 32 caracteres (veja .env.example)");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(session: Session) {
  return new SignJWT({ email: session.email, name: session.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token?: string | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}
