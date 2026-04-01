import { describe, expect, it } from "vitest";
import { buildDemoWorkspace } from "@/lib/demo/workspace";
import { buildWorkspaceInsights } from "@/lib/habitlane/insights";

describe("buildWorkspaceInsights", () => {
  it("produces stable workspace scoring and member insight snapshots for the seeded demo workspace", () => {
    const workspace = buildDemoWorkspace("2026-03-18");
    const insights = buildWorkspaceInsights(workspace, workspace.referenceDate);

    expect(insights.summary).toEqual({
      score: 68,
      streak: 1,
      carryovers: 1,
      blocked: 2,
      reliability: "Recovering",
    });

    expect(insights.memberInsights).toEqual([
      {
        memberId: "jules",
        memberName: "Jules",
        scheduledDays: 6,
        completionRate: 83,
        streak: 0,
        carryovers: 1,
        blocked: 0,
      },
      {
        memberId: "mina",
        memberName: "Mina",
        scheduledDays: 5,
        completionRate: 100,
        streak: 5,
        carryovers: 0,
        blocked: 0,
      },
      {
        memberId: "niko",
        memberName: "Niko",
        scheduledDays: 5,
        completionRate: 71,
        streak: 0,
        carryovers: 0,
        blocked: 2,
      },
    ]);
  });
});
