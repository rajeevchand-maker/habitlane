import { buildDemoWorkspace } from "@/lib/demo/workspace";
import { shiftDate } from "@/lib/habitlane/date";
import { buildTimeline } from "@/lib/habitlane/engine";
import { buildWorkspaceInsights } from "@/lib/habitlane/insights";

export function buildHabitlaneSnapshot() {
  const workspace = buildDemoWorkspace();
  const timeline = buildTimeline(workspace, workspace.referenceDate, 6, 1);
  const insights = buildWorkspaceInsights(workspace, workspace.referenceDate);
  const todayPlan = timeline.find((day) => day.date === workspace.referenceDate) ?? timeline[timeline.length - 1];
  const tomorrowPlan =
    timeline.find((day) => day.date === shiftDate(workspace.referenceDate, 1)) ?? timeline[timeline.length - 1];
  const upcomingExceptions = workspace.members.flatMap((member) =>
    member.exceptions
      .filter((exception) => exception.date >= workspace.referenceDate)
      .map((exception) => ({
        memberName: member.name,
        memberAccent: member.accent,
        ...exception,
      })),
  );

  return {
    workspace,
    timeline,
    insights,
    todayPlan,
    tomorrowPlan,
    upcomingExceptions,
  };
}
