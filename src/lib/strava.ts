import { setSession, type StravaSession } from "@/lib/session";

const STRAVA_OAUTH_AUTHORIZE = "https://www.strava.com/oauth/authorize";
const STRAVA_OAUTH_TOKEN = "https://www.strava.com/oauth/token";
const STRAVA_API = "https://www.strava.com/api/v3";

/** Rohe Aktivität, wie sie die Strava-API liefert (Auszug der genutzten Felder). */
export interface StravaActivity {
  id: number;
  name: string;
  type: string; // z. B. "Run", "Ride", "Swim"
  sport_type: string;
  distance: number; // Meter
  moving_time: number; // Sekunden
  elapsed_time: number; // Sekunden
  total_elevation_gain: number; // Meter
  start_date_local: string; // ISO-8601
  average_speed: number; // m/s
  average_heartrate?: number;
  max_heartrate?: number;
  kudos_count?: number;
  calories?: number;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: {
    id: number;
    firstname?: string;
    lastname?: string;
    profile?: string;
  };
}

function getClientCredentials() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET fehlen. Bitte in .env.local setzen."
    );
  }
  return { clientId, clientSecret };
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

/** Baut die Strava-Autorisierungs-URL (Schritt 1 des OAuth-Flows). */
export function buildAuthorizeUrl(state: string): string {
  const { clientId } = getClientCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${getBaseUrl()}/api/auth/strava/callback`,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
    state,
  });
  return `${STRAVA_OAUTH_AUTHORIZE}?${params.toString()}`;
}

/** Tauscht den Authorization-Code gegen Access-/Refresh-Token (Schritt 2). */
export async function exchangeCodeForToken(
  code: string
): Promise<StravaSession> {
  const { clientId, clientSecret } = getClientCredentials();
  const res = await fetch(STRAVA_OAUTH_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token-Austausch fehlgeschlagen (${res.status}): ${text}`);
  }

  const data = (await res.json()) as StravaTokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athlete: {
      id: data.athlete?.id ?? 0,
      firstname: data.athlete?.firstname,
      lastname: data.athlete?.lastname,
      profile: data.athlete?.profile,
    },
  };
}

/** Erneuert ein abgelaufenes Access-Token per Refresh-Token. */
async function refreshAccessToken(
  session: StravaSession
): Promise<StravaSession> {
  const { clientId, clientSecret } = getClientCredentials();
  const res = await fetch(STRAVA_OAUTH_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token-Refresh fehlgeschlagen (${res.status}): ${text}`);
  }

  const data = (await res.json()) as StravaTokenResponse;
  return {
    ...session,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  };
}

/**
 * Gibt ein gültiges Access-Token zurück und erneuert es bei Bedarf.
 * Aktualisiert dabei auch das Session-Cookie (nur in Route-Handlern nutzen).
 */
export async function ensureValidToken(
  session: StravaSession
): Promise<StravaSession> {
  const nowWithBuffer = Math.floor(Date.now() / 1000) + 60; // 60s Puffer
  if (session.expiresAt > nowWithBuffer) {
    return session;
  }
  const refreshed = await refreshAccessToken(session);
  await setSession(refreshed);
  return refreshed;
}

/** Lädt die letzten Aktivitäten des Athleten. */
export async function fetchActivities(
  accessToken: string,
  perPage = 30
): Promise<StravaActivity[]> {
  const res = await fetch(
    `${STRAVA_API}/athlete/activities?per_page=${perPage}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (res.status === 401) {
    throw new Error("Strava-Token ungültig oder abgelaufen (401).");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Aktivitäten-Abruf fehlgeschlagen (${res.status}): ${text}`);
  }

  return (await res.json()) as StravaActivity[];
}
