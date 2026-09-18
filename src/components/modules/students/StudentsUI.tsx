import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import { Loader } from "../../ui/Loader";
import type { StudentsUIProps } from "../../../saga/students/types";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  Heart,
  Upload,
  Filter,
  RefreshCw,
  Download,
  Shield,
  Image as ImageIcon,
  FileSpreadsheet,
} from "lucide-react";
import { BulkUploadModal } from "../../ui/BulkUploadModal";
import { OcrBulkUploadModal } from "../../ui/OcrBulkUploadModal";
import { OcrCsvUploadModal } from "../../ui/OcrCsvUploadModal";
import studentService from "../../../Services/student.service";


export function StudentsUI({
  students,
  meta,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  page,
  setPage,
  limit,
  setLimit,
  classes,
  castes = [],
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
  handleExportExcel,
  handleRefresh,
}: StudentsUIProps) {
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [showOcrCsvModal, setShowOcrCsvModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);

  useEffect(() => {
    setFieldErrors({});
  }, [showModal]);

  useEffect(() => {
    if (error) {
      const errorMsg = typeof error === "object" ? (error.message || JSON.stringify(error)) : String(error);
      setFieldErrors((prev) => ({ ...prev, email: errorMsg }));
    }
  }, [error]);



  const validateField = (name: string, value: string) => {
    let err = "";
    if (name === "name") {
      if (!value.trim()) err = "Full Name is required";
    } else if (name === "email") {
      if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        err = "Please enter a valid email address";
      }
    } else if (name === "phone") {
      if (value.trim() && !/^[0-9+\-\s()]{7,15}$/.test(value.trim())) {
        err = "Please enter a valid phone number";
      }
    } else if (name === "parentPhone") {
      if (value.trim() && !/^[6-9]\d{9}$/.test(value.trim())) {
        err = "Guardian Phone must be a valid 10-digit number starting with 6-9";
      }
    }

    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateAndSave = () => {
    const errors: { [key: string]: string } = {};

    const name = formData.name?.trim();
    if (!name) {
      errors.name = "Full Name is required";
    }

    const email = formData.email?.trim();
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    const gPhone = (formData.guardian_phone || formData.parentPhone || "")?.trim();
    if (gPhone && !/^[6-9]\d{9}$/.test(gPhone)) {
      errors.parentPhone = "Guardian Phone must be a valid 10-digit number starting with 6-9";
    }

    const classId = (formData.class_id || "");
    if (!classId) {
      errors.class_id = "Class is required";
    }

    const divisionId = (formData.division_master_id || "");
    if (!divisionId) {
      errors.division_master_id = "Division is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      handleSave();
    }
  };

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "ST";

  const totalPages = meta?.totalPages || 1;
  const totalStudents = meta?.total !== undefined ? meta.total : students.length;

  return (
    <>
      <Loader loading={loading} />

      <div className="space-y-6 animate-fade-in">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-primary" />
              Students Directory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalStudents} {totalStudents === 1 ? "student" : "students"} enrolled
            </p>
          </div>
          <div className="flex gap-2">
            {handleExportExcel && (
              <Button
                variant="outline"
                className="rounded-xl border-border hover:bg-muted shadow-sm text-xs font-semibold"
                onClick={handleExportExcel}
              >
                <Download className="h-4 w-4 mr-2 text-primary" /> Export Excel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowBulkModal(true)}
            >
              <Upload className="h-4 w-4 mr-2 text-primary" /> Bulk Upload from Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowOcrModal(true)}
              className="rounded-xl border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 font-semibold shadow-sm"
            >
              <ImageIcon className="h-4 w-4 mr-2 text-violet-500" /> Upload from Image
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowOcrCsvModal(true)}
              className="rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-500" /> OCR to CSV
            </Button>
            <Button onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Student
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Box */}
              <div className="flex-1 relative">
                <Input
                  placeholder="Search by student name, roll no, email, or guardian contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="h-4 w-4 text-muted-foreground" />}
                  className="w-full pl-9 pr-9 h-10 rounded-xl border-border bg-background/50 focus:bg-background transition-all text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Class & Division Filters */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-border bg-background/50 text-xs font-semibold text-muted-foreground">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  <span>Filters</span>
                </div> */}

                {/* Class Select */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="all">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* Section Select */}
                <select
                  value={selectedSection}
                  disabled={!selectedClass || selectedClass === "all"}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="all">All Sections</option>
                  {classes.find((c) => c.id === selectedClass)?.divisions?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                {/* Clear Filters Button */}
                {/* {(searchQuery || selectedClass !== "all" || selectedSection !== "all") && ( */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!(searchQuery || selectedClass !== "all" || selectedSection !== "all")}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedClass("all");
                    setSelectedSection("all");
                  }}
                  className="h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Reset all filters"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </Button>
                {/* )} */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {students.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No students found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or class filters.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Table View */}
            <Card className="overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      <th className="py-3 px-4">Admission No.</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Class </th>
                      <th className="py-3 px-4">Div</th>
                      {/* <th className="py-3 px-4">Roll No</th> */}
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Guardian</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="py-3 px-4 font-semibold ">
                          <span className="font-mono">
                            {student.registration_no || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">

                            <div className="font-semibold text-foreground">{student.name}</div>

                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {student.class_name ? (
                            <span className="font-semibold text-xs">
                              {student.class_name || ""}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {student.division_name ? (
                            <span className="font-semibold text-xs">
                              {student.division_name ? `${student.division_name}` : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unassigned</span>
                          )}
                        </td>

                        {/* <td className="py-3 px-4 font-semibold text-xs capitalize">
                          {student.roll_no}
                        </td> */}

                        <td className="py-3 px-4 font-semibold text-xs capitalize">
                          {student.gender || "male"}
                        </td>

                        <td className="py-3 px-4 text-xs">
                          {student.parent_name || student.guardian_name ? (
                            <div className="font-medium text-foreground">
                              {student.parent_name || student.guardian_name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-xs space-y-0.5">
                          {student.email && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[160px]">{student.email}</span>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                          {(student.parent_phone || student.guardian_phone) && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3 w-3 shrink-0 text-primary" />
                              <span>{student.parent_phone || student.guardian_phone}</span>
                            </div>
                          )}
                          {!student.email && !student.phone && !(student.parent_phone || student.guardian_phone) && (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Profile"
                              onClick={() => setShowDetail(student)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Student"
                              onClick={() => handleOpenEditModal(student)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete Student"
                              onClick={() => setStudentToDelete(student)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>


            {/* Pagination Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold">{Math.min((page - 1) * limit + 1, totalStudents)}</span> to{" "}
                <span className="font-semibold">{Math.min(page * limit, totalStudents)}</span> of{" "}
                <span className="font-semibold">{totalStudents}</span> students
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                          <Button
                            variant={page === p ? "default" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0 text-xs"
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 animate-fade-in"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-card border border-border/80 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col transition-all relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Live Preview */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-border/70 bg-gradient-to-r from-primary/10 via-background to-primary/5">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-md">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-base">
                      {getInitials(formData.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      {editingStudent ? "Edit Student Profile" : "Enroll New Student"}
                      {formData.name && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-[160px]">
                          {formData.name}
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      {editingStudent
                        ? "Update student academic, personal, parent, and caste attributes"
                        : "Enter student admission details, assign class, caste category, and guardian info"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 hover:bg-muted"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
                {/* Section 1: Academic & Admission Information */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" /> Academic & Admission Details
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-medium">* Required fields</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Registration No.
                      </label>
                      <Input
                        placeholder="e.g. REG-2024-001"
                        value={formData.registration_no || ""}
                        onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Academic Year
                      </label>
                      <Input
                        placeholder="e.g. 2024-2025"
                        value={formData.academic_year || ""}
                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Admission Date
                      </label>
                      <Input
                        type="date"
                        value={formData.admissionDate || formData.admission_date || ""}
                        onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value, admission_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Select Class <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={formData.class_id || classes.find(c => c.name === formData.class || c.name === formData.class_name)?.id || ""}
                        onChange={(e) => {
                          const selectedCls = classes.find(c => String(c.id) === e.target.value);
                          setFormData({
                            ...formData,
                            class_id: e.target.value ? Number(e.target.value) : null,
                            class: selectedCls ? selectedCls.name : "",
                            class_name: selectedCls ? selectedCls.name : "",
                            section: "",
                            division_master_id: null,
                          });
                        }}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition"
                      >
                        <option value="">Select Class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Division / Section <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={formData.division_master_id || classes.find(c => String(c.id) === String(formData.class_id) || c.name === formData.class || c.name === formData.class_name)?.divisions?.find(d => d.name === formData.section)?.id || ""}
                        disabled={!formData.class_id && !formData.class && !formData.class_name}
                        onChange={(e) => {
                          const currentClsId = formData.class_id || classes.find(c => c.name === formData.class || c.name === formData.class_name)?.id;
                          const currentCls = classes.find(c => String(c.id) === String(currentClsId));
                          const selectedDiv = currentCls?.divisions?.find(d => String(d.id) === e.target.value);
                          setFormData({
                            ...formData,
                            division_master_id: e.target.value ? Number(e.target.value) : null,
                            section: selectedDiv ? selectedDiv.name : "",
                          });
                        }}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition disabled:opacity-50"
                      >
                        <option value="">Select Division</option>
                        {(classes.find(c => String(c.id) === String(formData.class_id) || c.name === formData.class || c.name === formData.class_name)?.divisions || []).map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Student Basic Information */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Student Personal Details
                    </h4>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      Full Name of Student <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Enter Student Full Name"
                      value={formData.name || ""}
                      onInput={(e) => validateField("name", (e.target as HTMLInputElement).value)}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                      }}
                      icon={<User className="h-4 w-4 text-muted-foreground" />}
                      className={fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] text-destructive mt-1 font-medium">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="Enter Email Address"
                        value={formData.email || ""}
                        onInput={(e) => validateField("email", (e.target as HTMLInputElement).value)}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                        }}
                        icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                        className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {fieldErrors.email && (
                        <p className="text-[11px] text-destructive mt-1 font-medium">{fieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Date of Birth
                      </label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth || formData.dob || ""}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value, dob: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Gender
                      </label>
                      <select
                        value={formData.gender || "male"}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Aadhar No.
                      </label>
                      <Input
                        placeholder="12-digit Aadhar Number"
                        value={formData.aadhar_no || ""}
                        onChange={(e) => setFormData({ ...formData, aadhar_no: e.target.value })}
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Blood Group
                      </label>
                      <Input
                        placeholder="e.g. O+, A+, B+"
                        value={formData.bloodGroup || formData.blood_group || ""}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value, blood_group: e.target.value })}
                        icon={<Heart className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Caste & Category Details */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" /> Caste & Category Info
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Caste Category
                      </label>
                      <select
                        value={formData.caste_master_id || ""}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          const selectedCaste = castes.find((c: any) => c.id === val);
                          setFormData({
                            ...formData,
                            caste_master_id: val,
                            caste_name: selectedCaste?.name || "",
                            caste_code: selectedCaste?.code || "",
                            caste_category: selectedCaste?.name || formData.caste_category || "",
                          });
                        }}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition"
                      >
                        <option value="">Select Caste Category</option>
                        {castes.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Sub-caste / Detail (Specify Caste)
                      </label>
                      <Input
                        placeholder="e.g. Brahmin, Yadav, Kurmi, etc."
                        value={formData.caste_category || ""}
                        onChange={(e) => setFormData({ ...formData, caste_category: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Parent & Guardian Information */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Parent & Guardian Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Father's Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Enter Father's Name"
                        value={formData.father_name || formData.parentName || formData.parent_name || formData.guardian_name || ""}
                        onChange={(e) => setFormData({ ...formData, father_name: e.target.value, parentName: e.target.value, parent_name: e.target.value, guardian_name: e.target.value })}
                        icon={<User className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Father's Occupation & Qualification
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Occupation"
                          value={formData.father_occupation || ""}
                          onChange={(e) => setFormData({ ...formData, father_occupation: e.target.value })}
                        />
                        <Input
                          placeholder="Qualification"
                          value={formData.father_qualification || ""}
                          onChange={(e) => setFormData({ ...formData, father_qualification: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Mother's Name
                      </label>
                      <Input
                        placeholder="Enter Mother's Name"
                        value={formData.mother_name || ""}
                        onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                        icon={<User className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Mother's Occupation & Qualification
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Occupation"
                          value={formData.mother_occupation || ""}
                          onChange={(e) => setFormData({ ...formData, mother_occupation: e.target.value })}
                        />
                        <Input
                          placeholder="Qualification"
                          value={formData.mother_qualification || ""}
                          onChange={(e) => setFormData({ ...formData, mother_qualification: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Primary Mobile No. <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="10-digit Mobile Number"
                        value={formData.parentPhone || formData.parent_phone || formData.guardian_phone || ""}
                        onInput={(e) => validateField("parentPhone", (e.target as HTMLInputElement).value)}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (value.length > 0) {
                            if (!/^[6-9]/.test(value) || /[^0-9]/.test(value)) {
                              value = value.slice(0, -1);
                            }
                          }
                          setFormData({ ...formData, parentPhone: value, parent_phone: value, guardian_phone: value });
                          if (fieldErrors.parentPhone) setFieldErrors({ ...fieldErrors, parentPhone: "" });
                        }}
                        icon={<Phone className="h-4 w-4 text-muted-foreground" />}
                        className={fieldErrors.parentPhone ? "border-destructive focus-visible:ring-destructive" : ""}
                        maxLength={10}
                      />
                      {fieldErrors.parentPhone && (
                        <p className="text-[11px] text-destructive mt-1 font-medium">{fieldErrors.parentPhone}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Whatsapp No.
                      </label>
                      <Input
                        placeholder="Whatsapp Number"
                        value={formData.whatsapp_no || ""}
                        onChange={(e) => setFormData({ ...formData, whatsapp_no: e.target.value })}
                        icon={<Phone className="h-4 w-4 text-muted-foreground" />}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Correspondence Address */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4.5 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                    <MapPin className="h-4 w-4 text-primary" /> Correspondence Address
                  </h4>
                  <div>
                    <Input
                      placeholder="Full correspondence address details (House No, Street, Landmark, City)"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/80 bg-muted/20">
                <div className="text-[11px] text-muted-foreground">
                  {!formData.name ? (
                    <span className="text-amber-500 font-semibold">* Enter student name to save</span>
                  ) : (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      ✓ Ready to {editingStudent ? "update" : "save"} profile
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl px-5 text-xs font-semibold hover:bg-muted/50"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-xl px-6 text-xs font-semibold shadow-md flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={
                      loading ||
                      !formData.name ||
                      (!formData.class_id && !formData.division_master_id) ||
                      (!formData.parent_phone && !formData.guardian_phone && !formData.parentPhone) ||
                      (!formData.parent_name && !formData.guardian_name && !formData.father_name)
                    }
                    onClick={validateAndSave}
                  >
                    {loading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <GraduationCap className="h-3.5 w-3.5" />
                    )}
                    {editingStudent ? "Update Student" : "Save Student"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Detail Modal */}
        {showDetail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
            onClick={() => setShowDetail(null)}
          >
            <div
              className="bg-card border border-border/80 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Cover Banner & Profile Header */}
              <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-indigo-500/10 pt-6 px-6 pb-4 border-b border-border/60">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-4 ring-background shadow-md">
                      <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                        {getInitials(showDetail.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{showDetail.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-mono text-[11px] bg-background">
                          Roll: {showDetail.roll_no || showDetail.rollNumber || "N/A"}
                        </Badge>
                        {(showDetail.class_name || showDetail.class) && (
                          <Badge variant="secondary" className="text-[11px]">
                            Class {showDetail.class_name || showDetail.class}{showDetail.section ? `-${showDetail.section}` : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 hover:bg-background/80"
                    onClick={() => setShowDetail(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Information Grid */}
              <div className="p-6 space-y-3.5 text-xs text-muted-foreground max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                  </span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {showDetail.email || "N/A"}
                  </span>
                </div>

                {showDetail.registration_no && (
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" /> Adm. No
                    </span>
                    <span className="font-semibold text-foreground">
                      {showDetail.registration_no}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-primary" /> Caste / Sub Caste
                  </span>
                  <span className="font-semibold text-foreground">
                    {showDetail.caste_code || showDetail.caste_name || "N/A"}  {showDetail.caste_category ? `/ ${showDetail.caste_category}` : ""}
                  </span>
                </div>

                {showDetail.aadhar_no && (
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-primary" /> Aadhar No.
                    </span>
                    <span className="font-semibold text-foreground">
                      {showDetail.aadhar_no}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" /> Father's Name
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {showDetail.father_name || showDetail.guardian_name || showDetail.parent_name || "N/A"}
                    {showDetail.father_occupation && (
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        {showDetail.father_occupation} {showDetail.father_qualification ? `(${showDetail.father_qualification})` : ""}
                      </span>
                    )}
                  </span>
                </div>

                {showDetail.mother_name && (
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" /> Mother's Name
                    </span>
                    <span className="font-semibold text-foreground text-right">
                      {showDetail.mother_name}
                      {showDetail.mother_occupation && (
                        <span className="block text-[11px] font-normal text-muted-foreground">
                          {showDetail.mother_occupation}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary" /> Phone / Whatsapp
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {showDetail.parent_phone || showDetail.guardian_phone || showDetail.phone || "N/A"}
                    {showDetail.whatsapp_no && (
                      <span className="block text-[11px] font-normal text-emerald-500">
                        WA: {showDetail.whatsapp_no}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Admission Date / DOB
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {showDetail.admission_date || showDetail.admissionDate || "N/A"}
                    {(showDetail.dob || showDetail.dateOfBirth) && (
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        DOB: {showDetail.dob || showDetail.dateOfBirth}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-primary" /> Blood Group
                  </span>
                  <span className="font-semibold text-foreground">
                    {showDetail.blood_group || showDetail.bloodGroup || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Address
                  </span>
                  <span className="font-semibold text-foreground text-right max-w-[200px] truncate">
                    {showDetail.address || "N/A"}
                  </span>
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-4 bg-muted/20 border-t border-border flex justify-end">
                <Button
                  variant="outline"
                  className="rounded-xl px-5 text-xs font-semibold"
                  onClick={() => setShowDetail(null)}
                >
                  Close Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        <BulkUploadModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          title="Bulk Import Students"
          templateHeaders={[
            "registration_no",
            "academic_year",
            "admission_date",
            "name",
            "email",
            "class",
            "division",
            "caste_category",
            "sub_caste",
            "father_name",
            "father_occupation",
            "father_qualification",
            "mother_name",
            "mother_occupation",
            "mother_qualification",
            "parentPhone",
            "whatsapp_no",
            "dateOfBirth",
            "gender",
            "aadhar_no",
            "bloodGroup",
            "address",
          ]}
          sampleRows={{}}
          onUpload={async (data) => {
            return studentService.bulkCreateStudents(data);
          }}
          onSuccess={() => {
            if (handleRefresh) {
              handleRefresh();
            }
          }}
        />

        {/* OCR Image Bulk Upload Modal */}
        <OcrBulkUploadModal
          isOpen={showOcrModal}
          onClose={() => setShowOcrModal(false)}
          title="Upload Students from Image (OCR)"
          templateHeaders={[
            "registration_no",
            "academic_year",
            "admission_date",
            "name",
            "email",
            "class",
            "division",
            "caste_category",
            "father_name",
            "parentPhone",
            "gender",
            "address",
          ]}
          onUpload={async (data) => {
            return studentService.bulkCreateStudents(data);
          }}
          onSuccess={() => {
            if (handleRefresh) {
              handleRefresh();
            }
          }}
        />

        {/* OCR to CSV Modal */}
        <OcrCsvUploadModal
          isOpen={showOcrCsvModal}
          onClose={() => setShowOcrCsvModal(false)}
          title="OCR Register to CSV Converter"
          onUpload={async (data) => {
            return studentService.bulkCreateStudents(data);
          }}
          onSuccess={() => {
            if (handleRefresh) {
              handleRefresh();
            }
          }}
        />

        {/* Delete Student Confirmation Modal */}
        {studentToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setStudentToDelete(null)}
          >
            <div
              className="bg-card text-card-foreground border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" /> Delete Student
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setStudentToDelete(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="py-2 text-sm text-muted-foreground space-y-2">
                <p>
                  Are you sure you want to delete student{" "}
                  <strong className="text-foreground font-semibold">{studentToDelete.name}</strong>?
                </p>
                <p className="text-xs text-muted-foreground/80">
                  This action cannot be undone. The student record will be removed.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setStudentToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(studentToDelete.id);
                    setStudentToDelete(null);
                  }}
                >
                  Delete Student
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default StudentsUI;

