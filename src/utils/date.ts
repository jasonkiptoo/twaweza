const ordinalSuffix = (day: number) => {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
};

export function formatFinancialDate(
  value: string | number | Date | null | undefined,
  fallback = "Date unavailable",
): string {
  if (value === null || value === undefined || value === "") return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const day = date.getDate();
  return `${day}${ordinalSuffix(day)} ${date.toLocaleString("en", {
    month: "short",
  })} ${date.getFullYear()}`;
}
