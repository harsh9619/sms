import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Avatar, AvatarFallback } from "../../ui/Avatar";
import { DataTable, ColumnDef } from "../../ui/DataTable";
import { USER_ROLES_NOT_TABLE } from "../../../constants/common";
import { useSchool } from "../../../context/SchoolContext";
import type { User, RoleMaster } from "../../../types";
import { teacherService } from "../../../Services/teacher.service";
import type { UsersUIProps } from "./types";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  X,
  Search,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  Building2,
  Filter,
  RefreshCw,
  XCircle,
  Phone,
  Mail,
} from "lucide-react";

export function UsersUI({
  schools,
  users,
  loading,
  fetchUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
}: UsersUIProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "email" | "role" | "school">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [roles, setRoles] = useState<RoleMaster[]>([]);

  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>("all");

  // Pagination state for DataTable
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    role: "teacher",
    roleId: "",
    schoolId: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { activeSchool } = useSchool();

  useEffect(() => {
    const payload: any = {};
    const effectiveSchoolId = activeSchool?.id || (selectedSchoolFilter !== "all" ? selectedSchoolFilter : undefined);
    if (effectiveSchoolId) payload.schoolId = effectiveSchoolId;
    if (roleFilter !== "all") payload.role = roleFilter;
    if (searchQuery.trim()) payload.search = searchQuery.trim();
    payload.page = page;
    payload.limit = limit;

    fetchUsersRequest(payload);
  }, [fetchUsersRequest, activeSchool, selectedSchoolFilter, roleFilter, searchQuery, page, limit]);

  useEffect(() => {
    teacherService
      .getRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error("Failed to load roles in UsersUI:", err));
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormState({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      roleId: String(user.roleId || ""),
      schoolId: String(
        user.schoolId || user.schoolIds?.[0] || activeSchool?.id || schools[0]?.id || ""
      ),
    });
    setFormError(null);
    setShowModal(true);
  };

  const resetForm = (schoolId?: string) => {
    setFormState({
      name: "",
      email: "",
      phone: "",
      role: "teacher",
      roleId: "",
      schoolId: String(schoolId || activeSchool?.id || schools[0]?.id || ""),
    });
    setFormError(null);
    setFieldErrors({});
  };

  const toggleSort = (column: "name" | "email" | "role" | "school") => {
    if (sortBy === column) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const effectiveSchoolId = activeSchool?.id || (selectedSchoolFilter !== "all" ? selectedSchoolFilter : null);

    let visibleUsers = users;
    if (effectiveSchoolId) {
      visibleUsers = users.filter(
        (user) => user.schoolId === effectiveSchoolId || user.schoolIds?.includes(effectiveSchoolId)
      );
    } else if (selectedSchoolFilter !== "all") {
      visibleUsers = users.filter(
        (user) => user.schoolId === selectedSchoolFilter || user.schoolIds?.includes(selectedSchoolFilter)
      );
    }

    const withSchoolName = visibleUsers.map((user) => ({
      ...user,
      schoolName:
        schools.find((s) => s.id === (user.schoolId || user.schoolIds?.[0]))?.name ||
        "Unassigned",
    }));

    let filtered = withSchoolName;

    if (roleFilter !== "all") {
      const rf = roleFilter.toLowerCase();
      filtered = filtered.filter((u) => {
        const uRole = (u.role || "").toLowerCase();
        if (rf === "admin") {
          return uRole === "admin" || uRole === "school_admin" || uRole === "super_admin";
        }
        if (rf === "teacher") {
          return uRole === "teacher" || uRole === "principal";
        }
        if (rf === "student") {
          return uRole === "student";
        }
        return uRole === rf || String(u.roleId) === roleFilter;
      });
    }

    if (query) {
      filtered = filtered.filter((user) =>
        [user.name, user.email, user.role, user.schoolName, user.phone || ""]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    return filtered.slice().sort((a, b) => {
      const left = (sortBy === "school" ? a.schoolName : (a as any)[sortBy] || "").toLowerCase();
      const right = (sortBy === "school" ? b.schoolName : (b as any)[sortBy] || "").toLowerCase();
      if (left < right) return sortDir === "asc" ? -1 : 1;
      if (left > right) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, schools, activeSchool, searchQuery, roleFilter, selectedSchoolFilter, sortBy, sortDir]);

  // Pagination slice for DataTable
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, sortBy, sortDir]);

  // Statistics counters
  const stats = useMemo(() => {
    const baseUsers = activeSchool
      ? users.filter(
        (u) => u.schoolId === activeSchool.id || u.schoolIds?.includes(activeSchool.id)
      )
      : users;
    return {
      total: baseUsers.length,
      admins: baseUsers.filter(
        (u) => u.role === "admin" || u.role === "school_admin" || u.role === "super_admin"
      ).length,
      teachers: baseUsers.filter((u) => u.role === "teacher").length,
      students: baseUsers.filter((u) => u.role === "student").length,
    };
  }, [users, activeSchool]);

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

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormError(null);
    setFieldErrors({});
  };

  const handleSave = () => {
    const errors: { [key: string]: string } = {};
    if (!formState.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formState.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = "Invalid email format";
    }
    if (!formState.phone.trim()) {
      errors.phone = "Enter valid 10-digit mobile number";
    } else if (!/^[6-9]\d{9}$/.test(formState.phone.trim())) {
      errors.phone = "Enter valid 10-digit mobile number";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const targetSchoolId = formState.schoolId || activeSchool?.id || schools[0]?.id || "";
    if (!targetSchoolId && schools.length > 0) {
      setFormError("School assignment is required.");
      return;
    }

    const payload = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim() || null,
      role: formState.role,
      roleId: formState.roleId,
      schoolId: targetSchoolId,
    };

    if (editingUser) {
      updateUserRequest({ id: editingUser.id, user: payload });
    } else {
      createUserRequest(payload);
    }
    closeModal();
  };

  const handleDelete = (user: User) => {
    if (!window.confirm(`Delete user ${user.name}? This cannot be undone.`)) {
      return;
    }
    deleteUserRequest(user.id);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
      case "school_admin":
      case "super_admin":
        return (
          <Badge
            variant="default"
            className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold text-xs"
          >
            <ShieldCheck className="h-3 w-3" /> Admin
          </Badge>
        );
      case "teacher":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-semibold text-xs"
          >
            <UserCheck className="h-3 w-3" /> Teacher
          </Badge>
        );
      case "student":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold text-xs"
          >
            <GraduationCap className="h-3 w-3" /> Student
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="capitalize text-xs">
            {role}
          </Badge>
        );
    }
  };

  const hasActiveFilters = searchQuery !== "" || roleFilter !== "all" || selectedSchoolFilter !== "all";

  const columns: ColumnDef<any>[] = [
    {
      key: "userInfo",
      header: "User Info",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-primary/15 text-primary border border-primary/20 font-bold h-10 w-10 shrink-0">
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((t: string) => t[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3 shrink-0" /> {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Detail",
      cell: (user) =>
        user.phone ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> {user.phone}
          </span>
        ) : (
          <span className="text-xs italic text-muted-foreground/60">—</span>
        ),
    },
    {
      key: "role",
      header: "Role",
      cell: (user) => getRoleBadge(user.role),
    },
    {
      key: "school",
      header: "Assigned School",
      cell: (user) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/50 px-2.5 py-1 rounded-lg border border-border/40">
          <Building2 className="h-3.5 w-3.5 text-primary/70 shrink-0" />
          {user.schoolName}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (user) => (
        <div className="inline-flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            onClick={() => openEditModal(user)}
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleDelete(user)}
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 mx-auto space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 rounded-2xl border border-primary/15 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            User Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage user accounts, roles, contact details, and school assignments across the institution.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2 self-start sm:self-auto h-10"
        >
          <Plus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      {/* Analytics / Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/70 hover:border-primary/40 transition-all shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Users
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5">{stats.total}</h3>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-muted/60 text-foreground shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 hover:border-amber-500/40 transition-all shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admins
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5 text-amber-600 dark:text-amber-400">
                {stats.admins}
              </h3>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 hover:border-blue-500/40 transition-all shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Teachers
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5 text-blue-600 dark:text-blue-400">
                {stats.teachers}
              </h3>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 hover:border-emerald-500/40 transition-all shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Students
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                {stats.students}
              </h3>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter & Table Card */}
      <Card className="border border-border/80 shadow-xl overflow-hidden">
        {/* Mobile-First Search & Filter Toolbar */}
        <CardHeader className="bg-card/60 backdrop-blur-sm border-b border-border/40 p-3.5 sm:p-5 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Search user by name, email, role, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
                className="w-full pl-9 pr-9 h-10 rounded-xl border-border bg-background/60 focus:bg-background transition-all text-sm shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Role Filter Tabs & Sorting */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 w-full lg:w-auto">
              {/* School Filter Dropdown (if multiple schools available) */}
              {schools && schools.length > 1 && !activeSchool && (
                <div className="relative">
                  <select
                    value={selectedSchoolFilter}
                    onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                    className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
                  >
                    <option value="all">All Schools</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Role Dropdown Filter */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs capitalize"
                >
                  <option value="all">All Roles</option>

                  {roles &&
                    roles.length > 0 &&
                    roles

                      .map((r) => (
                        <option key={r.roleId} value={r.roleName}>
                          {r.label || r.roleName}
                        </option>
                      ))}
                </select>
              </div>

              {/* Column Sort Selector */}
              <div className="flex items-center gap-1 text-xs border border-border/60 rounded-xl bg-background p-1 shadow-xs">
                <span className="text-muted-foreground px-2 font-medium flex items-center gap-1 hidden sm:flex">
                  <Filter className="h-3 w-3" /> Sort:
                </span>
                {(["name", "email", "role", "school"] as const).map((col) => (
                  <button
                    key={col}
                    onClick={() => toggleSort(col)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all ${sortBy === col ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    {col} {sortBy === col ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                ))}
              </div>

              {/* Reset Filter Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={!hasActiveFilters}
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setSelectedSchoolFilter("all");
                }}
                className="h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                title="Reset filters"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Reusable DataTable Component with Mobile Card Support */}
        <CardContent className="p-0">
          <DataTable
            data={paginatedUsers}
            columns={columns}
            rowKey={(user) => String(user.id)}
            loading={loading}
            bordered={true}
            emptyText="No matching users found in directory."
            emptyIcon={<Users className="h-8 w-8 opacity-30 text-muted-foreground" />}
            renderMobileCard={(user) => (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-primary/15 text-primary border border-primary/20 font-bold h-10 w-10 shrink-0">
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((t: string) => t[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{user.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" /> {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">{getRoleBadge(user.role)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border/40">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                      Contact
                    </span>
                    {user.phone ? (
                      <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-primary shrink-0" /> {user.phone}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                      School
                    </span>
                    <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5 truncate">
                      <Building2 className="h-3 w-3 text-primary shrink-0" /> {user.schoolName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(user);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(user);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            )}
            pagination={{
              page,
              limit,
              totalItems: filteredUsers.length,
              onPageChange: setPage,
              onLimitChange: setLimit,
              showPerPage: true,
            }}
          />
        </CardContent>
      </Card>

      {/* Add / Edit Modal Dialog */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={closeModal}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base">
                  {editingUser ? "Edit User Record" : "Add User Account"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left">
              {formError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Full Name *
                  </label>
                  <Input
                    placeholder="Enter full name..."
                    value={formState.name}
                    onInput={(e) => validateField("name", (e.target as HTMLInputElement).value)}
                    onChange={(e) => {
                      setFormState({ ...formState, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                    }}
                    className={`h-10 ${fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[11px] text-destructive font-medium">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. user@school.com"
                    value={formState.email}
                    onInput={(e) => validateField("email", (e.target as HTMLInputElement).value)}
                    onChange={(e) => {
                      setFormState({ ...formState, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                    }}
                    className={`h-10 ${fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-destructive font-medium">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={formState.phone}
                      onInput={(e) => validateField("phone", (e.target as HTMLInputElement).value)}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value.length > 0) {
                          if (!/^[6-9]/.test(value) || /[^0-9]/.test(value)) {
                            value = value.slice(0, -1);
                          }
                        }
                        setFormState({ ...formState, phone: value });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
                      }}
                      maxLength={10}
                      className={`h-10 ${fieldErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-destructive font-medium">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Role *
                    </label>
                    <select
                      value={formState.role}
                      onChange={(e) => {
                        const selectedRole = roles.find(
                          (r) => r.roleName === e.target.value || r.label === e.target.value
                        );
                        setFormState({
                          ...formState,
                          role: e.target.value,
                          roleId: selectedRole ? String(selectedRole.roleId) : formState.roleId,
                        });
                      }}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none capitalize cursor-pointer"
                    >
                      {roles &&
                        roles.length > 0 &&
                        roles.map((r) => (
                          <option key={r.roleId} value={r.roleName}>
                            {r.label || r.roleName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Assigned School *
                  </label>
                  <select
                    value={formState.schoolId}
                    onChange={(e) => setFormState({ ...formState, schoolId: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                  >
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5 bg-muted/20">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="shadow-md shadow-primary/20">
                {editingUser ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
