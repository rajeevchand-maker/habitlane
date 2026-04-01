export const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const ROUTINE_LANES = ["reset", "prep", "care", "support"] as const;

export type RoutineLane = (typeof ROUTINE_LANES)[number];

export const ROUTINE_PRIORITIES = ["anchor", "standard", "flex"] as const;

export type RoutinePriority = (typeof ROUTINE_PRIORITIES)[number];

export const ROUTINE_WINDOWS = ["early", "midday", "evening"] as const;

export type RoutineWindow = (typeof ROUTINE_WINDOWS)[number];

export const ROUTINE_FREQUENCIES = ["daily", "specific_days", "interval"] as const;

export type RoutineFrequency = (typeof ROUTINE_FREQUENCIES)[number];

export const TASK_STATUSES = ["todo", "done", "blocked"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type MemberRole = "lead" | "member" | "support";
export type ExceptionStatus = "on" | "off";
export type TaskSource = "routine" | "carryover";

export interface ScheduleException {
  date: string;
  status: ExceptionStatus;
  reason: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  role: MemberRole;
  focus: string;
  accent: string;
  schedule: Record<Weekday, boolean>;
  exceptions: ScheduleException[];
}

export interface RoutineTemplate {
  id: string;
  title: string;
  ownerId: string;
  lane: RoutineLane;
  priority: RoutinePriority;
  frequency: RoutineFrequency;
  days?: Weekday[];
  intervalDays?: number;
  anchorDate?: string;
  estimatedMinutes: number;
  window: RoutineWindow;
  outcome: string;
}

export interface TaskEvent {
  routineId: string;
  date: string;
  status: TaskStatus;
  note?: string;
  blockedReason?: string;
}

export interface WorkspaceHealthTarget {
  completionFloor: number;
  streakFloor: number;
  maxCarryovers: number;
}

export interface DemoWorkspace {
  id: string;
  name: string;
  tagline: string;
  story: string;
  referenceDate: string;
  members: WorkspaceMember[];
  routines: RoutineTemplate[];
  events: TaskEvent[];
  healthTarget: WorkspaceHealthTarget;
}

export interface MaterializedTask {
  id: string;
  routineId: string;
  ownerId: string;
  title: string;
  lane: RoutineLane;
  priority: RoutinePriority;
  estimatedMinutes: number;
  window: RoutineWindow;
  outcome: string;
  date: string;
  originalDate: string;
  source: TaskSource;
  status: TaskStatus;
  note?: string;
  blockedReason?: string;
  carriedFromDate?: string;
}

export interface DaySummary {
  total: number;
  done: number;
  blocked: number;
  carryovers: number;
  completionRate: number;
}

export interface DayPlan {
  date: string;
  label: string;
  summary: DaySummary;
  tasks: MaterializedTask[];
}

export interface MemberInsight {
  memberId: string;
  memberName: string;
  scheduledDays: number;
  completionRate: number;
  streak: number;
  carryovers: number;
  blocked: number;
}

export interface WorkspaceInsightSummary {
  score: number;
  streak: number;
  carryovers: number;
  blocked: number;
  reliability: string;
}

export interface WorkspaceInsights {
  summary: WorkspaceInsightSummary;
  memberInsights: MemberInsight[];
  recentDays: DayPlan[];
}
