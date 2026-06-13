import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";
import { useSchool } from "../../context/SchoolContext";
// using API-driven classes and teachers
import { fetchClasses, fetchTeachers } from "../../lib/api";
import { BookOpen, Users, Check, ChevronRight, ArrowLeft, School, Search, GraduationCap } from "lucide-react";
import { Input } from "../../components/ui/Input";

export function AssignTeacherPage() {
  const navigate = useNavigate();
  const { activeSchool } = useSchool();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [searchClass, setSearchClass] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");

  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    fetchClasses().then((d) => { if (mounted) setClasses(d); }).catch(() => {});
    fetchTeachers().then((d) => { if (mounted) setTeachers(d); }).catch(() => {});
    return () => { mounted = false; };
  }, [activeSchool]);

  const filteredClasses = classes.filter(c => 
    `${c.name} ${c.section}`.toLowerCase().includes(searchClass.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTeacher.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchTeacher.toLowerCase())
  );

  const handleAssign = () => {
    if (selectedClass && selectedTeacher) {
  const cls = classes.find(c => c.id === selectedClass);
  const teacher = teachers.find(t => t.id === selectedTeacher);
      
      // In a real app, we would call an API here
      alert(`Successfully assigned ${teacher?.name} to Class ${cls?.name}-${cls?.section}`);
      navigate("/classes");
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/classes")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              Assign Class Teacher
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Assign a teacher to lead a specific class</p>
          </div>
        </div>
        <Button 
          disabled={!selectedClass || !selectedTeacher} 
          onClick={handleAssign}
          className="shadow-lg shadow-primary/20 px-8"
        >
          Confirm Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Class Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              1. Select Class
            </h3>
            {selectedClass && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Selected: {classes.find(c => c.id === selectedClass)?.name}-{classes.find(c => c.id === selectedClass)?.section}
              </Badge>
            )}
          </div>
          
          <Card className="overflow-hidden border-2 border-transparent transition-all duration-300 focus-within:border-primary/20">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search class..." 
                  className="pl-10 border-none bg-muted/50 focus:bg-background"
                  value={searchClass}
                  onChange={(e) => setSearchClass(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              <div className="divide-y divide-border/50">
                {filteredClasses.map((cls) => (
                  <div 
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-muted/30 ${selectedClass === cls.id ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${selectedClass === cls.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                        {cls.name}
                      </div>
                      <div>
                        <p className="font-semibold">Section {cls.section}</p>
                        <p className="text-xs text-muted-foreground">Current: {cls.teacherName}</p>
                      </div>
                    </div>
                    {selectedClass === cls.id && <Check className="h-5 w-5 text-primary" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              2. Select Teacher
            </h3>
            {selectedTeacher && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Selected: {teachers.find(t => t.id === selectedTeacher)?.name}
              </Badge>
            )}
          </div>

          <Card className="overflow-hidden border-2 border-transparent transition-all duration-300 focus-within:border-primary/20">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search teacher..." 
                  className="pl-10 border-none bg-muted/50 focus:bg-background"
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              <div className="divide-y divide-border/50">
                {filteredTeachers.map((teacher) => (
                  <div 
                    key={teacher.id}
                    onClick={() => setSelectedTeacher(teacher.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-muted/30 ${selectedTeacher === teacher.id ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"}`}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar size="md">
                        <AvatarFallback className={selectedTeacher === teacher.id ? "bg-primary text-white" : ""}>
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.subject} • {teacher.experience}</p>
                      </div>
                    </div>
                    {selectedTeacher === teacher.id && <Check className="h-5 w-5 text-primary" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Section */}
      {selectedClass && selectedTeacher && (
        <Card className="bg-primary/5 border-primary/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Class</p>
                    <div className="h-16 w-16 rounded-2xl bg-background border border-border flex items-center justify-center text-2xl font-bold">
                    {classes.find(c => c.id === selectedClass)?.name}-{classes.find(c => c.id === selectedClass)?.section}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center pt-6">
                  <ChevronRight className="h-8 w-8 text-primary/30" />
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">New Class Teacher</p>
                  <div className="flex items-center gap-3 bg-background border border-border p-3 rounded-2xl">
                    <Avatar size="md">
                      <AvatarFallback>{getInitials(teachers.find(t => t.id === selectedTeacher)?.name || "")}</AvatarFallback>
                    </Avatar>
                    <div className="text-left pr-4">
                      <p className="font-bold">{teachers.find(t => t.id === selectedTeacher)?.name}</p>
                      <p className="text-[10px] text-muted-foreground">{teachers.find(t => t.id === selectedTeacher)?.subject}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 max-w-md text-sm text-muted-foreground italic text-center md:text-right">
                "Assigning {teachers.find(t => t.id === selectedTeacher)?.name} as the class teacher will give them full access to manage attendance and student records for this class."
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State / Hint */}
      {(!selectedClass || !selectedTeacher) && (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h4 className="text-lg font-medium text-muted-foreground">Complete Selection</h4>
          <p className="text-sm text-muted-foreground/60 max-w-sm text-center mt-2">
            Please select both a class and a teacher from the lists above to proceed with the assignment.
          </p>
        </div>
      )}
    </div>
  );
}
