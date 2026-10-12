import {
  PartyPopper,
  BookOpen,
  Sparkles,
  Trophy,
  Users,
  FileText,
} from "lucide-react";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ALL_WEEKDAYS_LOWER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export interface TypeStyle {
  label: string;
  badge: string;
  dot: string;
  icon: any;
}

export const TYPE_STYLES: Record<string, TypeStyle> = {
  HOLIDAY: {
    label: "Holiday",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    dot: "bg-rose-500",
    icon: PartyPopper,
  },
  EXAM: {
    label: "Exam",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    dot: "bg-amber-500",
    icon: BookOpen,
  },
  EVENT: {
    label: "Event",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    dot: "bg-indigo-500",
    icon: Sparkles,
  },
  SPORTS: {
    label: "Sports",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    dot: "bg-emerald-500",
    icon: Trophy,
  },
  MEETING: {
    label: "Meeting",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    dot: "bg-purple-500",
    icon: Users,
  },
  OTHER: {
    label: "Activity",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    dot: "bg-gray-500",
    icon: FileText,
  },
};
