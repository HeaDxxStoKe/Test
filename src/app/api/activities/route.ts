import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { ensureValidToken, fetchActivities } from "@/lib/strava";

export const dynamic = "force-dynamic";

/**
 * Liefert die Aktivitäten der angemeldeten Nutzer:in als JSON.
 * Erneuert bei Bedarf das Access-Token (und das Session-Cookie).
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    const valid = await ensureValidToken(session);
    const activities = await fetchActivities(valid.accessToken, 50);
    return NextResponse.json({ activities });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
