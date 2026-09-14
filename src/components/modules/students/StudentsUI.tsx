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
} from "lucide-react";


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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFieldErrors({});
  }, [showModal]);

  useEffect(() => {
    setFieldErrors((prev) => ({ ...prev, ['email']: error }));
  }, [error]);



  const validateField = (name: string, value: string) => {
    let err = "";
    if (name === "name") {
      if (!value.trim()) err = "Full Name is required";
    } else if (name === "email") {
      if (!value.trim()) {
        err = "Email Address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
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
    if (!email) {
      errors.email = "Email Address is required";
    } else {
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
            <Button onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Student
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, roll number, email, or guardian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={selectedSection}
                disabled={!selectedClass || selectedClass === "all"}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
              >
                <option value="all">All Sections</option>
                {classes.find((c) => c.id === selectedClass)?.divisions?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
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
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class / Division</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Guardian</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="py-3 px-4 font-medium text-xs">
                          <span className="font-mono">
                            {student.roll_no || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground">{student.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {student.gender || "Student"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {(student.class_name || student.division_name) ? (
                            <Badge variant="secondary" className="font-semibold text-xs">
                              {student.class_name || ""}{student.division_name ? `-${student.division_name}` : ""}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unassigned</span>
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
                          {!student.email && !student.phone && (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {student.parent_name || student.guardian_name ? (
                            <div>
                              <div className="font-medium text-foreground">
                                {student.parent_name || student.guardian_name}
                              </div>
                              {(student.parent_phone || student.guardian_phone) && (
                                <div className="text-muted-foreground text-[11px]">
                                  {student.parent_phone || student.guardian_phone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
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
                              onClick={() => handleDelete(student.id)}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-card border border-border/80 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col transition-all relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Loading Overlay */}

              {/* Header with Live Preview */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-gradient-to-r from-muted/30 via-background to-muted/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/20 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                      {getInitials(formData.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      {editingStudent ? "Edit Student Profile" : "Enroll New Student"}
                      {formData.name && (
                        <span className="text-xs font-normal text-muted-foreground truncate max-w-[140px]">
                          — {formData.name}
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      {editingStudent
                        ? "Modify academic or personal attributes"
                        : "Enter student info, assign class and guardian"}
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
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
                {/* Section 1: Basic Profile */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Basic Information
                    </h4>
                    <span className="text-[10px] text-muted-foreground">* Required fields</span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Enter Full Name"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Email Address <span className="text-destructive">*</span>
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
                    {/* <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      Phone Number
                    </label>
                    <Input
                      placeholder="Enter Phone Number"
                      value={formData.phone || ""}
                      onInput={(e) => validateField("phone", (e.target as HTMLInputElement).value)}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
                      }}
                      maxLength={10}
                      icon={<Phone className="h-4 w-4 text-muted-foreground" />}
                      className={fieldErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-destructive mt-1 font-medium">{fieldErrors.phone}</p>
                    )}
                  </div> */}
                  </div>
                </div>

                {/* Section 2: Class & Academic Assignment */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" /> Academic Assignment
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        Division <span className="text-destructive">*</span>
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
                    {/* <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      Roll Number
                    </label>
                    <Input
                      placeholder="Enter Roll Number"
                      value={formData.rollNumber || formData.roll_no || ""}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value, roll_no: e.target.value })}
                      maxLength={5}
                    />
                  </div> */}
                  </div>
                </div>

                {/* Section 3: Guardian Details */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> Parent / Guardian Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Guardian Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Enter Guardian Name"
                        value={formData.parentName || formData.parent_name || formData.guardian_name || ""}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value, parent_name: e.target.value, guardian_name: e.target.value })}
                        icon={<User className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Guardian Phone <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Enter Guardian Phone Number"
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
                  </div>
                </div>

                {/* Section 4: Personal Attributes */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Personal Attributes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Blood Group
                      </label>
                      <Input
                        placeholder="Enter Blood Group"
                        value={formData.bloodGroup || formData.blood_group || ""}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value, blood_group: e.target.value })}
                        icon={<Heart className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      Residential Address
                    </label>
                    <Input
                      placeholder="Residential address details"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                <div className="text-[11px] text-muted-foreground">
                  {!formData.name || !formData.email ? (
                    <span className="text-amber-500 font-medium">* Fill required fields to save</span>
                  ) : (
                    <span className="text-emerald-500 font-medium">✓ Ready to save</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl px-5 text-xs font-semibold"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-xl px-6 text-xs font-semibold flex items-center gap-2"
                    disabled={
                      loading ||
                      !formData.name ||
                      !formData.email ||
                      (!formData.class_id && !formData.division_master_id) ||
                      (!formData.parent_phone && !formData.guardian_phone) ||
                      (!formData.parent_name && !formData.guardian_name)
                    }
                    onClick={validateAndSave}
                  >
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
              <div className="p-6 space-y-3.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                  </span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {showDetail.email || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number
                  </span>
                  <span className="font-semibold text-foreground">
                    {showDetail.phone || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" /> Guardian
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {showDetail.parent_name || showDetail.guardian_name || showDetail.parentName || "N/A"}
                    {(showDetail.parent_phone || showDetail.guardian_phone || showDetail.parentPhone) && (
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        {showDetail.parent_phone || showDetail.guardian_phone || showDetail.parentPhone}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Date of Birth
                  </span>
                  <span className="font-semibold text-foreground">
                    {showDetail.dob || showDetail.dateOfBirth || "N/A"}
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
      </div>
    </>
  );
}

export default StudentsUI;

