import type { DayPlan } from "@/lib/habitlane/types";

export function DayStrip({ days }: Readonly<{ days: DayPlan[] }>) {
  return (
    <section className="day-strip" aria-label="Recent operating rhythm">
      {days.map((day) => (
        <article key={day.date} className="day-card">
          <div className="day-card-head">
            <p>{day.label}</p>
            <strong>{day.summary.completionRate}%</strong>
          </div>
          <div className="day-meter" aria-hidden="true">
            <span style={{ width: `${day.summary.completionRate}%` }} />
          </div>
          <div className="day-card-meta">
            <span>{day.summary.done} done</span>
            <span>{day.summary.carryovers} carryovers</span>
            <span>{day.summary.blocked} blocked</span>
          </div>
        </article>
      ))}
    </section>
  );
}
