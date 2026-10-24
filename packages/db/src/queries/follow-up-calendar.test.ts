import { describe, expect, test } from "bun:test";
import {
  calendarDay,
  followUpStage,
  isTimeZone,
  shiftCalendarDay,
} from "./follow-up-calendar";

describe("operator calendar boundaries", () => {
  test("tomorrow at Lagos midnight stays upcoming despite the UTC date", () => {
    const dueAt = new Date("2026-10-19T23:00:00.000Z");
    expect(calendarDay(dueAt, "Africa/Lagos")).toBe("2026-10-20");
    expect(
      followUpStage(
        { status: "scheduled", dueAt },
        "2026-10-19",
        "Africa/Lagos",
      ),
    ).toBe("upcoming");
  });
  test("western timezones retain their local day after UTC midnight", () => {
    expect(
      calendarDay(new Date("2026-10-20T02:00:00Z"), "America/Los_Angeles"),
    ).toBe("2026-10-19");
  });
  test("DST fallback maps both repeated hours to the same calendar date", () => {
    for (const instant of ["2026-11-01T05:30:00Z", "2026-11-01T06:30:00Z"]) {
      expect(calendarDay(new Date(instant), "America/New_York")).toBe(
        "2026-11-01",
      );
    }
    expect(shiftCalendarDay("2026-03-08", 1)).toBe("2026-03-09");
    expect(shiftCalendarDay("2026-12-31", 1)).toBe("2027-01-01");
  });
  test("each state belongs to one column; contacted work stays waiting", () => {
    const dueAt = "2026-10-18T12:00:00Z";
    for (const status of ["open", "scheduled", "missed"]) {
      expect(followUpStage({ status, dueAt }, "2026-10-19", "UTC")).toBe(
        "dueToday",
      );
    }
    for (const [status, stage] of [
      ["sent", "waiting"],
      ["replied", "replied"],
      ["closed", "closed"],
    ]) {
      expect(followUpStage({ status, dueAt }, "2026-10-19", "UTC")).toBe(stage);
    }
    expect(
      followUpStage(
        { status: "open", dueAt: "2026-10-20T00:00:00Z" },
        "2026-10-19",
        "UTC",
      ),
    ).toBe("upcoming");
  });
  test("invalid timezone names fail validation", () => {
    expect(isTimeZone("Africa/Lagos")).toBe(true);
    expect(isTimeZone("invalid/timezone")).toBe(false);
  });
});
