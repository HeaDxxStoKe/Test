import type { StravaActivity } from "@/lib/strava";

export interface WeeklyBucket {
  /** Montag der Woche (ISO-Datum, lokal). */
  weekStart: Date;
  label: string; // z. B. "14. Jul"
  distanceKm: number;
  count: number;
  movingSeconds: number;
}

/** Montag 00:00 der Woche eines Datums (Woche beginnt montags). */
function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // Mo=0 … So=6
  d.setDate(d.getDate() - day);
  return d;
}

/**
 * Gruppiert Aktivitäten in die letzten `weeks` Kalenderwochen (inkl. laufender).
 * Wochen ohne Aktivität bleiben als Null-Buckets erhalten, damit das Chart
 * eine durchgehende Zeitachse zeigt.
 */
export function weeklyBuckets(
  activities: StravaActivity[],
  weeks = 8,
  now: Date = new Date()
): WeeklyBucket[] {
  const currentWeekStart = startOfWeek(now);

  const buckets: WeeklyBucket[] = [];
  const indexByTime = new Map<number, number>();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const label = weekStart.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
    });
    indexByTime.set(weekStart.getTime(), buckets.length);
    buckets.push({
      weekStart,
      label,
      distanceKm: 0,
      count: 0,
      movingSeconds: 0,
    });
  }

  for (const activity of activities) {
    const ws = startOfWeek(new Date(activity.start_date_local)).getTime();
    const idx = indexByTime.get(ws);
    if (idx === undefined) continue; // außerhalb des Zeitfensters
    const bucket = buckets[idx];
    bucket.distanceKm += activity.distance / 1000;
    bucket.count += 1;
    bucket.movingSeconds += activity.moving_time;
  }

  return buckets;
}

export interface Totals {
  count: number;
  distanceKm: number;
  movingSeconds: number;
  elevationM: number;
}

export function totals(activities: StravaActivity[]): Totals {
  return activities.reduce<Totals>(
    (acc, a) => ({
      count: acc.count + 1,
      distanceKm: acc.distanceKm + a.distance / 1000,
      movingSeconds: acc.movingSeconds + a.moving_time,
      elevationM: acc.elevationM + (a.total_elevation_gain ?? 0),
    }),
    { count: 0, distanceKm: 0, movingSeconds: 0, elevationM: 0 }
  );
}
