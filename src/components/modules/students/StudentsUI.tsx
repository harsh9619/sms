import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import type { Student } from "../../../types";
import { useSchool } from "../../../context/SchoolContext";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Upload,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  ImagePlus,
  ChevronRight,
  Loader2,
  Table2,
} from "lucide-react";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import { transliterateHindiToEnglish } from "../../../lib/transliterate";
import { useAppDispatch, useAppSelector } from "../../../saga/hooks";
import {
  fetchStudentsRequest,
  createStudentRequest,
  updateStudentRequest,
  deleteStudentRequest,
} from "../../../saga";

interface BulkRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  rollNumber: string;
  parentName: string;
  parentPhone: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  bloodGroup?: string;
  photoFile?: File;
  photoPreview?: string;
  errors: string[];
}

export function StudentsUI() {
  const dispatch = useAppDispatch();
  const reduxStudents = useAppSelector((state) => state.students.students);
  const { activeSchool } = useSchool();
  const [extraStudents, setExtraStudents] = useState<Student[]>([]);
  const students = useMemo(() => [...reduxStudents, ...extraStudents], [reduxStudents, extraStudents]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});

  useEffect(() => {
    dispatch(fetchStudentsRequest());
  }, [dispatch, activeSchool]);

  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.class));
    return Array.from(set).sort();
  }, [students]);

  const sections = useMemo(() => {
    const set = new Set(students.map((s) => s.section));
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === "all" || student.class === selectedClass;
      const matchesSection = selectedSection === "all" || student.section === selectedSection;
      return matchesSearch && matchesClass && matchesSection;
    });
  }, [students, searchQuery, selectedClass, selectedSection]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = () => {
    if (editingStudent) {
      dispatch(updateStudentRequest({ id: editingStudent.id, ...formData }));
    } else {
      const newStudent: any = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        class: formData.class || "10",
        section: formData.section || "A",
        rollNumber: formData.rollNumber || `${Date.now()}`.slice(-4),
        parentName: formData.parentName || "",
        parentPhone: formData.parentPhone || "",
        address: formData.address || "",
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "male",
        bloodGroup: formData.bloodGroup || "O+",
        enrollmentDate: new Date().toISOString().split("T")[0],
        status: "active",
      };
      dispatch(createStudentRequest(newStudent));
    }
    setShowModal(false);
    setEditingStudent(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      dispatch(deleteStudentRequest(id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Students Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredStudents.length} students enrolled</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingStudent(null); setFormData({}); setShowModal(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, roll number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
            >
              <option value="all">All Sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover-lift group">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-xs text-muted-foreground">Roll No: {student.rollNumber}</p>
                  </div>
                </div>
                <Badge variant="outline">Class {student.class}-{student.section}</Badge>
              </div>
              <div className="space-y-2 mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span>{student.email || "N/A"}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{student.phone || "N/A"}</span></div>
                <div className="flex items-center gap-2"><User className="h-3.5 w-3.5" /><span>Parent: {student.parentName || "N/A"}</span></div>
              </div>
              <div className="flex items-center gap-1 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setShowDetail(student)} className="flex-1">
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditingStudent(student); setFormData(student); setShowModal(true); }} className="flex-1">
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)} className="hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg m-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-lg font-bold">{editingStudent ? "Edit Student" : "Add Student"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-3 pt-4">
              <Input placeholder="Full Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Class" value={formData.class || ""} onChange={(e) => setFormData({ ...formData, class: e.target.value })} />
                <Input placeholder="Section" value={formData.section || ""} onChange={(e) => setFormData({ ...formData, section: e.target.value })} />
              </div>
              <Input placeholder="Roll Number" value={formData.rollNumber || ""} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} />
              <Input placeholder="Parent Name" value={formData.parentName || ""} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} />
              <Input placeholder="Parent Phone" value={formData.parentPhone || ""} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingStudent ? "Update" : "Create"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDetail(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md m-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-lg font-bold">Student Profile</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetail(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-3 pt-4 text-sm">
              <p><strong>Name:</strong> {showDetail.name}</p>
              <p><strong>Roll No:</strong> {showDetail.rollNumber}</p>
              <p><strong>Class:</strong> {showDetail.class}-{showDetail.section}</p>
              <p><strong>Email:</strong> {showDetail.email || "N/A"}</p>
              <p><strong>Phone:</strong> {showDetail.phone || "N/A"}</p>
              <p><strong>Parent:</strong> {showDetail.parentName} ({showDetail.parentPhone})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
