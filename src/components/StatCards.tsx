import type { StravaActivity } from "@/lib/strava";
import { totals } from "@/lib/aggregate";
import { formatDuration } from "@/lib/format";

export default function StatCards({
  activities,
}: {
  activities: StravaActivity[];
}) {
  const t = totals(activities);

  const items = [
    { value: String(t.count), label: "Trainings" },
    {
      value: `${t.distanceKm.toLocaleString("de-DE", {
        maximumFractionDigits: 1,
      })} km`,
      label: "Gesamtdistanz",
    },
    { value: formatDuration(t.movingSeconds), label: "Bewegungszeit" },
    {
      value: `${Math.round(t.elevationM).toLocaleString("de-DE")} m`,
      label: "Höhenmeter",
    },
  ];

  return (
    <div className="stat-grid">
      {items.map((item) => (
        <div className="card stat" key={item.label}>
          <div className="stat-value">{item.value}</div>
          <div className="stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
