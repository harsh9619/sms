import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import { Loader } from "../../ui/Loader";
import type { TeachersUIProps } from "../../../saga/teachers/types";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  User,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Award,
  Download,
  MapPin,
  IndianRupee,
} from "lucide-react";

export function TeachersUI({
  teachers,
  meta,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  page,
  setPage,
  limit,
  showModal,
  setShowModal,
  showDetail,
  setShowDetail,
  editingTeacher,
  formData,
  setFormData,
  getInitials,
  handleSave,
  handleDelete,
  handleOpenAddModal,
  handleOpenEditModal,
  handleExportExcel,
}: TeachersUIProps) {
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFieldErrors({});
  }, [showModal]);

  useEffect(() => {
    if (error?.email) {
      setFieldErrors((prev) => ({ ...prev, email: error.email }));
    }
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
      if (value.trim() && !/^[6-9]\d{9}$/.test(value.trim())) {
        err = "Phone must be a valid 10-digit number starting with 6-9";
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    const phone = formData.phone?.trim();
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      errors.phone = "Phone must be a valid 10-digit number starting with 6-9";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      handleSave();
    }
  };

  const totalPages = meta?.totalPages || 1;
  const totalTeachers = meta?.total !== undefined ? meta.total : teachers.length;

  return (
    <>
      <Loader loading={loading} />

      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              Teachers Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalTeachers} {totalTeachers === 1 ? "teacher" : "teachers"} registered
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
            <Button onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Teacher
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search teachers by name, subject, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Teacher Table View */}
        {teachers.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No teachers found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      <th className="py-3.5 px-4">Teacher Name</th>
                      <th className="py-3.5 px-4">Contact Info</th>
                      <th className="py-3.5 px-4">Subject / Dept</th>
                      <th className="py-3.5 px-4">Qualification</th>
                      <th className="py-3.5 px-4">Experience</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {teachers.map((teacher) => (
                      <tr
                        key={teacher.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground">{teacher.name}</div>
                              {teacher.department && (
                                <div className="text-xs text-muted-foreground">
                                  {teacher.department}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[180px]">{teacher.email}</span>
                          </div>
                          {teacher.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span>{teacher.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {teacher.subject ? (
                              <Badge variant="default" className="text-xs font-medium">
                                {teacher.subject}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-xs font-medium text-foreground">
                          {teacher.qualification ? (
                            <div className="flex items-center gap-1.5">
                              <Award className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>{teacher.qualification}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-xs font-medium text-foreground">
                          {teacher.experience ? (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{teacher.experience}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              title="View Details"
                              onClick={() => setShowDetail(teacher)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted"
                              title="Edit Teacher"
                              onClick={() => handleOpenEditModal(teacher)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              title="Delete Teacher"
                              onClick={() => handleDelete(teacher.id)}
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
                Showing <span className="font-semibold">{Math.min((page - 1) * limit + 1, totalTeachers)}</span> to{" "}
                <span className="font-semibold">{Math.min(page * limit, totalTeachers)}</span> of{" "}
                <span className="font-semibold">{totalTeachers}</span> teachers
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
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-gradient-to-r from-muted/30 via-background to-muted/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/20 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                      {getInitials(formData.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      {editingTeacher ? "Edit Teacher Profile" : "Add New Teacher"}
                      {formData.name && (
                        <span className="text-xs font-normal text-muted-foreground truncate max-w-[140px]">
                          — {formData.name}
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      {editingTeacher
                        ? "Modify professional or personal attributes"
                        : "Enter teacher details and subject assignment"}
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
                {/* Section 1: Basic Information */}
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
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Phone Number
                      </label>
                      <Input
                        placeholder="Enter Phone Number"
                        value={formData.phone || ""}
                        onInput={(e) => validateField("phone", (e.target as HTMLInputElement).value)}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (value.length > 0) {
                            if (!/^[6-9]/.test(value) || /[^0-9]/.test(value)) {
                              value = value.slice(0, -1);
                            }
                          }
                          setFormData({ ...formData, phone: value });
                          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
                        }}
                        maxLength={10}
                        icon={<Phone className="h-4 w-4 text-muted-foreground" />}
                        className={fieldErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {fieldErrors.phone && (
                        <p className="text-[11px] text-destructive mt-1 font-medium">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Professional Details */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" /> Professional Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Subject
                      </label>
                      <Input
                        placeholder="e.g. Mathematics"
                        value={formData.subject || ""}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        icon={<Award className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Department
                      </label>
                      <Input
                        placeholder="e.g. Science"
                        value={formData.department || ""}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Qualification
                      </label>
                      <Input
                        placeholder="e.g. M.Sc, B.Ed"
                        value={formData.qualification || ""}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Experience
                      </label>
                      <Input
                        placeholder="e.g. 5 years"
                        value={formData.experience || ""}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      Monthly Salary (₹)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 45000"
                      value={formData.salary || ""}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      icon={<IndianRupee className="h-4 w-4 text-muted-foreground" />}
                    />
                  </div>
                </div>

                {/* Section 3: Address Details */}
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Residential Address
                  </h4>
                  <div>
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
                    className="rounded-xl px-6 text-xs font-semibold"
                    disabled={loading || !formData.name || !formData.email}
                    onClick={validateAndSave}
                  >
                    {editingTeacher ? "Update Teacher" : "Save Teacher"}
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
              {/* Top Cover Banner */}
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
                        {showDetail.subject && (
                          <Badge variant="default" className="text-[11px]">
                            {showDetail.subject}
                          </Badge>
                        )}
                        {showDetail.department && (
                          <Badge variant="secondary" className="text-[11px]">
                            {showDetail.department}
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
                    <Briefcase className="h-3.5 w-3.5 text-primary" /> Experience
                  </span>
                  <span className="font-semibold text-foreground">
                    {showDetail.experience || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-primary" /> Qualification
                  </span>
                  <span className="font-semibold text-foreground">
                    {showDetail.qualification || "N/A"}
                  </span>
                </div>

                {showDetail.salary && (
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <IndianRupee className="h-3.5 w-3.5 text-primary" /> Monthly Salary
                    </span>
                    <span className="font-semibold text-foreground">
                      ₹{showDetail.salary.toLocaleString()}
                    </span>
                  </div>
                )}

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

export default TeachersUI;
