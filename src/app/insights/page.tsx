import { AppChrome } from "@/components/app-chrome";
import { DayStrip } from "@/components/day-strip";
import { buildHabitlaneSnapshot } from "@/lib/habitlane/demo";

export const revalidate = 3600;

export default function InsightsPage() {
  const { workspace, insights } = buildHabitlaneSnapshot();

  return (
    <AppChrome activePath="/insights">
      <section className="page-hero app-rise">
        <div>
          <p className="eyebrow">Completion insight</p>
          <h1>Consistency, pressure, and recovery</h1>
          <p className="lede">
            The demo score favors recent days, skips blocked work, and keeps carryovers visible so the operating
            picture stays honest.
          </p>
        </div>
        <div className="insight-summary-card">
          <div>
            <p className="metric-label">Workspace score</p>
            <p className="metric-value">{insights.summary.score}</p>
          </div>
          <div>
            <p className="metric-label">Reliability</p>
            <p className="metric-value">{insights.summary.reliability}</p>
          </div>
          <div>
            <p className="metric-label">Carryovers</p>
            <p className="metric-value">{insights.summary.carryovers}</p>
          </div>
        </div>
      </section>

      <section className="section-head app-rise">
        <div>
          <p className="eyebrow">Recent days</p>
          <h2>Operating tempo</h2>
        </div>
        <p className="section-copy">
          Current target: {workspace.healthTarget.completionFloor}% completion, {workspace.healthTarget.streakFloor}d
          streak, and no more than {workspace.healthTarget.maxCarryovers} carryovers.
        </p>
      </section>
      <DayStrip days={insights.recentDays} />

      <section className="member-insights">
        {insights.memberInsights.map((member) => (
          <article key={member.memberId} className="member-insight-card app-rise">
            <header>
              <p className="eyebrow">{member.memberName}</p>
              <h3>{member.completionRate}% completion</h3>
            </header>
            <div className="member-insight-grid">
              <div>
                <span>Scheduled days</span>
                <strong>{member.scheduledDays}</strong>
              </div>
              <div>
                <span>Streak</span>
                <strong>{member.streak}d</strong>
              </div>
              <div>
                <span>Carryovers</span>
                <strong>{member.carryovers}</strong>
              </div>
              <div>
                <span>Blocked</span>
                <strong>{member.blocked}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppChrome>
  );
}
