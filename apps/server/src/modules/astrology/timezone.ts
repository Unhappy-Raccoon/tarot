export interface LocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

export interface UtcWindow {
  start: Date;
  end: Date;
}

function utcMilliseconds(parts: LocalDateTime): number {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(parts.hour, parts.minute, parts.second ?? 0, 0);
  return date.getTime();
}

function formatterForTimeZone(timeZone: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    calendar: "gregory",
    numberingSystem: "latn",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function partsAt(date: Date, formatter: Intl.DateTimeFormat): LocalDateTime {
  const values = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>;

  return {
    year: values.year!,
    month: values.month!,
    day: values.day!,
    hour: values.hour!,
    minute: values.minute!,
    second: values.second!,
  };
}

function sameLocalDateTime(left: LocalDateTime, right: LocalDateTime): boolean {
  return left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute &&
    (left.second ?? 0) === (right.second ?? 0);
}

function offsetAt(instant: Date, formatter: Intl.DateTimeFormat): number {
  const local = partsAt(instant, formatter);
  return utcMilliseconds(local) - instant.getTime();
}

/**
 * Returns every UTC instant matching a wall-clock time in an IANA zone.
 * A DST spring gap returns no values; a fall-back repeated hour returns two.
 */
export function localDateTimeToUtcCandidates(
  local: LocalDateTime,
  timeZone: string,
): Date[] {
  const formatter = formatterForTimeZone(timeZone);
  const naiveUtc = utcMilliseconds(local);
  const offsets = new Set<number>();

  for (let hours = -36; hours <= 36; hours += 6) {
    const probe = new Date(naiveUtc + hours * 60 * 60 * 1000);
    offsets.add(offsetAt(probe, formatter));
  }

  const candidates = [...offsets]
    .map((offset) => new Date(naiveUtc - offset))
    .filter((candidate) => sameLocalDateTime(partsAt(candidate, formatter), local))
    .sort((left, right) => left.getTime() - right.getTime());

  return candidates.filter((candidate, index) =>
    index === 0 || candidate.getTime() !== candidates[index - 1]!.getTime(),
  );
}

function addCalendarDays(localDate: string, days: number): LocalDateTime {
  const [year, month, day] = localDate.split("-").map(Number);
  const value = new Date(0);
  value.setUTCFullYear(year!, month! - 1, day! + days);
  value.setUTCHours(0, 0, 0, 0);
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
    hour: 0,
    minute: 0,
    second: 0,
  };
}

function firstValidLocalBoundary(
  localDate: string,
  timeZone: string,
): Date {
  const start = addCalendarDays(localDate, 0);
  for (let minute = 0; minute <= 180; minute += 15) {
    const hour = Math.floor(minute / 60);
    const minuteOfHour = minute % 60;
    const candidates = localDateTimeToUtcCandidates(
      { ...start, hour, minute: minuteOfHour },
      timeZone,
    );
    if (candidates.length) return candidates[0]!;
  }
  throw new Error("Unable to resolve local date boundary for the supplied time zone");
}

export function localDateToUtcWindow(
  localDate: string,
  timeZone: string,
): UtcWindow {
  // Search from the first valid local instant in this date. The next date's
  // first valid instant is an exclusive end boundary, including DST 23/25h days.
  const start = firstValidLocalBoundary(localDate, timeZone);
  const nextDate = addCalendarDays(localDate, 1);
  const nextIso = [
    String(nextDate.year).padStart(4, "0"),
    String(nextDate.month).padStart(2, "0"),
    String(nextDate.day).padStart(2, "0"),
  ].join("-");
  const end = firstValidLocalBoundary(nextIso, timeZone);
  if (end.getTime() <= start.getTime()) {
    throw new Error("Birth date has an invalid time-zone boundary");
  }
  return { start, end };
}

export function unknownTimeZoneDateWindow(localDate: string): UtcWindow {
  const midnight = addCalendarDays(localDate, 0);
  const nextMidnight = addCalendarDays(localDate, 1);
  return {
    start: new Date(utcMilliseconds(midnight) - 14 * 60 * 60 * 1000),
    end: new Date(utcMilliseconds(nextMidnight) + 12 * 60 * 60 * 1000),
  };
}

export function sampleUtcWindow(window: UtcWindow, stepHours = 2): Date[] {
  const step = stepHours * 60 * 60 * 1000;
  const endExclusive = window.end.getTime();
  const result: Date[] = [];

  for (let time = window.start.getTime(); time < endExclusive; time += step) {
    result.push(new Date(time));
  }

  const lastValid = endExclusive - 1;
  if (
    lastValid >= window.start.getTime() &&
    result[result.length - 1]?.getTime() !== lastValid
  ) {
    result.push(new Date(lastValid));
  }

  return result;
}
