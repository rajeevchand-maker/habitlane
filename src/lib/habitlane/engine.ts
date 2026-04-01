import {
  compareDates,
  daysBetween,
  getRelativeLabel,
  getWeekday,
  shiftDate,
} from "@/lib/habitlane/date";
import type {
  DayPlan,
  DaySummary,
  DemoWorkspace,
  MaterializedTask,
  RoutineTemplate,
  TaskEvent,
  TaskStatus,
  WorkspaceMember,
} from "@/lib/habitlane/types";

function buildEventMap(events: TaskEvent[]): Map<string, TaskEvent> {
  return new Map(events.map((event) => [`${event.routineId}:${event.date}`, event]));
}

function defaultStatusForDate(date: string, referenceDate: string): TaskStatus {
  return compareDates(date, referenceDate) > 0 ? "done" : "todo";
}

export function memberWorksOnDate(member: WorkspaceMember, date: string): boolean {
  const exception = member.exceptions.find((entry) => entry.date === date);
  if (exception) {
    return exception.status === "on";
  }

  return member.schedule[getWeekday(date)];
}

function findMember(workspace: DemoWorkspace, memberId: string): WorkspaceMember {
  const member = workspace.members.find((entry) => entry.id === memberId);

  if (!member) {
    throw new Error(`Unknown Habitlane member: ${memberId}`);
  }

  return member;
}

function intervalTargetDate(routine: RoutineTemplate, member: WorkspaceMember, date: string): string | null {
  if (!routine.anchorDate || !routine.intervalDays) {
    return null;
  }

  const distance = daysBetween(routine.anchorDate, date);
  if (distance < 0) {
    return null;
  }

  const intervalsPassed = Math.round(distance / routine.intervalDays);
  const idealDate = shiftDate(routine.anchorDate, intervalsPassed * routine.intervalDays);
  const candidates = [0, 1, -1, 2, -2, 3, -3].map((offset) => shiftDate(idealDate, offset));

  for (const candidate of candidates) {
    if (memberWorksOnDate(member, candidate)) {
      return candidate;
    }
  }

  return null;
}

export function routineOccursOnDate(workspace: DemoWorkspace, routine: RoutineTemplate, date: string): boolean {
  const member = findMember(workspace, routine.ownerId);
  if (!memberWorksOnDate(member, date)) {
    return false;
  }

  if (routine.frequency === "daily") {
    return true;
  }

  if (routine.frequency === "specific_days") {
    return routine.days?.includes(getWeekday(date)) ?? false;
  }

  return intervalTargetDate(routine, member, date) === date;
}

function findNextWorkingDay(workspace: DemoWorkspace, ownerId: string, startDate: string, maxDays: number = 7): string {
  const member = findMember(workspace, ownerId);

  for (let offset = 1; offset <= maxDays; offset += 1) {
    const candidate = shiftDate(startDate, offset);
    if (memberWorksOnDate(member, candidate)) {
      return candidate;
    }
  }

  return shiftDate(startDate, 1);
}

function createTaskId(routineId: string, date: string, source: string): string {
  return `${routineId}:${date}:${source}`;
}

function createBaseTask(routine: RoutineTemplate, date: string): MaterializedTask {
  return {
    id: createTaskId(routine.id, date, "routine"),
    routineId: routine.id,
    ownerId: routine.ownerId,
    title: routine.title,
    lane: routine.lane,
    priority: routine.priority,
    estimatedMinutes: routine.estimatedMinutes,
    window: routine.window,
    outcome: routine.outcome,
    date,
    originalDate: date,
    source: "routine",
    status: "todo",
  };
}

function applyTaskStatus(
  task: MaterializedTask,
  referenceDate: string,
  eventMap: Map<string, TaskEvent>,
): MaterializedTask {
  const event = eventMap.get(`${task.routineId}:${task.date}`);
  const status = event?.status ?? defaultStatusForDate(task.date, referenceDate);

  return {
    ...task,
    status,
    note: event?.note,
    blockedReason: event?.blockedReason,
  };
}

function sortTasks(tasks: MaterializedTask[]): MaterializedTask[] {
  const priorityRank = {
    anchor: 0,
    standard: 1,
    flex: 2,
  } as const;
  const windowRank = {
    early: 0,
    midday: 1,
    evening: 2,
  } as const;
  const statusRank = {
    todo: 0,
    blocked: 1,
    done: 2,
  } as const;

  return [...tasks].sort((left, right) => {
    if (statusRank[left.status] !== statusRank[right.status]) {
      return statusRank[left.status] - statusRank[right.status];
    }

    if (windowRank[left.window] !== windowRank[right.window]) {
      return windowRank[left.window] - windowRank[right.window];
    }

    if (priorityRank[left.priority] !== priorityRank[right.priority]) {
      return priorityRank[left.priority] - priorityRank[right.priority];
    }

    return left.title.localeCompare(right.title);
  });
}

function summarizeTasks(tasks: MaterializedTask[]): DaySummary {
  const actionable = tasks.filter((task) => task.status !== "blocked");
  const done = actionable.filter((task) => task.status === "done").length;

  return {
    total: tasks.length,
    done: tasks.filter((task) => task.status === "done").length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
    carryovers: tasks.filter((task) => task.source === "carryover").length,
    completionRate: actionable.length === 0 ? 100 : Math.round((done / actionable.length) * 100),
  };
}

function queueCarryover(
  workspace: DemoWorkspace,
  task: MaterializedTask,
  queue: Map<string, MaterializedTask[]>,
  tasksForDate: MaterializedTask[],
): void {
  const targetDate = findNextWorkingDay(workspace, task.ownerId, task.date);

  if (targetDate === task.date) {
    return;
  }

  if (routineOccursOnDate(workspace, findRoutine(workspace, task.routineId), targetDate)) {
    return;
  }

  const alreadyExistsOnDate = tasksForDate.some(
    (entry) => entry.ownerId === task.ownerId && entry.routineId === task.routineId && entry.date === targetDate,
  );
  if (alreadyExistsOnDate) {
    return;
  }

  const existingQueued = queue.get(targetDate) ?? [];
  if (existingQueued.some((entry) => entry.ownerId === task.ownerId && entry.routineId === task.routineId)) {
    return;
  }

  existingQueued.push({
    ...task,
    id: createTaskId(task.routineId, targetDate, "carryover"),
    date: targetDate,
    source: "carryover",
    status: "todo",
    carriedFromDate: task.date,
  });
  queue.set(targetDate, existingQueued);
}

function findRoutine(workspace: DemoWorkspace, routineId: string): RoutineTemplate {
  const routine = workspace.routines.find((entry) => entry.id === routineId);

  if (!routine) {
    throw new Error(`Unknown Habitlane routine: ${routineId}`);
  }

  return routine;
}

export function buildTimeline(
  workspace: DemoWorkspace,
  referenceDate: string = workspace.referenceDate,
  historyDays: number = 6,
  futureDays: number = 1,
): DayPlan[] {
  const startDate = shiftDate(referenceDate, -historyDays);
  const totalDays = historyDays + futureDays + 1;
  const eventMap = buildEventMap(workspace.events);
  const carryoverQueue = new Map<string, MaterializedTask[]>();
  const plans: DayPlan[] = [];

  for (let index = 0; index < totalDays; index += 1) {
    const date = shiftDate(startDate, index);
    const baseTasks = workspace.routines
      .filter((routine) => routineOccursOnDate(workspace, routine, date))
      .map((routine) => createBaseTask(routine, date));

    const queuedCarryovers = (carryoverQueue.get(date) ?? []).filter(
      (task) => !baseTasks.some((entry) => entry.routineId === task.routineId && entry.ownerId === task.ownerId),
    );

    const tasks = [...baseTasks, ...queuedCarryovers].map((task) => applyTaskStatus(task, referenceDate, eventMap));
    const orderedTasks = sortTasks(tasks);
    const summary = summarizeTasks(orderedTasks);

    plans.push({
      date,
      label: getRelativeLabel(date, referenceDate),
      summary,
      tasks: orderedTasks,
    });

    for (const task of orderedTasks) {
      if (task.status === "done") {
        continue;
      }

      queueCarryover(workspace, task, carryoverQueue, orderedTasks);
    }
  }

  return plans;
}
