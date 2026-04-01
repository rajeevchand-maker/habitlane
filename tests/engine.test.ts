import { describe, expect, it } from "vitest";
import { buildDemoWorkspace } from "@/lib/demo/workspace";
import { buildTimeline, memberWorksOnDate, routineOccursOnDate } from "@/lib/habitlane/engine";
import type { DemoWorkspace, RoutineTemplate, TaskEvent, WorkspaceMember } from "@/lib/habitlane/types";

function buildMember(overrides: Partial<WorkspaceMember> = {}): WorkspaceMember {
  return {
    id: overrides.id ?? "alex",
    name: overrides.name ?? "Alex",
    role: overrides.role ?? "lead",
    focus: overrides.focus ?? "Keep the workspace stable",
    accent: overrides.accent ?? "Slate",
    schedule:
      overrides.schedule ?? {
        MON: true,
        TUE: true,
        WED: true,
        THU: true,
        FRI: true,
        SAT: false,
        SUN: false,
      },
    exceptions: overrides.exceptions ?? [],
  };
}

function buildRoutine(overrides: Partial<RoutineTemplate> = {}): RoutineTemplate {
  return {
    id: overrides.id ?? "reset-surface",
    title: overrides.title ?? "Reset surface",
    ownerId: overrides.ownerId ?? "alex",
    lane: overrides.lane ?? "reset",
    priority: overrides.priority ?? "standard",
    frequency: overrides.frequency ?? "specific_days",
    days: overrides.days ?? ["MON"],
    intervalDays: overrides.intervalDays,
    anchorDate: overrides.anchorDate,
    estimatedMinutes: overrides.estimatedMinutes ?? 15,
    window: overrides.window ?? "early",
    outcome: overrides.outcome ?? "The next handoff starts clean.",
  };
}

function buildWorkspace({
  referenceDate = "2026-03-10",
  members = [buildMember()],
  routines = [buildRoutine()],
  events = [],
}: {
  referenceDate?: string;
  members?: WorkspaceMember[];
  routines?: RoutineTemplate[];
  events?: TaskEvent[];
} = {}): DemoWorkspace {
  return {
    id: "demo-house",
    name: "Demo House",
    tagline: "Keep recurring work visible.",
    story: "A small workspace that needs predictable recurring work.",
    referenceDate,
    members,
    routines,
    events,
    healthTarget: {
      completionFloor: 82,
      streakFloor: 4,
      maxCarryovers: 2,
    },
  };
}

describe("memberWorksOnDate", () => {
  it("honors explicit schedule exceptions over the default member calendar", () => {
    const member = buildMember({
      exceptions: [
        {
          date: "2026-03-10",
          status: "off",
          reason: "Travel day",
        },
        {
          date: "2026-03-14",
          status: "on",
          reason: "Weekend swap",
        },
      ],
    });

    expect(memberWorksOnDate(member, "2026-03-10")).toBe(false);
    expect(memberWorksOnDate(member, "2026-03-14")).toBe(true);
  });
});

describe("routineOccursOnDate", () => {
  it("snaps interval routines to the nearest working day for the owner", () => {
    const workspace = buildWorkspace({
      members: [
        buildMember({
          schedule: {
            MON: false,
            TUE: false,
            WED: false,
            THU: false,
            FRI: true,
            SAT: false,
            SUN: false,
          },
        }),
      ],
      routines: [
        buildRoutine({
          id: "inventory-sweep",
          frequency: "interval",
          intervalDays: 2,
          anchorDate: "2026-03-10",
          days: undefined,
        }),
      ],
    });

    const routine = workspace.routines[0]!;

    expect(routineOccursOnDate(workspace, routine, "2026-03-12")).toBe(false);
    expect(routineOccursOnDate(workspace, routine, "2026-03-13")).toBe(true);
  });
});

describe("buildTimeline", () => {
  it("queues unfinished work onto the next working day when no base task already exists", () => {
    const workspace = buildWorkspace({
      members: [
        buildMember({
          schedule: {
            MON: true,
            TUE: true,
            WED: false,
            THU: false,
            FRI: false,
            SAT: false,
            SUN: false,
          },
        }),
      ],
      events: [
        {
          routineId: "reset-surface",
          date: "2026-03-09",
          status: "todo",
          note: "Left for the next morning handoff.",
        },
      ],
    });

    const timeline = buildTimeline(workspace, workspace.referenceDate, 1, 0);
    const today = timeline[timeline.length - 1]!;
    const carryover = today.tasks.find((task) => task.source === "carryover");

    expect(carryover).toMatchObject({
      routineId: "reset-surface",
      date: "2026-03-10",
      carriedFromDate: "2026-03-09",
      source: "carryover",
      status: "todo",
    });
    expect(today.summary.carryovers).toBe(1);
  });

  it("does not duplicate a carryover when the same routine already recurs on the target day", () => {
    const workspace = buildWorkspace({
      members: [
        buildMember({
          schedule: {
            MON: true,
            TUE: true,
            WED: false,
            THU: false,
            FRI: false,
            SAT: false,
            SUN: false,
          },
        }),
      ],
      routines: [
        buildRoutine({
          frequency: "daily",
          days: undefined,
        }),
      ],
    });

    const timeline = buildTimeline(workspace, workspace.referenceDate, 1, 0);
    const today = timeline[timeline.length - 1]!;

    expect(today.tasks).toHaveLength(1);
    expect(today.tasks[0]?.source).toBe("routine");
    expect(today.summary.carryovers).toBe(0);
  });

  it("excludes blocked tasks from completion-rate math", () => {
    const workspace = buildWorkspace({
      routines: [
        buildRoutine({
          id: "done-task",
          title: "Done task",
          days: ["TUE"],
        }),
        buildRoutine({
          id: "blocked-task",
          title: "Blocked task",
          days: ["TUE"],
          window: "midday",
        }),
      ],
      events: [
        {
          routineId: "done-task",
          date: "2026-03-10",
          status: "done",
        },
        {
          routineId: "blocked-task",
          date: "2026-03-10",
          status: "blocked",
          blockedReason: "Waiting on supplies.",
        },
      ],
    });

    const [today] = buildTimeline(workspace, workspace.referenceDate, 0, 0);

    expect(today?.summary).toMatchObject({
      total: 2,
      done: 1,
      blocked: 1,
      completionRate: 100,
    });
  });

  it("matches the demo workspace carryover behavior on a fixed reference date", () => {
    const workspace = buildDemoWorkspace("2026-03-18");
    const timeline = buildTimeline(workspace, workspace.referenceDate, 2, 1);
    const tomorrow = timeline.find((day) => day.date === "2026-03-19");

    expect(tomorrow?.summary.carryovers).toBe(2);
    expect(tomorrow?.tasks.filter((task) => task.source === "carryover").map((task) => task.title)).toEqual([
      "Laundry loop",
      "Bath refresh",
    ]);
  });
});
