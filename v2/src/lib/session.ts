import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "aura_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "aura-dev-secret-change-in-production"
);

export type SessionPayload = { uid: string; email: string | null; exp: number };

export async function createSession(uid: string, email: string | null): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  return new SignJWT({ uid, email, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.uid || typeof payload.uid !== "string") return null;
    return {
      uid: payload.uid,
      email: typeof payload.email === "string" ? payload.email : null,
      exp: Number(payload.exp) || 0,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}

export function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}
