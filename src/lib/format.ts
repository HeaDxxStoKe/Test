import type { StravaActivity } from "@/lib/strava";

/** Sportart-Anzeigename (DE) und passendes Emoji. */
const SPORT_LABELS: Record<string, { label: string; icon: string }> = {
  Run: { label: "Laufen", icon: "🏃" },
  TrailRun: { label: "Trailrunning", icon: "🏃" },
  Ride: { label: "Radfahren", icon: "🚴" },
  VirtualRide: { label: "Indoor-Radfahren", icon: "🚴" },
  Swim: { label: "Schwimmen", icon: "🏊" },
  Hike: { label: "Wandern", icon: "🥾" },
  Walk: { label: "Gehen", icon: "🚶" },
  WeightTraining: { label: "Krafttraining", icon: "🏋️" },
  Workout: { label: "Training", icon: "💪" },
  Yoga: { label: "Yoga", icon: "🧘" },
  Rowing: { label: "Rudern", icon: "🚣" },
};

export function sportLabel(activity: Pick<StravaActivity, "type" | "sport_type">): {
  label: string;
  icon: string;
} {
  return (
    SPORT_LABELS[activity.sport_type] ??
    SPORT_LABELS[activity.type] ?? { label: activity.type, icon: "🏅" }
  );
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toLocaleString("de-DE", {
      maximumFractionDigits: 2,
    })} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

/** Durchschnittstempo (min/km) aus Distanz und Zeit. */
export function formatPace(meters: number, seconds: number): string | null {
  if (meters <= 0) return null;
  const secPerKm = seconds / (meters / 1000);
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")} /km`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
