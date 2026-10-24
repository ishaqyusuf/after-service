/** Calendar dates are compared in the operator's timezone, never server-local time. */
export function isTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function calendarDay(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function shiftCalendarDay(day: string, amount: number) {
  const date = new Date(`${day}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function followUpStage(
  item: { status: string; dueAt: string | Date },
  today: string,
  timeZone: string,
): "closed" | "replied" | "waiting" | "dueToday" | "upcoming" {
  if (item.status === "closed" || item.status === "replied") return item.status;
  if (item.status === "sent") return "waiting";
  return calendarDay(new Date(item.dueAt), timeZone) <= today
    ? "dueToday"
    : "upcoming";
}
