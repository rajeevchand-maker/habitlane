import { AppChrome } from "@/components/app-chrome";
import { buildHabitlaneSnapshot } from "@/lib/habitlane/demo";
import type { RoutineTemplate } from "@/lib/habitlane/types";

export const revalidate = 3600;

function cadenceLabel(routine: RoutineTemplate): string {
  if (routine.frequency === "daily") {
    return "Daily";
  }

  if (routine.frequency === "specific_days") {
    return routine.days?.join(" · ") ?? "Specific days";
  }

  return `Every ${routine.intervalDays} days`;
}

export default function RoutinesPage() {
  const { workspace } = buildHabitlaneSnapshot();
  const memberMap = new Map(workspace.members.map((member) => [member.id, member]));
  const grouped = workspace.routines.reduce<Record<string, RoutineTemplate[]>>((accumulator, routine) => {
    accumulator[routine.lane] = [...(accumulator[routine.lane] ?? []), routine];
    return accumulator;
  }, {});
  const anchorCount = workspace.routines.filter((routine) => routine.priority === "anchor").length;
  const intervalCount = workspace.routines.filter((routine) => routine.frequency === "interval").length;

  return (
    <AppChrome activePath="/routines">
      <section className="page-hero app-rise">
        <div>
          <p className="eyebrow">Admin planning</p>
          <h1>Routine library</h1>
          <p className="lede">
            Every routine in Habitlane is framed as an outcome with an owner, cadence, and operating lane.
          </p>
        </div>
        <div className="metric-stack metric-grid compact-metrics">
          <div className="metric-tile">
            <p className="metric-label">Total routines</p>
            <p className="metric-value">{workspace.routines.length}</p>
          </div>
          <div className="metric-tile">
            <p className="metric-label">Anchor routines</p>
            <p className="metric-value">{anchorCount}</p>
          </div>
          <div className="metric-tile">
            <p className="metric-label">Interval routines</p>
            <p className="metric-value">{intervalCount}</p>
          </div>
        </div>
      </section>

      <section className="routine-groups">
        {Object.entries(grouped).map(([lane, routines]) => (
          <article key={lane} className="routine-group app-rise">
            <header className="routine-group-head">
              <div>
                <p className="eyebrow">{lane}</p>
                <h2>{lane} lane</h2>
              </div>
              <p className="section-copy">{routines.length} templates ready to adapt.</p>
            </header>
            <div className="routine-list">
              {routines.map((routine) => {
                const member = memberMap.get(routine.ownerId);
                return (
                  <article key={routine.id} className="routine-card">
                    <div className="routine-card-head">
                      <div>
                        <h3>{routine.title}</h3>
                        <p>{routine.outcome}</p>
                      </div>
                      <span className="routine-badge">{routine.priority}</span>
                    </div>
                    <div className="routine-meta">
                      <span>{member?.name}</span>
                      <span>{cadenceLabel(routine)}</span>
                      <span>{routine.window}</span>
                      <span>{routine.estimatedMinutes} min</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </AppChrome>
  );
}
