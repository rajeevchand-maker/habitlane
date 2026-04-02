import { describe, expect, it } from "vitest";
import {
  compareDates,
  daysBetween,
  getRelativeLabel,
  getWeekday,
  shiftDate,
} from "@/lib/habitlane/date";

describe("habitlane date helpers", () => {
  it("shifts dates across month boundaries using UTC-noon semantics", () => {
    expect(shiftDate("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftDate("2026-03-31", 1)).toBe("2026-04-01");
  });

  it("computes signed day distances consistently", () => {
    expect(daysBetween("2026-03-10", "2026-03-13")).toBe(3);
    expect(compareDates("2026-03-13", "2026-03-10")).toBe(-3);
  });

  it("maps ISO dates to the expected Habitlane weekday codes", () => {
    expect(getWeekday("2026-03-09")).toBe("MON");
    expect(getWeekday("2026-03-14")).toBe("SAT");
    expect(getWeekday("2026-03-15")).toBe("SUN");
  });

  it("returns relative labels for adjacent days and formatted labels otherwise", () => {
    expect(getRelativeLabel("2026-03-10", "2026-03-10")).toBe("Today");
    expect(getRelativeLabel("2026-03-11", "2026-03-10")).toBe("Tomorrow");
    expect(getRelativeLabel("2026-03-09", "2026-03-10")).toBe("Yesterday");
    expect(getRelativeLabel("2026-03-14", "2026-03-10")).toBe("Sat, Mar 14");
  });
});
