import { format, isToday, isYesterday, isThisWeek, isThisMonth, startOfDay, subDays } from "date-fns"

export type DateGroup = "today" | "yesterday" | "last7days" | "thismonth" | "older"

export function getDateGroup(date: Date): DateGroup {
  const now = new Date()

  if (isToday(date)) {
    return "today"
  }

  if (isYesterday(date)) {
    return "yesterday"
  }

  // Check if within last 7 days (excluding today and yesterday)
  const sevenDaysAgo = subDays(startOfDay(now), 7)
  if (date >= sevenDaysAgo) {
    return "last7days"
  }

  if (isThisMonth(date)) {
    return "thismonth"
  }

  return "older"
}

export function getDateGroupLabel(group: DateGroup): string {
  switch (group) {
    case "today":
      return "Today"
    case "yesterday":
      return "Yesterday"
    case "last7days":
      return "Last 7 days"
    case "thismonth":
      return "This month"
    case "older":
      return "Older"
  }
}

export function formatConversationDate(date: Date): string {
  if (isToday(date)) {
    return format(date, "HH:mm")
  }

  if (isYesterday(date)) {
    return "Yesterday"
  }

  if (isThisWeek(date)) {
    return format(date, "EEE")
  }

  if (isThisMonth(date)) {
    return format(date, "MMM d")
  }

  return format(date, "MMM d, yyyy")
}