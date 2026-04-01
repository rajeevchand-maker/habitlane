import { AppChrome } from "@/components/app-chrome";
import { DayStrip } from "@/components/day-strip";
import { MemberLane } from "@/components/member-lane";
import { formatLongDate } from "@/lib/habitlane/date";
import { buildHabitlaneSnapshot } from "@/lib/habitlane/demo";

export const revalidate = 3600;

export default function HomePage() {
  const { workspace, timeline, insights, todayPlan, tomorrowPlan, upcomingExceptions } = buildHabitlaneSnapshot();
  const lanes = workspace.members.map((member) => ({
    member,
    tasks: todayPlan.tasks.filter((task) => task.ownerId === member.id),
  }));
  const carryovers = todayPlan.tasks.filter((task) => task.source === "carryover");
  const blocked = todayPlan.tasks.filter((task) => task.status === "blocked");

  return (
    <AppChrome activePath="/">
      <section className="hero-grid">
        <div className="hero-copy app-rise">
          <p className="eyebrow">Shared operations</p>
          <h1>Recurring work that lands on the right day, for the right person.</h1>
          <p className="lede">{workspace.story}</p>
          <div className="hero-ribbon">
            <span>{workspace.name}</span>
            <span>{formatLongDate(workspace.referenceDate)}</span>
            <span>{insights.summary.reliability} pace</span>
          </div>
        </div>

        <div className="hero-plane app-rise">
          <div className="metric-stack metric-grid">
            <div className="metric-tile">
              <p className="metric-label">Workspace score</p>
              <p className="metric-value">{insights.summary.score}</p>
            </div>
            <div className="metric-tile">
              <p className="metric-label">Current streak</p>
              <p className="metric-value">{insights.summary.streak}d</p>
            </div>
            <div className="metric-tile">
              <p className="metric-label">Carryovers today</p>
              <p className="metric-value">{carryovers.length}</p>
            </div>
            <div className="metric-tile">
              <p className="metric-label">Blocked today</p>
              <p className="metric-value">{blocked.length}</p>
            </div>
          </div>
          <div className="hero-tracks">
            <div className="track">
              <span>Today’s agenda</span>
              <strong>{todayPlan.summary.total} tasks</strong>
            </div>
            <div className="track">
              <span>Completion pace</span>
              <strong>{todayPlan.summary.completionRate}%</strong>
            </div>
            <div className="track">
              <span>Tomorrow preview</span>
              <strong>{tomorrowPlan.summary.total} tasks queued</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section-head app-rise">
        <div>
          <p className="eyebrow">Operating rhythm</p>
          <h2>Seven-day pace</h2>
        </div>
        <p className="section-copy">
          Blocked work stays visible, but it does not drag down completion the same way a true miss does.
        </p>
      </section>
      <DayStrip days={timeline.filter((day) => day.date <= workspace.referenceDate)} />

      <section className="section-head app-rise">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Owner lanes</h2>
        </div>
        <p className="section-copy">{workspace.tagline}</p>
      </section>
      <section className="lane-grid">
        {lanes.map(({ member, tasks }) => (
          <MemberLane key={member.id} member={member} tasks={tasks} />
        ))}
      </section>

      <section className="support-grid">
        <article className="support-panel app-rise">
          <p className="eyebrow">Carryover queue</p>
          <h3>What rolled forward</h3>
          <div className="support-list">
            {carryovers.length > 0 ? (
              carryovers.map((task) => (
                <div key={task.id} className="support-item">
                  <strong>{task.title}</strong>
                  <span>
                    From {task.carriedFromDate} · {task.outcome}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-copy">No carryovers landed today.</p>
            )}
          </div>
        </article>

        <article className="support-panel app-rise">
          <p className="eyebrow">Tomorrow</p>
          <h3>Next day preview</h3>
          <div className="support-list">
            {tomorrowPlan.tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="support-item">
                <strong>{task.title}</strong>
                <span>
                  {task.window} window · {task.priority}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="support-panel app-rise">
          <p className="eyebrow">Schedule exceptions</p>
          <h3>Upcoming shifts</h3>
          <div className="support-list">
            {upcomingExceptions.length > 0 ? (
              upcomingExceptions.map((exception) => (
                <div key={`${exception.memberName}:${exception.date}`} className="support-item">
                  <strong>
                    {exception.memberName} · {exception.status}
                  </strong>
                  <span>
                    {exception.date} · {exception.reason}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-copy">No upcoming schedule overrides.</p>
            )}
          </div>
        </article>
      </section>
    </AppChrome>
  );
}
