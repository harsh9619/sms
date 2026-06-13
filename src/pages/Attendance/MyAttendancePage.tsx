import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
// MyAttendancePage uses a simulated attendance view for the logged-in user. No server import required.
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Calendar, TrendingUp } from "lucide-react";

export function MyAttendancePage() {
  const { user } = useAuth();

  // Simulated student attendance (using mock data or generated)
  const attendanceDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const rand = Math.random();
    return {
      date: date.toISOString().split("T")[0],
      dateFormatted: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      status: rand > 0.15 ? "present" : rand > 0.05 ? "late" : "absent" as string,
    };
  });

  const totalPresent = attendanceDays.filter((d) => d.status === "present").length;
  const totalAbsent = attendanceDays.filter((d) => d.status === "absent").length;
  const totalLate = attendanceDays.filter((d) => d.status === "late").length;
  const percentage = Math.round((totalPresent / attendanceDays.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-7 w-7 text-primary" />
          My Attendance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your attendance record for the last 30 days</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overall</p>
                <p className="text-xl font-bold">{percentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-success">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-xl font-bold text-success">{totalPresent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-destructive">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-xl font-bold text-destructive">{totalAbsent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-warning">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-xs text-muted-foreground">Late</p>
                <p className="text-xl font-bold text-warning">{totalLate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Calendar List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attendanceDays.map((day, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                    day.status === "present"
                      ? "bg-success/10 text-success"
                      : day.status === "absent"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                  }`}>
                    {new Date(day.date).getDate()}
                  </div>
                  <span className="text-sm font-medium">{day.dateFormatted}</span>
                </div>
                <Badge
                  variant={
                    day.status === "present" ? "success" :
                    day.status === "absent" ? "destructive" : "warning"
                  }
                >
                  {day.status === "present" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {day.status === "absent" && <XCircle className="h-3 w-3 mr-1" />}
                  {day.status === "late" && <Clock className="h-3 w-3 mr-1" />}
                  {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
