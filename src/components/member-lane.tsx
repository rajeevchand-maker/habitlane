import type { MaterializedTask, WorkspaceMember } from "@/lib/habitlane/types";

const accentMap: Record<string, string> = {
  Coral: "#b65f4c",
  Seafoam: "#5d8f79",
  Sun: "#c89b3c",
};

export function MemberLane({
  member,
  tasks,
}: Readonly<{
  member: WorkspaceMember;
  tasks: MaterializedTask[];
}>) {
  const done = tasks.filter((task) => task.status === "done").length;
  const actionable = tasks.filter((task) => task.status !== "blocked").length;
  const completionRate = actionable === 0 ? 100 : Math.round((done / actionable) * 100);

  return (
    <article className="lane-card" style={{ ["--lane-accent" as string]: accentMap[member.accent] ?? "#b65f4c" }}>
      <header className="lane-head">
        <div>
          <p className="lane-name">{member.name}</p>
          <p className="lane-focus">{member.focus}</p>
        </div>
        <div className="lane-stat">
          <strong>{completionRate}%</strong>
          <span>{tasks.length} tasks</span>
        </div>
      </header>
      <div className="lane-tasks">
        {tasks.map((task) => (
          <article key={task.id} className={`task-slip task-${task.status}`}>
            <div className="task-line">
              <div>
                <p className="task-title">{task.title}</p>
                <p className="task-meta">
                  {task.window} window · {task.estimatedMinutes} min · {task.priority}
                </p>
              </div>
              <span className="task-status">{task.status}</span>
            </div>
            <p className="task-outcome">{task.outcome}</p>
            <div className="task-tags">
              <span>{task.lane}</span>
              {task.source === "carryover" ? <span>carryover</span> : null}
            </div>
            {task.blockedReason ? <p className="task-note">{task.blockedReason}</p> : null}
            {!task.blockedReason && task.note ? <p className="task-note">{task.note}</p> : null}
          </article>
        ))}
      </div>
    </article>
  );
}
