import React from "react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import type { Teacher } from "../../../types";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Users,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";

export interface TeachersUIProps {
  teachers: Teacher[];
  filteredTeachers: Teacher[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  showDetail: Teacher | null;
  setShowDetail: (t: Teacher | null) => void;
  editingTeacher: Teacher | null;
  setEditingTeacher: (t: Teacher | null) => void;
  formData: Partial<Teacher>;
  setFormData: (data: Partial<Teacher>) => void;
  importStatus: { visible: boolean; success: boolean; message: string };
  setImportStatus: (status: { visible: boolean; success: boolean; message: string }) => void;
  getInitials: (name: string) => string;
  handleSave: () => void;
  handleDelete: (id: string) => void;
  handleExportExcel: () => void;
}

export function TeachersUI({
  teachers,
  filteredTeachers,
  searchQuery,
  setSearchQuery,
  showModal,
  setShowModal,
  showDetail,
  setShowDetail,
  editingTeacher,
  setEditingTeacher,
  formData,
  setFormData,
  importStatus,
  setImportStatus,
  getInitials,
  handleSave,
  handleDelete,
  handleExportExcel,
}: TeachersUIProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Teachers Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredTeachers.length} teachers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" /> Export Excel
          </Button>
          <Button onClick={() => { setEditingTeacher(null); setFormData({}); setShowModal(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Teacher
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <Input
            placeholder="Search teachers by name, subject, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher, i) => (
          <Card key={teacher.id} className="hover-lift group" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{teacher.name}</h3>
                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">{teacher.subject}</Badge>
                  <Badge variant="secondary" className="text-xs">{teacher.department}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  <span>{teacher.experience} experience</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Award className="h-3 w-3" />
                  <span>{teacher.qualification}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setShowDetail(teacher)} className="flex-1">
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditingTeacher(teacher); setFormData(teacher); setShowModal(true); }} className="flex-1">
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(teacher.id)} className="hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No teachers found</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Teacher name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <Input value={formData.subject || ""} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Subject" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input value={formData.department || ""} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Department" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qualification</label>
                  <Input value={formData.qualification || ""} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} placeholder="Qualification" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience</label>
                  <Input value={formData.experience || ""} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} placeholder="e.g. 5 years" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salary</label>
                  <Input type="number" value={formData.salary || ""} onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })} placeholder="Monthly salary" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingTeacher ? "Update" : "Add"} Teacher</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetail(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Teacher Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetail(null)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar size="xl"><AvatarFallback>{getInitials(showDetail.name)}</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-xl font-bold">{showDetail.name}</h3>
                  <Badge>{showDetail.subject}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Email", value: showDetail.email },
                  { icon: Phone, label: "Phone", value: showDetail.phone },
                  { icon: Briefcase, label: "Experience", value: showDetail.experience },
                  { icon: Award, label: "Qualification", value: showDetail.qualification },
                  { icon: MapPin, label: "Address", value: showDetail.address },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Status Toast */}
      {importStatus.visible && (
        <div
          className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg flex gap-3 items-start animate-slide-up ${importStatus.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
        >
          {importStatus.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${importStatus.success ? "text-green-900" : "text-red-900"}`}>
              {importStatus.message}
            </p>
          </div>
          <button
            onClick={() => setImportStatus({ ...importStatus, visible: false })}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
