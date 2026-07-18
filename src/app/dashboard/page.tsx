import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const name = [session.athlete.firstname, session.athlete.lastname]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">Trainings App</h1>
        <div className="athlete">
          {session.athlete.profile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="avatar"
              src={session.athlete.profile}
              alt=""
              width={32}
              height={32}
            />
          )}
          <span>{name || "Athlet:in"}</span>
          <form action="/api/auth/logout" method="post">
            <button className="btn btn-ghost" type="submit" style={{ padding: "6px 14px" }}>
              Abmelden
            </button>
          </form>
        </div>
      </header>

      <DashboardClient />
    </div>
  );
}
