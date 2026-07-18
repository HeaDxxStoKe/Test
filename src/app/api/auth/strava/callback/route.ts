import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken } from "@/lib/strava";
import { setSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Schritt 2 des OAuth-Flows: Strava ruft diese URL mit `code` & `state` auf.
 * Wir prüfen den State, tauschen den Code gegen Tokens und setzen die Session.
 */
export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const store = await cookies();
  const expectedState = store.get("strava_oauth_state")?.value;
  store.delete("strava_oauth_state");

  if (error) {
    return NextResponse.redirect(`${base}/?error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${base}/?error=missing_code`);
  }
  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${base}/?error=invalid_state`);
  }

  try {
    const session = await exchangeCodeForToken(code);
    await setSession(session);
    return NextResponse.redirect(`${base}/dashboard`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.redirect(`${base}/?error=${encodeURIComponent(message)}`);
  }
}
