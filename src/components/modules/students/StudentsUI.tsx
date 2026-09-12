import React from "react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import type { Student } from "../../../types";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  User,
  GraduationCap,
  X,
} from "lucide-react";

interface StudentsUIProps {
  filteredStudents: Student[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  selectedSection: string;
  setSelectedSection: (val: string) => void;
  classes: string[];
  sections: string[];
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  showDetail: Student | null;
  setShowDetail: (val: Student | null) => void;
  editingStudent: Student | null;
  formData: Partial<Student>;
  setFormData: (val: Partial<Student>) => void;
  handleSave: () => void;
  handleDelete: (id: string) => void;
  handleOpenAddModal: () => void;
  handleOpenEditModal: (student: Student) => void;
}

export function StudentsUI({
  filteredStudents,
  searchQuery,
  setSearchQuery,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  classes,
  sections,
  showModal,
  setShowModal,
  showDetail,
  setShowDetail,
  editingStudent,
  formData,
  setFormData,
  handleSave,
  handleDelete,
  handleOpenAddModal,
  handleOpenEditModal,
}: StudentsUIProps) {
  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

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
          <Button onClick={handleOpenAddModal}>
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
                <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(student)} className="flex-1">
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

export default StudentsUI;
