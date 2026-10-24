import { expect, test } from "bun:test";
import {
  calendarDay,
  followUpDueLine,
  shiftCalendarDay,
} from "./follow-up-dates";

test("operator days agree across Lagos midnight and the repeated US DST hour", () => {
  expect(calendarDay("2026-10-24T23:30:00Z", "Africa/Lagos")).toBe(
    "2026-10-25",
  );
  expect(calendarDay("2026-10-25T01:00:00Z", "America/Los_Angeles")).toBe(
    "2026-10-24",
  );
  expect(calendarDay("2026-11-01T05:30:00Z", "America/New_York")).toBe(
    "2026-11-01",
  );
  expect(calendarDay("2026-11-01T06:30:00Z", "America/New_York")).toBe(
    "2026-11-01",
  );
});

test("planner navigation crosses leap days and year boundaries without shifting a date", () => {
  expect(shiftCalendarDay("2028-02-28", 1)).toBe("2028-02-29");
  expect(shiftCalendarDay("2026-12-31", 1)).toBe("2027-01-01");
  expect(shiftCalendarDay("2027-01-01", -1)).toBe("2026-12-31");
});

test("contacted work shows contact history instead of an overdue label", () => {
  expect(
    followUpDueLine(
      {
        status: "sent",
        dueAt: "2026-10-20T12:00:00Z",
        sentAt: "2026-10-23T12:00:00Z",
      },
      "2026-10-24",
      "Africa/Lagos",
    ),
  ).toBe("Contacted yesterday");
});
