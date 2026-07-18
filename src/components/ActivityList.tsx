import type { StravaActivity } from "@/lib/strava";
import { sportLabel, formatDistance, formatDuration, formatDate } from "@/lib/format";

export default function ActivityList({
  activities,
}: {
  activities: StravaActivity[];
}) {
  return (
    <>
      <h2 className="section-title">Letzte Trainings</h2>
      <div className="card">
        {activities.map((activity) => {
          const sport = sportLabel(activity);
          return (
            <div className="activity" key={activity.id}>
              <div className="activity-icon" aria-hidden>
                {sport.icon}
              </div>
              <div className="activity-main">
                <div className="activity-name">{activity.name}</div>
                <div className="activity-meta">
                  {sport.label} · {formatDate(activity.start_date_local)}
                </div>
              </div>
              <div className="activity-stats">
                <div>
                  <strong>{formatDistance(activity.distance)}</strong>
                </div>
                <div className="activity-meta">
                  {formatDuration(activity.moving_time)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
