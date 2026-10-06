export const getCurrentDayOfWeek = (): string => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayIndex = new Date().getDay();
  const day = days[todayIndex];
  return day === "sunday" ? "monday" : day;
};

export const getSubjectColorStyle = (subjectName: string = "") => {
  const s = subjectName.toLowerCase();
  // if (s.includes("math") || s.includes("alg") || s.includes("geom")) {
  //   return {
  //     bg: "bg-blue-500/10 dark:bg-blue-500/20",
  //     border: "border-blue-500/30",
  //     text: "text-blue-700 dark:text-blue-300",
  //     badge: "bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-400/30",
  //   };
  // }
  // if (s.includes("sci") || s.includes("bio") || s.includes("env")) {
  //   return {
  //     bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  //     border: "border-emerald-500/30",
  //     text: "text-emerald-700 dark:text-emerald-300",
  //     badge: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-400/30",
  //   };
  // }
  // if (s.includes("phy")) {
  //   return {
  //     bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
  //     border: "border-indigo-500/30",
  //     text: "text-indigo-700 dark:text-indigo-300",
  //     badge: "bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border-indigo-400/30",
  //   };
  // }
  // if (s.includes("chem")) {
  //   return {
  //     bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
  //     border: "border-cyan-500/30",
  //     text: "text-cyan-700 dark:text-cyan-300",
  //     badge: "bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border-cyan-400/30",
  //   };
  // }
  // if (s.includes("eng") || s.includes("lit") || s.includes("lang")) {
  //   return {
  //     bg: "bg-amber-500/10 dark:bg-amber-500/20",
  //     border: "border-amber-500/30",
  //     text: "text-amber-700 dark:text-amber-300",
  //     badge: "bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-400/30",
  //   };
  // }
  // if (s.includes("hist") || s.includes("soc") || s.includes("geog") || s.includes("civic")) {
  //   return {
  //     bg: "bg-rose-500/10 dark:bg-rose-500/20",
  //     border: "border-rose-500/30",
  //     text: "text-rose-700 dark:text-rose-300",
  //     badge: "bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-400/30",
  //   };
  // }
  // if (s.includes("comp") || s.includes("it") || s.includes("code") || s.includes("tech")) {
  //   return {
  //     bg: "bg-purple-500/10 dark:bg-purple-500/20",
  //     border: "border-purple-500/30",
  //     text: "text-purple-700 dark:text-purple-300",
  //     badge: "bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-400/30",
  //   };
  // }
  // if (s.includes("pe") || s.includes("sport") || s.includes("pt") || s.includes("phys")) {
  //   return {
  //     bg: "bg-lime-500/10 dark:bg-lime-500/20",
  //     border: "border-lime-500/30",
  //     text: "text-lime-700 dark:text-lime-300",
  //     badge: "bg-lime-500/20 text-lime-800 dark:text-lime-200 border-lime-400/30",
  //   };
  // }
  // if (s.includes("art") || s.includes("music") || s.includes("draw")) {
  //   return {
  //     bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
  //     border: "border-fuchsia-500/30",
  //     text: "text-fuchsia-700 dark:text-fuchsia-300",
  //     badge: "bg-fuchsia-500/20 text-fuchsia-800 dark:text-fuchsia-200 border-fuchsia-400/30",
  //   };
  // }
  if (s.includes("free")) {
    return {
      bg: "bg-slate-500/10 dark:bg-slate-500/20",
      border: "border-slate-500/30",
      text: "text-slate-700 dark:text-slate-300",
      badge: "bg-slate-500/20 text-slate-800 dark:text-slate-200 border-slate-400/30",
    };
  }

  return {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-400/30",
  };
};

export const isCurrentPeriodNow = (dayOfWeek: string, startTimeStr: string, endTimeStr: string) => {
  const now = new Date();
  const currentDay = getCurrentDayOfWeek();
  if (dayOfWeek.toLowerCase() !== currentDay.toLowerCase()) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = startTimeStr.substring(0, 5).split(":").map(Number);
  const [endH, endM] = endTimeStr.substring(0, 5).split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};
