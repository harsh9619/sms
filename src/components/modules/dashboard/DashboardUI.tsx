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
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* Top Greeting & Active Year Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border/60 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            Welcome back, {user?.name || "Administrator"} <span className="animate-bounce inline-block">👋</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here is the real-time overview of your school's daily operations & academic performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 font-bold text-xs bg-background/80 border-border/80 shadow-2xs gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> {currentDateFormatted}
          </Badge>

        </div>
      </div>

      {/* Dynamic School Banner */}
      {activeSchool && (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${activeGradient} text-white shadow-2xl border border-white/10 p-6 sm:p-8 animate-fade-in`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/30 shadow-2xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white tracking-wider ring-4 ring-white/10 flex-shrink-0">
              {activeSchool.name ? activeSchool.name.substring(0, 2).toUpperCase() : "SCH"}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center md:justify-start">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                  {activeSchool.name}
                </h1>
                <Badge className="bg-white/20 border-white/20 text-white hover:bg-white/30 self-center sm:self-auto text-[10px] uppercase font-black py-0.5 px-3 tracking-wider shadow-2xs">
                  {activeSchool.type || "Educational Institution"}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-white/90 font-medium italic drop-shadow-xs flex items-center justify-center md:justify-start gap-1.5">
                <Award className="h-4 w-4 text-white/80 flex-shrink-0" />
                "{activeMotto}"
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-white/80 pt-3 border-t border-white/15">
                {activeSchool.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-white/70" />
                    <span>{activeSchool.address}</span>
                  </div>
                )}
                {activeSchool.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-white/70" />
                    <span>{activeSchool.phone}</span>
                  </div>
                )}
                {activeSchool.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-white/70" />
                    <span>{activeSchool.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Card key={idx} className="relative overflow-hidden border border-border/60 hover:shadow-lg transition-all duration-300 group rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-3xl font-black mt-1 text-foreground group-hover:text-primary transition-colors">{stat.value}</h3>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl ${stat.bg} border border-border/40 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-7 w-7 text-primary" />
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
        <Card className="lg:col-span-2 border-border/60 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Weekly Attendance Trend (%)
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-background">
                Mon - Sat
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicWeeklyAttendance}>
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#presentGrad)"
                    name="Present (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Overview */}
        <Card className="border-border/60 shadow-md rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="p-5 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Today's Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-foreground">{attendanceRate}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Attendance Rate</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-border/40">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Present</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{presentCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">Absent</p>
                <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{absentCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">Late</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
