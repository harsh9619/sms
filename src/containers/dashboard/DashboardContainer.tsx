import React, { useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { useAppDispatch, useAppSelector } from "../../saga/hooks";
import {
  fetchStudentsRequest,
  fetchTeachersRequest,
  fetchClassesRequest,
  fetchAttendanceRequest,
  fetchMarksRequest,
} from "../../saga";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import { DashboardUI } from "../../components/modules/dashboard/DashboardUI";

const weeklyAttendanceMock = [
  { day: "Mon", present: 85, absent: 10, late: 5 },
  { day: "Tue", present: 90, absent: 7, late: 3 },
  { day: "Wed", present: 88, absent: 8, late: 4 },
  { day: "Thu", present: 92, absent: 5, late: 3 },
  { day: "Fri", present: 78, absent: 15, late: 7 },
  { day: "Sat", present: 45, absent: 50, late: 5 },
];

const classPerformanceMock = [
  { class: "8A", score: 82 },
  { class: "9A", score: 78 },
  { class: "9B", score: 85 },
  { class: "10A", score: 88 },
  { class: "10B", score: 76 },
];

const CHART_COLORS = ["hsl(142, 71%, 45%)", "hsl(0, 84%, 60%)", "hsl(38, 92%, 50%)"];

export function DashboardContainer() {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state) => state.students.students);
  const teachers = useAppSelector((state) => state.teachers.teachers);
  const classes = useAppSelector((state) => state.classes.classes);
  const attendance = useAppSelector((state) => state.attendance.records);
  const marks = useAppSelector((state) => state.marks.marks);

  const { user } = useAuth();
  const { activeSchool } = useSchool();

  useEffect(() => {
    dispatch(fetchStudentsRequest());
    dispatch(fetchTeachersRequest());
    dispatch(fetchClassesRequest());
    dispatch(fetchAttendanceRequest());
    dispatch(fetchMarksRequest());
  }, [dispatch, activeSchool]);

  const todayAttendance = attendance.filter((a: any) => a.date === new Date().toISOString().split("T")[0]);
  const presentCount = todayAttendance.filter((a: any) => a.status === "present").length;
  const absentCount = todayAttendance.filter((a: any) => a.status === "absent").length;
  const lateCount = todayAttendance.filter((a: any) => a.status === "late").length;
  const totalToday = todayAttendance.length;
  const attendanceRate = totalToday > 0 ? Math.round((presentCount / totalToday) * 100) : 0;

  const pieData = [
    { name: "Present", value: presentCount || 5 },
    { name: "Absent", value: absentCount || 1 },
    { name: "Late", value: lateCount || 1 },
  ];

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: GraduationCap,
      change: "",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Teachers",
      value: teachers.length,
      icon: Users,
      change: "",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Classes",
      value: classes.length,
      icon: BookOpen,
      change: "",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-500/10",
    },
  ];

  const bannerGradients: Record<string, string> = {
    "default": "from-blue-600 via-indigo-600 to-indigo-950",
    "emerald": "from-emerald-600 via-teal-600 to-teal-950",
    "purple": "from-purple-600 via-fuchsia-600 to-fuchsia-950",
    "rose": "from-rose-600 via-pink-600 to-pink-950",
    "amber": "from-amber-600 via-orange-600 to-orange-950",
  };

  const bannerMottos: Record<string, string> = {
    "default": "Inspiring Excellence, Nurturing Futures",
    "emerald": "Shaping Global Citizens for a Better Tomorrow",
    "purple": "Empowering Innovators, Shaping Tomorrow",
    "rose": "Compassion, Integrity, Excellence",
    "amber": "Creativity, Curiosity, Character",
  };

  const activeGradient = activeSchool ? (bannerGradients[activeSchool.theme || "default"] || "from-primary via-primary/80 to-indigo-900") : "from-primary to-indigo-900";
  const activeMotto = activeSchool ? (bannerMottos[activeSchool.theme || "default"] || "Welcome to your school administration portal") : "Welcome to your school administration portal";

  const dynamicWeeklyAttendance = useMemo(() => {
    if (!attendance || attendance.length === 0) {
      return weeklyAttendanceMock;
    }
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyStats = daysOfWeek.map((day) => ({
      day,
      present: 0,
      absent: 0,
      late: 0,
      count: 0
    }));

    attendance.forEach((record: any) => {
      const date = new Date(record.date);
      const dayIndex = date.getDay();
      const status = record.status.toLowerCase();

      dailyStats[dayIndex].count++;
      if (status === "present") dailyStats[dayIndex].present++;
      else if (status === "absent") dailyStats[dayIndex].absent++;
      else if (status === "late") dailyStats[dayIndex].late++;
    });

    return dailyStats
      .filter(d => d.day !== "Sun")
      .map(d => ({
        day: d.day,
        present: d.count > 0 ? Math.round((d.present / d.count) * 100) : 80,
        absent: d.count > 0 ? Math.round((d.absent / d.count) * 100) : 15,
        late: d.count > 0 ? Math.round((d.late / d.count) * 100) : 5,
      }));
  }, [attendance]);

  const dynamicClassPerformance = useMemo(() => {
    if (!marks || marks.length === 0) {
      return classPerformanceMock;
    }
    const classScores: Record<string, { total: number; count: number }> = {};
    marks.forEach((m: any) => {
      const student = students.find((s: any) => s.id === m.studentId);
      const className = student ? `${student.class}${student.section}` : "Other";
      if (!classScores[className]) {
        classScores[className] = { total: 0, count: 0 };
      }
      const percentage = m.maxScore > 0 ? (m.score / m.maxScore) * 100 : 0;
      classScores[className].total += percentage;
      classScores[className].count++;
    });

    const results = Object.entries(classScores)
      .filter(([name]) => name !== "Other")
      .map(([className, stats]) => ({
        class: className,
        score: Math.round(stats.total / stats.count),
      }));

    return results.length > 0 ? results : classPerformanceMock;
  }, [marks, students]);

  return (
    <DashboardUI
      user={user}
      activeSchool={activeSchool}
      stats={stats}
      activeGradient={activeGradient}
      activeMotto={activeMotto}
      pieData={pieData}
      dynamicWeeklyAttendance={dynamicWeeklyAttendance}
      dynamicClassPerformance={dynamicClassPerformance}
      presentCount={presentCount}
      absentCount={absentCount}
      lateCount={lateCount}
      totalToday={totalToday}
      attendanceRate={attendanceRate}
      CHART_COLORS={CHART_COLORS}
    />
  );
}

export default DashboardContainer;
