import { getPacificDateString, shiftDate } from "@/lib/habitlane/date";
import type { DemoWorkspace, RoutineTemplate, TaskEvent, WorkspaceMember } from "@/lib/habitlane/types";

function buildMembers(referenceDate: string): WorkspaceMember[] {
  return [
    {
      id: "jules",
      name: "Jules",
      role: "lead",
      focus: "Morning resets and handoff planning",
      accent: "Coral",
      schedule: {
        MON: true,
        TUE: true,
        WED: true,
        THU: true,
        FRI: true,
        SAT: false,
        SUN: true,
      },
      exceptions: [
        {
          date: shiftDate(referenceDate, 1),
          status: "off",
          reason: "Travel buffer day",
        },
      ],
    },
    {
      id: "mina",
      name: "Mina",
      role: "member",
      focus: "Prep cadence and meal surfaces",
      accent: "Seafoam",
      schedule: {
        MON: true,
        TUE: true,
        WED: false,
        THU: true,
        FRI: true,
        SAT: true,
        SUN: false,
      },
      exceptions: [
        {
          date: shiftDate(referenceDate, -2),
          status: "on",
          reason: "Swap-in support shift",
        },
      ],
    },
    {
      id: "niko",
      name: "Niko",
      role: "support",
      focus: "Floors, restocks, and closing passes",
      accent: "Sun",
      schedule: {
        MON: false,
        TUE: true,
        WED: true,
        THU: true,
        FRI: true,
        SAT: true,
        SUN: true,
      },
      exceptions: [
        {
          date: shiftDate(referenceDate, -1),
          status: "off",
          reason: "Exam day",
        },
      ],
    },
  ];
}

function buildRoutines(referenceDate: string): RoutineTemplate[] {
  return [
    {
      id: "launch-pad-reset",
      title: "Launch pad reset",
      ownerId: "jules",
      lane: "reset",
      priority: "anchor",
      frequency: "daily",
      estimatedMinutes: 12,
      window: "early",
      outcome: "Bags, chargers, and keys are staged before anyone heads out.",
    },
    {
      id: "meal-board",
      title: "Meal board refresh",
      ownerId: "mina",
      lane: "prep",
      priority: "anchor",
      frequency: "specific_days",
      days: ["MON", "TUE", "THU", "FRI", "SAT"],
      estimatedMinutes: 18,
      window: "early",
      outcome: "The next two meals are visible and ingredients are accounted for.",
    },
    {
      id: "closing-sweep",
      title: "Closing sweep",
      ownerId: "niko",
      lane: "reset",
      priority: "standard",
      frequency: "specific_days",
      days: ["TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      estimatedMinutes: 16,
      window: "evening",
      outcome: "Shared surfaces are reset and tomorrow starts clean.",
    },
    {
      id: "fridge-audit",
      title: "Fridge audit",
      ownerId: "mina",
      lane: "prep",
      priority: "standard",
      frequency: "specific_days",
      days: ["THU", "SAT"],
      estimatedMinutes: 20,
      window: "midday",
      outcome: "Open ingredients are rotated, labeled, and either planned or tossed.",
    },
    {
      id: "entry-reset",
      title: "Entry reset",
      ownerId: "jules",
      lane: "care",
      priority: "standard",
      frequency: "specific_days",
      days: ["MON", "WED", "FRI", "SUN"],
      estimatedMinutes: 10,
      window: "evening",
      outcome: "Shoes, coats, and papers stop collecting at the front door.",
    },
    {
      id: "laundry-loop",
      title: "Laundry loop",
      ownerId: "niko",
      lane: "support",
      priority: "standard",
      frequency: "interval",
      intervalDays: 3,
      anchorDate: shiftDate(referenceDate, -4),
      estimatedMinutes: 35,
      window: "midday",
      outcome: "A single load keeps uniforms and towels in rotation.",
    },
    {
      id: "week-plan",
      title: "Week plan review",
      ownerId: "jules",
      lane: "prep",
      priority: "anchor",
      frequency: "specific_days",
      days: ["SUN"],
      estimatedMinutes: 25,
      window: "evening",
      outcome: "The next week has owners, friction points, and supply gaps called out.",
    },
    {
      id: "bath-refresh",
      title: "Bath refresh",
      ownerId: "niko",
      lane: "care",
      priority: "flex",
      frequency: "specific_days",
      days: ["WED", "SAT"],
      estimatedMinutes: 14,
      window: "midday",
      outcome: "Towels, mirror, and sink are reset before the next rush.",
    },
    {
      id: "restock-corners",
      title: "Restock corners",
      ownerId: "mina",
      lane: "support",
      priority: "flex",
      frequency: "interval",
      intervalDays: 4,
      anchorDate: shiftDate(referenceDate, -5),
      estimatedMinutes: 22,
      window: "midday",
      outcome: "Snacks, paper goods, and grab-and-go supplies stay visible and easy to refill.",
    },
  ];
}

function buildEvents(referenceDate: string): TaskEvent[] {
  return [
    {
      routineId: "closing-sweep",
      date: shiftDate(referenceDate, -3),
      status: "blocked",
      blockedReason: "Waiting on a late pickup before surfaces can be cleared.",
    },
    {
      routineId: "entry-reset",
      date: shiftDate(referenceDate, -2),
      status: "todo",
      note: "Skipped after a long travel day.",
    },
    {
      routineId: "laundry-loop",
      date: shiftDate(referenceDate, -1),
      status: "todo",
      note: "Saved for the next available work window.",
    },
    {
      routineId: "fridge-audit",
      date: shiftDate(referenceDate, -1),
      status: "blocked",
      blockedReason: "Pickup bins were still in use, so the audit moved forward.",
    },
    {
      routineId: "launch-pad-reset",
      date: referenceDate,
      status: "done",
      note: "Morning handoff cleared early.",
    },
    {
      routineId: "meal-board",
      date: referenceDate,
      status: "done",
      note: "Weekend prep already mapped.",
    },
    {
      routineId: "bath-refresh",
      date: referenceDate,
      status: "blocked",
      blockedReason: "Waiting on a restock delivery before the reset makes sense.",
    },
  ];
}

export function buildDemoWorkspace(referenceDate: string = getPacificDateString()): DemoWorkspace {
  return {
    id: "harbor-house",
    name: "Harbor House",
    tagline: "Recurring work that stays visible before it turns into friction.",
    story:
      "Habitlane models a small multi-person workspace where schedules change, routines stack, and the team needs a lightweight operating system instead of another checklist.",
    referenceDate,
    members: buildMembers(referenceDate),
    routines: buildRoutines(referenceDate),
    events: buildEvents(referenceDate),
    healthTarget: {
      completionFloor: 82,
      streakFloor: 6,
      maxCarryovers: 2,
    },
  };
}
