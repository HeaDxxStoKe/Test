import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <main className="landing">
      <div className="hero-icon">🏃‍♂️</div>
      <h1>Trainings App</h1>
      <p>
        Verbinde dein Strava-Konto und sieh deine Trainings, Distanzen und
        Wochen-Trends übersichtlich an einem Ort.
      </p>

      {error && (
        <div className="error-banner">
          Anmeldung fehlgeschlagen: {decodeURIComponent(error)}
        </div>
      )}

      <a className="btn btn-primary" href="/api/auth/strava">
        Mit Strava verbinden
      </a>

      <p className="muted" style={{ marginTop: 28 }}>
        Es wird nur Lesezugriff auf deine Aktivitäten angefragt. Deine Tokens
        bleiben serverseitig in einem verschlüsselt signierten Cookie.
      </p>
    </main>
  );
}
