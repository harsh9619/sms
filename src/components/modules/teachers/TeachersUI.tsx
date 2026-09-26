import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import { Loader } from "../../ui/Loader";
import type { TeachersUIProps, RoleMaster } from "../../../saga/teachers/types";
import type { Teacher } from "../../../types";
import { capitalizeFirstLetter } from "../../../lib/utils";
import {
  TEACHER_CREATION_ROLES
} from "../../../constants/common"
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
  Camera,
  AlertTriangle,
  Upload,
  LayoutGrid,
  List,
  Filter,
  RefreshCw,
} from "lucide-react";
import { BulkUploadModal } from "../../ui/BulkUploadModal";
import teacherService from "../../../Services/teacher.service";

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
  handleRefresh,
}: TeachersUIProps) {
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const getImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBaseUrl}${cleanPath}`;
  };

  const [masterRoles, setMasterRoles] = useState<RoleMaster[]>([]);

  console.log("masterRoles", masterRoles);

  useEffect(() => {
    teacherService.getRoles().then((res) => {
      if (res && Array.isArray(res)) {
        setMasterRoles(res);
      }
    }).catch(() => { });
  }, []);

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
    if (name === "name" && !value.trim()) {
      err = "Name is required";
    } else if (name === "email") {
      if (!value.trim()) {
        err = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        err = "Invalid email format";
      }
    } else if (name === "phone" && value.trim()) {
      if (!/^[6-9]\d{9}$/.test(value.trim())) {
        err = "Enter valid 10-digit mobile number starting with 6-9";
      }
    }
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleFormSubmit = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Invalid email format";
    }
    if (formData.phone?.trim() && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errors.phone = "Enter valid 10-digit mobile number starting with 6-9";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      handleSave();
    }
  };

  const totalPages = meta?.totalPages || 1;
  const totalTeachers = meta?.total !== undefined ? meta.total : teachers.length;
  const activeTeachersCount = teachers.filter((t) => t.status !== false).length;
  const inactiveTeachersCount = teachers.filter((t) => t.status === false).length;

  const filteredTeachers = teachers.filter((t: any) => {
    if (statusFilter === "active" && t.status === false) return false;
    if (statusFilter === "inactive" && t.status !== false) return false;
    if (roleFilter !== "all") {
      const teacherRoleId = String(t.roleId || t.role_id || "");
      const teacherRoleName = (t.roleName || t.role || "").toLowerCase();
      const target = roleFilter.toLowerCase();
      if (teacherRoleId !== roleFilter && teacherRoleName !== target) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      <Loader loading={loading} />

      <div className="space-y-6 animate-fade-in pb-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 rounded-3xl border border-primary/15 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Users className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Teachers Directory
                </h1>
                <p className="text-xs text-muted-foreground">
                  Manage faculty profiles, contact records, and quick actions.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-border hover:bg-muted shadow-sm text-xs font-semibold"
              onClick={() => setShowBulkModal(true)}
            >
              <Upload className="h-4 w-4 mr-2 text-primary" /> Bulk Upload
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-border hover:bg-muted shadow-sm text-xs font-semibold"
              onClick={handleExportExcel}
            >
              <Download className="h-4 w-4 mr-2 text-primary" /> Export Excel
            </Button>
            <Button
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-xs font-semibold"
              onClick={handleOpenAddModal}
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Teacher
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Teachers</p>
                <h3 className="text-xl font-bold text-foreground">{totalTeachers}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active Staff</p>
                <h3 className="text-xl font-bold text-foreground">{activeTeachersCount}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Inactive Staff</p>
                <h3 className="text-xl font-bold text-foreground">{inactiveTeachersCount}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & View Switcher Bar */}
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="w-full md:max-w-md">
              <Input
                placeholder="Search teachers by name, phone, email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
                className="rounded-xl bg-background"
              />
            </div>

            {/* Filter Pills & View Switcher */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              {/* Role Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline-block" />
                {/* Reset Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!(searchQuery || statusFilter !== "all" || roleFilter !== "all")}
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setRoleFilter("all");
                  }}
                  className="h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Reset all filters"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </Button>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/50 border border-border/60 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  {masterRoles?.filter((r) => TEACHER_CREATION_ROLES?.includes(r?.roleName?.toUpperCase() || "")).map((r) => (
                    <option key={r.roleId} value={String(r.roleId)}>
                      {capitalizeFirstLetter(r.roleName || "")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Segmented Pill Tabs */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-muted/50 border border-border/60 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 ${statusFilter === "all"
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                  All
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                    {teachers.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 ${statusFilter === "active"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  Active
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    {activeTeachersCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 ${statusFilter === "inactive"
                    ? "bg-destructive/15 text-destructive shadow-sm ring-1 ring-destructive/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                  <span className="h-2 w-2 rounded-full bg-destructive inline-block" />
                  Inactive
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-destructive/20 text-destructive font-bold">
                    {inactiveTeachersCount}
                  </span>
                </button>
              </div>



              {/* View Switcher Toggle */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-muted/50 border border-border/60 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={`p-1.5 rounded-xl transition-all duration-200 ${viewMode === "table"
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border/80"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  title="Card View"
                  className={`p-1.5 rounded-xl transition-all duration-200 ${viewMode === "card"
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border/80"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Content Area */}
        {filteredTeachers.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-full bg-muted/60 text-muted-foreground">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No teachers found</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No teacher records match your search or status filter criteria.
              </p>
              <Button
                size="sm"
                onClick={handleOpenAddModal}
                className="mt-2 rounded-xl text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add First Teacher
              </Button>
            </div>
          </Card>
        ) : viewMode === "card" ? (
          /* Cards View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTeachers.map((teacher) => (
              <Card
                key={teacher.id}
                className="group relative overflow-hidden border border-border/70 hover:border-primary/40 hover:shadow-xl transition-all duration-300 rounded-3xl bg-card flex flex-col justify-between"
              >
                {/* Decorative Banner Background */}
                <div className="h-16 bg-gradient-to-r from-primary/15 via-primary/5 to-indigo-500/10 border-b border-border/40" />

                <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Header Avatar & Name */}
                    <div className="flex items-end justify-between -mt-8 mb-3">
                      <Avatar className="h-14 w-14 ring-4 ring-card shadow-md transition-transform group-hover:scale-105">
                        {teacher.avatar ? (
                          <img
                            src={getImageUrl(teacher.avatar)}
                            alt={teacher.name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-base">
                            {getInitials(teacher.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${teacher.status === false
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          }`}
                      >
                        {teacher.status === false ? "Inactive" : "Active"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-foreground text-base tracking-tight truncate group-hover:text-primary transition-colors" title={teacher.name}>
                        {capitalizeFirstLetter(teacher.name)}
                      </h3>
                      <p className="text-[11px] font-medium text-primary flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {capitalizeFirstLetter(teacher.roleName) || "Teacher"}
                      </p>
                    </div>

                    {/* Info Pills */}
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/40 text-muted-foreground group-hover:bg-muted/50 transition-colors">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate text-foreground/90 font-medium" title={teacher.email}>
                          {teacher.email || "No email available"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/40 text-muted-foreground group-hover:bg-muted/50 transition-colors">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-foreground/90 font-medium">
                          {teacher.phone || "No phone number"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">Actions</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                        title="View Profile Details"
                        onClick={() => setShowDetail(teacher)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:bg-muted transition-colors"
                        title="Edit Teacher"
                        onClick={() => handleOpenEditModal(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Teacher"
                        onClick={() => setTeacherToDelete(teacher)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View Mode */
          <Card className="overflow-hidden border border-border/80 rounded-3xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/70 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                    <th className="py-3.5 px-5">Teacher</th>
                    <th className="py-3.5 px-5">Contact Phone</th>
                    <th className="py-3.5 px-5">Email Address</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                            {teacher.avatar ? (
                              <img
                                src={getImageUrl(teacher.avatar)}
                                alt={teacher.name}
                                className="h-full w-full object-cover rounded-full"
                              />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {getInitials(teacher.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                              {capitalizeFirstLetter(teacher.name)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{teacher.phone || "-"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{teacher.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                          <span className="truncate max-w-[200px]">{capitalizeFirstLetter(teacher.roleName) || "-"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${teacher.status === false
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            }`}
                        >
                          {teacher.status === false ? "Inactive" : "Active"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                            title="View Details"
                            onClick={() => setShowDetail(teacher)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                            title="Edit Teacher"
                            onClick={() => handleOpenEditModal(teacher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                            title="Delete Teacher"
                            onClick={() => setTeacherToDelete(teacher)}
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
        )}

        {/* Pagination Toolbar */}
        {teachers.length > 0 && (
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
                className="rounded-xl text-xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              <div className="flex items-center gap-1 px-1">
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
                          className="h-8 w-8 p-0 text-xs rounded-lg font-semibold"
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
                className="rounded-xl text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-card border border-border/80 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {editingTeacher ? getInitials(editingTeacher.name) : <Plus className="h-5 w-5" />}
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
                <div className="bg-muted/15 border border-border/50 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Basic Information
                    </h4>
                    <span className="text-[10px] text-muted-foreground">* Required fields</span>
                  </div>

                  {/* Profile Image Upload & URL Picker */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-card border border-border/60 rounded-2xl">
                    <div className="relative group shrink-0">
                      <Avatar className="h-16 w-16 ring-2 ring-primary/20 shadow-md">
                        {formData.avatar || formData.avatar_url ? (
                          <img
                            src={getImageUrl(formData.avatar || formData.avatar_url)}
                            alt="Teacher Preview"
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                            {getInitials(formData.name || "")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md cursor-pointer hover:bg-primary/90 transition-transform group-hover:scale-110" title="Upload Photo">
                        <Camera className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({
                                  ...formData,
                                  avatar: reader.result as string,
                                  avatar_url: reader.result as string,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-medium text-foreground block">
                        Profile Avatar (Upload Image or Paste URL)
                      </label>
                      <Input
                        placeholder="Paste image URL or click camera icon to upload"
                        value={formData.avatar || formData.avatar_url || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            avatar: e.target.value,
                            avatar_url: e.target.value,
                          })
                        }
                        icon={<Camera className="h-4 w-4 text-muted-foreground" />}
                        className="text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Click the camera icon on avatar to upload photo, or paste image URL.
                      </p>
                    </div>
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
                        className={fieldErrors.email && fieldErrors.email !== '{}' ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {fieldErrors.email && fieldErrors.email !== '{}' && (
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Role
                      </label>
                      <select
                        value={formData.roleId ? String(formData.roleId) : "3"}
                        onChange={(e) => {
                          const selectedRoleId = Number(e.target.value);
                          const matched = masterRoles.find((r) => r.roleId === selectedRoleId);
                          setFormData({
                            ...formData,
                            roleId: selectedRoleId,
                            roleName: matched ? matched.roleName : "teacher",
                          });
                        }}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
                      >
                        {masterRoles.length > 0 ? (
                          masterRoles.map((r) => (
                            <option key={r.roleId} value={r.roleId}>
                              {r.label || r.roleName}
                            </option>
                          ))
                        ) : (
                          <option value="3">ID #3 - Teacher (teacher)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Account Status
                      </label>
                      <select
                        value={formData.status !== false ? "true" : "false"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Basic Information Only */}
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl text-xs"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-md"
                    disabled={loading || !formData.name || !formData.email}
                    onClick={handleFormSubmit}
                  >
                    {editingTeacher ? "Update Teacher" : "Create Teacher"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Detail Modal (Card View) */}
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
                      {showDetail.avatar ? (
                        <img
                          src={getImageUrl(showDetail.avatar)}
                          alt={showDetail.name}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                          {getInitials(showDetail.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{showDetail.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Teacher Profile</p>
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
                    <User className="h-3.5 w-3.5 text-primary" /> Status
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${showDetail.status === false
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      }`}
                  >
                    {showDetail.status === false ? "Inactive" : "Active"}
                  </Badge>
                </div>

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

                {showDetail.joinDate && (
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" /> Join Date
                    </span>
                    <span className="font-semibold text-foreground">
                      {new Date(showDetail.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
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

        {/* Delete Confirmation Modal (ClassSubjectConfig style) */}
        {teacherToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <Card className="w-full max-w-md border-destructive/30 shadow-2xl bg-card">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex flex-row items-center justify-between p-6 pb-4 border-b border-border/40">
                  <div className="flex items-center gap-2.5 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-lg font-bold text-foreground">Remove Teacher</h3>
                  </div>
                  <button
                    onClick={() => setTeacherToDelete(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  <p className="text-sm font-medium">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-foreground">
                      {teacherToDelete.name}
                    </span>
                    ?
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/40 bg-muted/20">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTeacherToDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="font-bold gap-2"
                    onClick={() => {
                      handleDelete(teacherToDelete.id);
                      setTeacherToDelete(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Confirm Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bulk Upload Modal */}
        <BulkUploadModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          title="Bulk Import Teachers"
          templateHeaders={["name", "email", "phone", "role"]}
          sampleRow={{}}
          onUpload={async (data) => {
            return teacherService.bulkCreateTeachers(data);
          }}
          onSuccess={() => {
            if (handleRefresh) {
              handleRefresh();
            }
          }}
        />
      </div>
    </>
  );
}

export default TeachersUI;
