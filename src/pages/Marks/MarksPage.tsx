import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { fetchMarks, createMarks, fetchClasses, fetchSubjects, fetchStudents } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Award, Check, Clock, ShieldAlert, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { MarkRecord, ClassInfo, Student } from "../../types";

const EXAM_TYPES = [
  { value: "unit_test", label: "Unit Test" },
  { value: "midterm", label: "Midterm Exam" },
  { value: "final", label: "Final Exam" },
  { value: "assignment", label: "Assignment" },
  { value: "practical", label: "Practical" }
];

export function MarksPage() {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  
  // Selection States for Teacher Grading
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("final");
  const [maxScoreInput, setMaxScoreInput] = useState(100);
  
  // Marks state
  const [studentGrades, setStudentGrades] = useState<Record<string, number>>({});
  const [marksHistory, setMarksHistory] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load baseline classes
  useEffect(() => {
    fetchClasses()
      .then((d) => {
        setClasses(d);
        if (d.length > 0 && user?.role === "teacher") {
          setSelectedClassId(d[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, [user, activeSchool]);

  // Load student profile if role is student
  useEffect(() => {
    if (user?.role === "student") {
      fetchStudents()
        .then((studentsList) => {
          const profile = studentsList.find((s: any) => s.email === user.email);
          if (profile) {
            setStudentProfile(profile);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user, activeSchool]);

  // Fetch subjects when teacher selects a class
  useEffect(() => {
    if (selectedClassId && user?.role === "teacher") {
      fetchSubjects({ classId: selectedClassId })
        .then((subs) => {
          setSubjects(subs);
          if (subs.length > 0) {
            setSelectedSubjectId(subs[0].id);
          } else {
            setSelectedSubjectId("");
          }
        })
        .catch((err) => console.error(err));

      // Fetch students of this class
      fetchStudents()
        .then((allStudents) => {
          const filtered = allStudents.filter((s: any) => s.classId === selectedClassId);
          setStudents(filtered);
        })
        .catch((err) => console.error(err));
    }
  }, [selectedClassId, user, activeSchool]);

  // Load existing grades when teacher selections change
  useEffect(() => {
    if (selectedClassId && selectedSubjectId && selectedExamType && user?.role === "teacher") {
      setLoading(true);
      fetchMarks({ classId: selectedClassId, subjectId: selectedSubjectId })
        .then((existingMarks: MarkRecord[]) => {
          const examMarks = existingMarks.filter((m) => m.examType === selectedExamType);
          const gradeMap: Record<string, number> = {};
          examMarks.forEach((m) => {
            gradeMap[m.studentId] = m.score;
            if (m.maxScore) setMaxScoreInput(m.maxScore);
          });
          setStudentGrades(gradeMap);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedClassId, selectedSubjectId, selectedExamType, user, activeSchool]);

  // Load student marks report card if student
  useEffect(() => {
    if (user?.role === "student" && studentProfile) {
      setLoading(true);
      fetchMarks({ studentId: studentProfile.id })
        .then((data) => {
          setMarksHistory(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user, studentProfile, activeSchool]);

  const handleGradeChange = (studentId: string, score: string) => {
    const num = parseFloat(score);
    setStudentGrades((prev) => ({
      ...prev,
      [studentId]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedClassId || !selectedSubjectId || !selectedExamType) return;
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      // Loop through grades and save
      for (const [studentId, score] of Object.entries(studentGrades)) {
        await createMarks({
          studentId,
          subjectId: selectedSubjectId,
          examType: selectedExamType,
          score,
          maxScore: maxScoreInput,
          enteredBy: user?.id,
        });
      }
      setSuccessMessage("Grades uploaded successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert("Failed to upload grades");
    } finally {
      setSubmitting(false);
    }
  };

  // Student grading calculations
  const gradingSummary = useMemo(() => {
    if (marksHistory.length === 0) return null;
    let totalScore = 0;
    let totalMax = 0;
    marksHistory.forEach((m) => {
      totalScore += m.score;
      totalMax += m.maxScore;
    });
    const percentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    return {
      percentage,
      grade,
      totalScore,
      totalMax,
    };
  }, [marksHistory]);

  const reportChartData = useMemo(() => {
    return marksHistory.map((m) => ({
      subject: m.subjectName,
      score: Math.round((m.score / m.maxScore) * 100),
    }));
  }, [marksHistory]);

  const getSubjectGrade = (score: number, maxScore: number) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return { label: "A+", color: "success" as const };
    if (pct >= 80) return { label: "A", color: "success" as const };
    if (pct >= 70) return { label: "B", color: "info" as const };
    if (pct >= 60) return { label: "C", color: "warning" as const };
    if (pct >= 50) return { label: "D", color: "warning" as const };
    return { label: "F", color: "destructive" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-7 w-7 text-primary animate-pulse-glow" />
            Exams & Marks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === "student" ? "Your examination grades and results transcript" : "Enter and manage student academic marks"}
          </p>
        </div>
      </div>

      {user?.role === "teacher" && (
        <div className="space-y-6 text-left">
          {/* Controls Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Exam Type</label>
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {EXAM_TYPES.map((ex) => (
                      <option key={ex.value} value={ex.value}>{ex.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Max Score</label>
                  <Input
                    type="number"
                    value={maxScoreInput}
                    onChange={(e) => setMaxScoreInput(parseInt(e.target.value) || 100)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Grades spreadsheet */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Students Grading Sheet</CardTitle>
              {successMessage && <div className="text-sm font-semibold text-success flex items-center gap-1"><Check className="h-4 w-4" /> {successMessage}</div>}
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground text-xs">Loading grading sheet...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-6 py-3.5 text-left font-semibold">Roll No</th>
                        <th className="px-6 py-3.5 text-left font-semibold">Student Name</th>
                        <th className="px-6 py-3.5 text-left font-semibold w-40">Score</th>
                        <th className="px-6 py-3.5 text-left font-semibold">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-muted/10">
                          <td className="px-6 py-3 font-medium text-muted-foreground">{student.rollNumber}</td>
                          <td className="px-6 py-3 font-semibold">{student.name}</td>
                          <td className="px-6 py-3">
                            <Input
                              type="number"
                              className="h-9 w-28 text-center"
                              placeholder="0"
                              max={maxScoreInput}
                              value={studentGrades[student.id] !== undefined ? studentGrades[student.id] : ""}
                              onChange={(e) => handleGradeChange(student.id, e.target.value)}
                            />
                          </td>
                          <td className="px-6 py-3 font-semibold text-muted-foreground">/ {maxScoreInput}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {students.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No students enrolled in this class.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {students.length > 0 && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveGrades} disabled={submitting}>
                {submitting ? "Uploading..." : "Save & Upload Grades"}
              </Button>
            </div>
          )}
        </div>
      )}

      {user?.role === "student" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground text-xs">Loading report card...</p>
            </div>
          ) : (
            <>
              {/* Report Card Left Panel */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden border border-primary/20">
                  <div className="bg-gradient-to-r from-primary to-primary-foreground p-5 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">{studentProfile?.name}</h3>
                      <p className="text-xs text-white/80 mt-1">Roll Number: {studentProfile?.rollNumber} • Class {studentProfile?.class}-{studentProfile?.section}</p>
                    </div>
                    {gradingSummary && (
                      <div className="h-16 w-16 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center font-bold">
                        <span className="text-[10px] text-white/70 uppercase">Grade</span>
                        <span className="text-2xl mt-0.5">{gradingSummary.grade}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                            <th className="px-6 py-3.5 text-left">Subject</th>
                            <th className="px-6 py-3.5 text-left">Exam</th>
                            <th className="px-6 py-3.5 text-center">Score</th>
                            <th className="px-6 py-3.5 text-center">Max</th>
                            <th className="px-6 py-3.5 text-right">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marksHistory.map((m) => {
                            const subGrade = getSubjectGrade(m.score, m.maxScore);
                            return (
                              <tr key={m.id} className="border-b hover:bg-muted/10">
                                <td className="px-6 py-3.5 font-bold text-foreground">{m.subjectName}</td>
                                <td className="px-6 py-3.5 capitalize text-xs text-muted-foreground font-medium">{m.examType.replace("_", " ")}</td>
                                <td className="px-6 py-3.5 text-center font-semibold">{m.score}</td>
                                <td className="px-6 py-3.5 text-center font-medium text-muted-foreground">{m.maxScore}</td>
                                <td className="px-6 py-3.5 text-right">
                                  <Badge variant={subGrade.color} className="font-bold">
                                    {subGrade.label}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {marksHistory.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center gap-2">
                          <ShieldAlert className="h-10 w-10 text-muted-foreground/45" />
                          <p className="font-medium">No results transcripts found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats and Graphs right panel */}
              <div className="space-y-6">
                {gradingSummary && (
                  <Card className="hover-lift">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Results Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Percentage</p>
                        <p className="text-3xl font-extrabold text-primary tracking-tight mt-1">{gradingSummary.percentage}%</p>
                      </div>
                      <div className="flex gap-4 border-t border-border/40 pt-4 text-xs font-medium">
                        <div className="flex-1">
                          <span className="text-muted-foreground">Total Obtained</span>
                          <p className="text-base font-bold text-foreground mt-0.5">{gradingSummary.totalScore}</p>
                        </div>
                        <div className="flex-1">
                          <span className="text-muted-foreground">Maximum Marks</span>
                          <p className="text-base font-bold text-foreground mt-0.5">{gradingSummary.totalMax}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {reportChartData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Performance Chart (%)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-4">
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={{ fontSize: "11px" }} />
                            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
