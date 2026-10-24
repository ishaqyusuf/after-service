export function amountToCents(amount: string) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(amount))
    throw Error("Enter a positive amount with at most two decimal places.");
  const [whole, decimal = ""] = amount.split(".");
  const cents = BigInt(whole!) * 100n + BigInt(decimal.padEnd(2, "0"));
  if (cents > 2147483647n) throw Error("The job amount is too large.");
  return Number(cents);
}
export function isTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
function wallClock(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map((v) => [v.type, v.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}
export function statedTimeToIso(value: string, timeZone: string) {
  if (!isTimeZone(timeZone)) throw Error("Choose a valid timezone.");
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  ) {
    const clock = value
      .replace(/(?:Z|[+-]\d{2}:\d{2})$/, "")
      .replace(/\.\d+$/, "");
    const fullClock = clock.length === 16 ? `${clock}:00` : clock;
    const check = new Date(`${fullClock}Z`);
    if (
      !Number.isFinite(check.getTime()) ||
      check.toISOString().slice(0, 19) !== fullClock
    )
      throw Error("Enter a valid date and time.");
    const d = new Date(value);
    if (!Number.isFinite(d.getTime()))
      throw Error("Enter a valid date and time.");
    return d.toISOString();
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value))
    throw Error("Provide an exact date and time, such as 2026-10-30T09:00.");
  const desired = value.length === 16 ? `${value}:00` : value;
  const nominal = new Date(`${desired}Z`).getTime();
  if (
    !Number.isFinite(nominal) ||
    new Date(nominal).toISOString().slice(0, 19) !== desired
  )
    throw Error("Enter a valid date and time.");
  const matches = new Set<number>();
  for (const hours of [-24, -12, 0, 12, 24]) {
    const sample = new Date(nominal + hours * 3600000);
    const offset =
      new Date(`${wallClock(sample, timeZone)}Z`).getTime() - sample.getTime();
    const candidate = nominal - offset;
    if (wallClock(new Date(candidate), timeZone) === desired)
      matches.add(candidate);
  }
  if (matches.size !== 1)
    throw Error(
      matches.size
        ? "This time occurs twice. Provide an explicit UTC offset."
        : "This local time does not exist. Choose another time.",
    );
  return new Date([...matches][0]!).toISOString();
}
