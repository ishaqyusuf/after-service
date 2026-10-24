// Calendar-day helpers scoped to the operator timezone from useTimeZone().
// They match calendarDay()/shiftCalendarDay() in @afterservice/db so the
// overview, board and sheets agree with server stage boundaries.

export function calendarDay(date: Date | string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date(date));
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function shiftCalendarDay(day: string, amount: number) {
  const date = new Date(`${day}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from}T12:00:00.000Z`);
  const end = Date.parse(`${to}T12:00:00.000Z`);
  return Math.round((end - start) / 86_400_000);
}

// Calendar days are plain dates, so format them at UTC noon.
function formatCalendarDay(day: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(
    new Date(`${day}T12:00:00.000Z`),
  );
}

export function dayNumber(day: string) {
  return String(Number(day.slice(8, 10)));
}

export function weekdayShort(day: string) {
  return formatCalendarDay(day, { weekday: "short" });
}

export function monthShort(day: string) {
  return formatCalendarDay(day, { month: "short" });
}

export function formatDayShort(day: string) {
  return formatCalendarDay(day, { day: "numeric", month: "short" });
}

export function formatDayLong(day: string) {
  return formatCalendarDay(day, {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

export function formatDayWithWeekday(day: string) {
  return formatCalendarDay(day, {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

export function formatStamp(date: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone,
  }).format(new Date(date));
}

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export function relativeDay(day: string, today: string) {
  const offset = daysBetween(today, day);
  if (offset === 0) return "today";
  if (offset === 1) return "tomorrow";
  if (offset === -1) return "yesterday";
  if (offset < 0) return `${plural(-offset, "day")} ago`;
  if (offset < 7) return `in ${plural(offset, "day")}`;
  return `on ${formatDayShort(day)}`;
}

type DueLineInput = {
  closedAt?: string | null;
  dueAt: string;
  events?: Array<{ createdAt: string; type: string }>;
  sentAt?: string | null;
  status: string;
};

export function latestEvent<T extends { createdAt: string; type: string }>(
  events: T[] | undefined,
  type: string,
): T | undefined {
  return events
    ?.filter((event) => event.type === type)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

// Reply and close events store the operator's note as metadata.notes.
export function eventNotes(event: { metadata?: unknown } | undefined) {
  const metadata = event?.metadata;
  if (!metadata || typeof metadata !== "object") return null;
  const notes = (metadata as { notes?: unknown }).notes;
  return typeof notes === "string" && notes.trim() ? notes.trim() : null;
}

export function isOverdue(
  item: Pick<DueLineInput, "dueAt" | "status">,
  today: string,
  timeZone: string,
) {
  if (!["open", "scheduled", "missed"].includes(item.status)) return false;
  return calendarDay(item.dueAt, timeZone) < today;
}

export function followUpDueLine(
  item: DueLineInput,
  today: string,
  timeZone: string,
) {
  if (item.status === "sent") {
    return item.sentAt
      ? `Contacted ${relativeDay(calendarDay(item.sentAt, timeZone), today)}`
      : "Contacted";
  }
  if (item.status === "replied") {
    const reply = latestEvent(item.events, "replied");
    return reply
      ? `Replied ${relativeDay(calendarDay(reply.createdAt, timeZone), today)}`
      : "Replied";
  }
  if (item.status === "closed") {
    return item.closedAt
      ? `Closed ${formatDayShort(calendarDay(item.closedAt, timeZone))}`
      : "Closed";
  }

  const offset = daysBetween(today, calendarDay(item.dueAt, timeZone));
  if (offset < 0) return `Overdue by ${plural(-offset, "day")}`;
  if (offset === 0) return "Due today";
  if (offset === 1) return "Due tomorrow";
  return `Due ${formatDayWithWeekday(calendarDay(item.dueAt, timeZone))}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
