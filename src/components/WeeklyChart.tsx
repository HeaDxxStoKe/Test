import type { StravaActivity } from "@/lib/strava";
import { weeklyBuckets } from "@/lib/aggregate";

/**
 * Einfaches, abhängigkeitsfreies SVG-Balkendiagramm:
 * gefahrene/gelaufene Distanz je Woche (letzte 8 Wochen).
 */
export default function WeeklyChart({
  activities,
}: {
  activities: StravaActivity[];
}) {
  const buckets = weeklyBuckets(activities, 8);
  const maxKm = Math.max(...buckets.map((b) => b.distanceKm), 1);

  // SVG-Geometrie
  const slot = 60;
  const barWidth = 34;
  const chartHeight = 150;
  const topPad = 22;
  const bottomPad = 28;
  const width = buckets.length * slot;
  const height = chartHeight + topPad + bottomPad;

  return (
    <div className="card chart-wrap">
      <p className="chart-title">Wochen-Distanz</p>
      <p className="chart-sub">Summe je Kalenderwoche · letzte 8 Wochen</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Balkendiagramm der wöchentlichen Distanz"
        style={{ minWidth: width }}
      >
        {/* Grundlinie */}
        <line
          x1={0}
          y1={topPad + chartHeight}
          x2={width}
          y2={topPad + chartHeight}
          stroke="var(--border)"
          strokeWidth={1}
        />
        {buckets.map((b, i) => {
          const barHeight = (b.distanceKm / maxKm) * chartHeight;
          const x = i * slot + (slot - barWidth) / 2;
          const y = topPad + chartHeight - barHeight;
          const km = b.distanceKm;
          return (
            <g key={b.weekStart.getTime()}>
              {km > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--text)"
                >
                  {km.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
                </text>
              )}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, km > 0 ? 2 : 0)}
                rx={5}
                fill="var(--accent)"
              />
              <text
                x={x + barWidth / 2}
                y={topPad + chartHeight + 18}
                textAnchor="middle"
                fontSize={11}
                fill="var(--text-muted)"
              >
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
