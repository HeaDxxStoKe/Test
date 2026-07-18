"use client";

import { useEffect, useState } from "react";
import type { StravaActivity } from "@/lib/strava";
import StatCards from "@/components/StatCards";
import WeeklyChart from "@/components/WeeklyChart";
import ActivityList from "@/components/ActivityList";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; activities: StravaActivity[] };

export default function DashboardClient() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  async function load() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/activities", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/";
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `Fehler ${res.status}`);
      }
      setState({ status: "ready", activities: data.activities ?? [] });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setState({ status: "error", message });
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (state.status === "loading") {
    return <p className="center muted">Lade deine Trainings von Strava…</p>;
  }

  if (state.status === "error") {
    return (
      <div className="center">
        <p className="error-banner">Fehler beim Laden: {state.message}</p>
        <button className="btn btn-ghost" onClick={load}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (state.activities.length === 0) {
    return (
      <p className="center muted">
        Noch keine Aktivitäten gefunden. Zeichne ein Training in Strava auf – es
        erscheint dann hier.
      </p>
    );
  }

  return (
    <>
      <StatCards activities={state.activities} />
      <WeeklyChart activities={state.activities} />
      <ActivityList activities={state.activities} />
    </>
  );
}
