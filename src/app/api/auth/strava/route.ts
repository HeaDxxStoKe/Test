import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { buildAuthorizeUrl } from "@/lib/strava";

export const dynamic = "force-dynamic";

/**
 * Schritt 1 des OAuth-Flows: Nutzer:in zu Strava weiterleiten.
 * Ein zufälliger `state` wird gesetzt und im Cookie hinterlegt (CSRF-Schutz).
 */
export async function GET() {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    const store = await cookies();
    store.set("strava_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 Minuten
    });

    return NextResponse.redirect(buildAuthorizeUrl(state));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    return NextResponse.redirect(
      `${base}/?error=${encodeURIComponent(message)}`
    );
  }
}
