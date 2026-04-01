import { compareDates } from "@/lib/habitlane/date";
import { buildTimeline, memberWorksOnDate } from "@/lib/habitlane/engine";
import type { DayPlan, DemoWorkspace, MemberInsight, WorkspaceInsights } from "@/lib/habitlane/types";

function computeReliability(score: number, streak: number, carryovers: number, blocked: number): string {
  if (score >= 90 && carryovers <= 1 && blocked <= 1) {
    return "Steady";
  }

  if (score >= 82 && streak >= 4 && carryovers <= 3) {
    return "Healthy";
  }

  if (blocked >= 3) {
    return "Blocked";
  }

  return "Recovering";
}

function computeStreak(days: DayPlan[], completionFloor: number): number {
  let streak = 0;

  for (const day of [...days].reverse()) {
    if (compareDates(day.date, days[days.length - 1]?.date ?? day.date) <= 0) {
      continue;
    }

    if (day.summary.total === 0) {
      continue;
    }

    if (day.summary.completionRate < completionFloor) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function computeMemberInsight(workspace: DemoWorkspace, recentDays: DayPlan[]): MemberInsight[] {
  return workspace.members.map((member) => {
    const tasks = recentDays.flatMap((day) => day.tasks.filter((task) => task.ownerId === member.id));
    const actionable = tasks.filter((task) => task.status !== "blocked");
    const done = actionable.filter((task) => task.status === "done").length;
    const blocked = tasks.filter((task) => task.status === "blocked").length;
    const carryovers = tasks.filter((task) => task.source === "carryover").length;
    const scheduledDays = recentDays.filter((day) => memberWorksOnDate(member, day.date)).length;

    let streak = 0;
    for (const day of [...recentDays].reverse()) {
      const memberTasks = day.tasks.filter((task) => task.ownerId === member.id && task.status !== "blocked");
      if (memberTasks.length === 0) {
        continue;
      }

      const allDone = memberTasks.every((task) => task.status === "done");
      if (!allDone) {
        break;
      }

      streak += 1;
    }

    return {
      memberId: member.id,
      memberName: member.name,
      scheduledDays,
      completionRate: actionable.length === 0 ? 100 : Math.round((done / actionable.length) * 100),
      streak,
      carryovers,
      blocked,
    };
  });
}

export function buildWorkspaceInsights(
  workspace: DemoWorkspace,
  referenceDate: string = workspace.referenceDate,
): WorkspaceInsights {
  const timeline = buildTimeline(workspace, referenceDate, 6, 1);
  const recentDays = timeline.filter((day) => compareDates(day.date, referenceDate) >= 0);
  const weightedDays = recentDays.slice(-5);
  const weightedScore = Math.round(
    weightedDays.reduce((sum, day, index) => sum + day.summary.completionRate * [1, 1, 1, 2, 3][index], 0) /
      weightedDays.reduce((sum, _, index) => sum + [1, 1, 1, 2, 3][index], 0),
  );
  const carryovers = recentDays.reduce((sum, day) => sum + day.summary.carryovers, 0);
  const blocked = recentDays.reduce((sum, day) => sum + day.summary.blocked, 0);
  const streak = computeStreak(recentDays, workspace.healthTarget.completionFloor);

  return {
    summary: {
      score: weightedScore,
      streak,
      carryovers,
      blocked,
      reliability: computeReliability(weightedScore, streak, carryovers, blocked),
    },
    memberInsights: computeMemberInsight(workspace, recentDays),
    recentDays,
  };
}
