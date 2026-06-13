import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  Award
} from "lucide-react";
import { fetchStudents, fetchTeachers, fetchAttendance, fetchClasses, fetchMarks } from "../../lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Weekly attendance data
const weeklyAttendance = [
  { day: "Mon", present: 85, absent: 10, late: 5 },
  { day: "Tue", present: 90, absent: 7, late: 3 },
  { day: "Wed", present: 88, absent: 8, late: 4 },
  { day: "Thu", present: 92, absent: 5, late: 3 },
  { day: "Fri", present: 78, absent: 15, late: 7 },
  { day: "Sat", present: 45, absent: 50, late: 5 },
];

// Class performance data
const classPerformance = [
  { class: "8A", score: 82 },
  { class: "9A", score: 78 },
  { class: "9B", score: 85 },
  { class: "10A", score: 88 },
  { class: "10B", score: 76 },
];

const CHART_COLORS = ["hsl(142, 71%, 45%)", "hsl(0, 84%, 60%)", "hsl(38, 92%, 50%)"];

export function DashboardPage() {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const [students, setStudents] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [attendance, setAttendance] = React.useState<any[]>([]);
  const [marks, setMarks] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    fetchStudents().then((d) => { if (mounted) setStudents(d); }).catch(() => {});
    fetchTeachers().then((d) => { if (mounted) setTeachers(d); }).catch(() => {});
    fetchClasses().then((d) => { if (mounted) setClasses(d); }).catch(() => {});
    fetchAttendance().then((d) => { if (mounted) setAttendance(d); }).catch(() => {});
    fetchMarks().then((d) => { if (mounted) setMarks(d); }).catch(() => {});
    return () => { mounted = false; };
  }, [activeSchool]);

  const todayAttendance = attendance.filter((a) => a.date === new Date().toISOString().split("T")[0]);
  const presentCount = todayAttendance.filter((a) => a.status === "present").length;
  const absentCount = todayAttendance.filter((a) => a.status === "absent").length;
  const lateCount = todayAttendance.filter((a) => a.status === "late").length;
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
      change: "+12%",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Teachers",
      value: teachers.length,
      icon: Users,
      change: "+3%",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Classes",
      value: classes.length,
      icon: BookOpen,
      change: "+2",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      title: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: ClipboardCheck,
      change: "+5%",
      color: "from-amber-500 to-amber-600",
      bg: "bg-amber-500/10",
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

  // Dynamically compute weekly attendance from database attendance records
  const dynamicWeeklyAttendance = React.useMemo(() => {
    if (!attendance || attendance.length === 0) {
      return weeklyAttendance; // Fallback to mock
    }
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyStats = daysOfWeek.map((day) => ({
      day,
      present: 0,
      absent: 0,
      late: 0,
      count: 0
    }));

    attendance.forEach((record) => {
      const date = new Date(record.date);
      const dayIndex = date.getDay();
      const status = record.status.toLowerCase();
      
      dailyStats[dayIndex].count++;
      if (status === "present") dailyStats[dayIndex].present++;
      else if (status === "absent") dailyStats[dayIndex].absent++;
      else if (status === "late") dailyStats[dayIndex].late++;
    });

    return dailyStats
      .filter(d => d.day !== "Sun") // Mon to Sat
      .map(d => ({
        day: d.day,
        present: d.count > 0 ? Math.round((d.present / d.count) * 100) : 80,
        absent: d.count > 0 ? Math.round((d.absent / d.count) * 100) : 15,
        late: d.count > 0 ? Math.round((d.late / d.count) * 100) : 5,
      }));
  }, [attendance]);

  // Dynamically compute class performance from database marks records
  const dynamicClassPerformance = React.useMemo(() => {
    if (!marks || marks.length === 0) {
      return classPerformance; // Fallback
    }
    const classScores: Record<string, { total: number; count: number }> = {};
    marks.forEach((m) => {
      // Look up student class details
      const student = students.find((s) => s.id === m.studentId);
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

    return results.length > 0 ? results : classPerformance;
  }, [marks, students]);

  // Reusable school banner component
  const SchoolBanner = () => {
    if (!activeSchool) return null;
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${activeGradient} text-white shadow-xl border border-white/10 p-6 md:p-8 animate-fade-in`}>
        {/* Decorative background vectors */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Glowing Emblem School Logo */}
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center font-bold text-3xl md:text-4xl text-white tracking-wider ring-4 ring-white/5 animate-pulse-glow flex-shrink-0">
            {activeSchool.name.substring(0, 2).toUpperCase()}
          </div>

          {/* School Details */}
          <div className="flex-1 text-center md:text-left space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-center md:justify-start">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-md">
                {activeSchool.name}
              </h1>
              <Badge className="bg-white/15 border-white/10 text-white hover:bg-white/25 self-center sm:self-auto text-[10px] uppercase font-bold py-0.5 px-2.5 tracking-wider">
                {activeSchool.type || "School"}
              </Badge>
            </div>

            <p className="text-sm md:text-base text-white/80 font-medium italic drop-shadow-sm flex items-center justify-center md:justify-start gap-1.5">
              <Award className="h-4 w-4 text-white/70 flex-shrink-0" />
              "{activeMotto}"
            </p>

            {/* Address / Contact details grid */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-xs text-white/70 pt-2 border-t border-white/10">
              {activeSchool.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-white/60" />
                  <span>{activeSchool.address}</span>
                </div>
              )}
              {activeSchool.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-white/60" />
                  <span>{activeSchool.phone}</span>
                </div>
              )}
              {activeSchool.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-white/60" />
                  <span>{activeSchool.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Student-specific dashboard
  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <SchoolBanner />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Days Present</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                  <UserX className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Days Absent</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Days Late</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="text-left">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              My Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const statuses = ["present", "present", "present", "absent", "present", "late", "present"];
                const status = statuses[i] as "present" | "absent" | "late";
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {date.getDate()}
                      </div>
                      <span className="text-sm">
                        {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <Badge
                      variant={status === "present" ? "success" : status === "absent" ? "destructive" : "warning"}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin/Teacher Dashboard
  return (
    <div className="space-y-6">
      <SchoolBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className="hover-lift overflow-hidden group">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 text-left">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-success font-medium">{stat.change}</span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="text-left">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Weekly Attendance Overview
              </CardTitle>
              <Badge variant="secondary">This Week</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicWeeklyAttendance}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="hsl(142, 71%, 45%)"
                    fill="url(#colorPresent)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    stroke="hsl(0, 84%, 60%)"
                    fill="hsl(0, 84%, 60%)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader className="text-left">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <Card>
          <CardHeader className="text-left">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                Class Performance
              </CardTitle>
              <Badge variant="info">Average Scores</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicClassPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="text-left">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Attendance marked", detail: "Class 10-A by Priya Sharma", time: "2 min ago", type: "success" },
                { action: "New student admitted", detail: "Divya Nair to Class 8-A", time: "1 hour ago", type: "info" },
                { action: "Report generated", detail: "Monthly attendance report", time: "3 hours ago", type: "warning" },
                { action: "Exam schedule updated", detail: "Mid-term exams - June 2026", time: "5 hours ago", type: "default" },
                { action: "Teacher leave approved", detail: "Neha Joshi - 2 days leave", time: "Yesterday", type: "destructive" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                >
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
