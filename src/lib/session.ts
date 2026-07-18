import { cookies } from "next/headers";
import crypto from "node:crypto";

export const SESSION_COOKIE = "strava_session";

export interface StravaAthlete {
  id: number;
  firstname?: string;
  lastname?: string;
  profile?: string;
}

export interface StravaSession {
  accessToken: string;
  refreshToken: string;
  /** Ablaufzeitpunkt des Access-Tokens als Unix-Sekunden. */
  expiresAt: number;
  athlete: StravaAthlete;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET fehlt oder ist zu kurz. Bitte in .env.local setzen (min. 32 Zeichen)."
    );
  }
  return secret;
}

/** Signiert ein JSON-Payload als `base64url(payload).hmac`. */
function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${hmac}`;
}

/** Verifiziert einen signierten Cookie-Wert; gibt null bei Manipulation zurück. */
function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [data, hmac] = token.split(".");
  if (!data || !hmac) return null;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  // Zeitkonstanter Vergleich gegen Timing-Angriffe.
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(data, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

/** Liest die aktuelle Session (nur lesend, ohne Token-Refresh). */
export async function getSession(): Promise<StravaSession | null> {
  const store = await cookies();
  return verify<StravaSession>(store.get(SESSION_COOKIE)?.value);
}

/** Setzt/aktualisiert das Session-Cookie. Nur in Route-Handlern/Server-Actions erlaubt. */
export async function setSession(session: StravaSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, sign(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
  });
}

/** Löscht das Session-Cookie (Logout). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
