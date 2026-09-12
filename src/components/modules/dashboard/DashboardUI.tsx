import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import {
  GraduationCap,
  Users,
  BookOpen,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Award
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export interface DashboardUIProps {
  user: any;
  activeSchool: any;
  stats: any[];
  activeGradient: string;
  activeMotto: string;
  pieData: any[];
  dynamicWeeklyAttendance: any[];
  dynamicClassPerformance: any[];
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalToday: number;
  attendanceRate: number;
  CHART_COLORS: string[];
}

export function DashboardUI({
  user,
  activeSchool,
  stats,
  activeGradient,
  activeMotto,
  pieData,
  dynamicWeeklyAttendance,
  dynamicClassPerformance,
  presentCount,
  absentCount,
  lateCount,
  totalToday,
  attendanceRate,
  CHART_COLORS,
}: DashboardUIProps) {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Dynamic School Banner */}
      {activeSchool && (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${activeGradient} text-white shadow-xl border border-white/10 p-6 md:p-8 animate-fade-in`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center font-bold text-3xl md:text-4xl text-white tracking-wider ring-4 ring-white/5 animate-pulse-glow flex-shrink-0">
              {activeSchool.name.substring(0, 2).toUpperCase()}
            </div>

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
      )}

      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome back, {user?.name || "User"} 👋
          </h2>
          <p className="text-xs text-muted-foreground">
            Here's what's happening in your school today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 font-medium text-xs">
            Academic Year: 2025-2026
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Card key={idx} className="relative overflow-hidden border border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-2xl font-extrabold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="text-left">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Weekly Attendance Rate (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicWeeklyAttendance}>
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="present" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#presentGrad)" name="Present (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Overview */}
        <Card>
          <CardHeader className="text-left">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Today's Attendance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{attendanceRate}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Attendance Rate</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Present</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Absent</p>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{absentCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Late</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
