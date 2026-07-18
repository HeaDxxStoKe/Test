import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${base}/`, { status: 303 });
}
