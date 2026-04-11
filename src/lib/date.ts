const FRESNO_TIME_ZONE = "America/Los_Angeles";

function getFresnoParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: FRESNO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

export function getFresnoDateString(date: Date = new Date()): string {
  const { year, month, day } = getFresnoParts(date);

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getFresnoDayOfYear(date: Date = new Date()): number {
  const { year, month, day } = getFresnoParts(date);
  const startOfYear = Date.UTC(year, 0, 1);
  const currentDay = Date.UTC(year, month - 1, day);

  return Math.floor((currentDay - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
}

export function getFresnoDisplayDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: FRESNO_TIME_ZONE,
    month: "numeric",
    day: "numeric",
  }).format(date);
}
