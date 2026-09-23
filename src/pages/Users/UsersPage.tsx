import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";
import { USER_ROLES_NOT_TABLE } from "../../constants/common";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import {
  fetchSchoolsRequest,
  fetchUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
} from "../../saga";
import { School, useSchool } from "../../context/SchoolContext";
import { User, RoleMaster } from "../../types";
import { teacherService } from "../../Services/teacher.service";
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
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
} from "lucide-react";

const mapStateToProps = (state: AppState) => ({
  schools: state.school.schools,
  users: state.users.users,
  loading: state.users.loading,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchSchoolsRequest: () => dispatch(fetchSchoolsRequest()),
  fetchUsersRequest: () => dispatch(fetchUsersRequest()),
  createUserRequest: (user: any) => dispatch(createUserRequest(user)),
  updateUserRequest: (payload: { id: string; user: any }) => dispatch(updateUserRequest(payload)),
  deleteUserRequest: (id: string) => dispatch(deleteUserRequest(id)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof mapper>;

function UsersPageContent({
  schools,
  users,
  loading,
  fetchUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
}: PropsFromRedux) {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "email" | "role" | "school">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [roles, setRoles] = useState<RoleMaster[]>([]);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    role: "teacher",
    roleId: "",
    schoolId: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const { activeSchool } = useSchool();

  useEffect(() => {
    fetchUsersRequest();
  }, [fetchUsersRequest, activeSchool]);

  useEffect(() => {
    teacherService.getRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error("Failed to load roles in UsersPage:", err));
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
      schoolId: user.schoolId || user.schoolIds?.[0] || activeSchool?.id || schools[0]?.id || "",
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
      schoolId: schoolId || activeSchool?.id || schools[0]?.id || "",
    });
    setFormError(null);
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
    const visibleUsers = activeSchool
      ? users.filter((user) => user.schoolId === activeSchool.id || user.schoolIds?.includes(activeSchool.id))
      : users;

    const withSchoolName = visibleUsers.map((user) => ({
      ...user,
      schoolName: schools.find((s) => s.id === (user.schoolId || user.schoolIds?.[0]))?.name || "Unassigned",
    }));

    let filtered = withSchoolName;

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => {
        if (roleFilter === "admin") return u.role === "admin" || u.role === "school_admin" || u.role === "super_admin";
        return u.role === roleFilter;
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
      const left = (sortBy === "school" ? a.schoolName : a[sortBy] || "").toLowerCase();
      const right = (sortBy === "school" ? b.schoolName : b[sortBy] || "").toLowerCase();
      if (left < right) return sortDir === "asc" ? -1 : 1;
      if (left > right) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, schools, activeSchool, searchQuery, roleFilter, sortBy, sortDir]);

  // Statistics counters
  const stats = useMemo(() => {
    const baseUsers = activeSchool
      ? users.filter((u) => u.schoolId === activeSchool.id || u.schoolIds?.includes(activeSchool.id))
      : users;
    return {
      total: baseUsers.length,
      admins: baseUsers.filter((u) => u.role === "admin" || u.role === "school_admin" || u.role === "super_admin").length,
      teachers: baseUsers.filter((u) => u.role === "teacher").length,
      students: baseUsers.filter((u) => u.role === "student").length,
    };
  }, [users, activeSchool]);

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFieldErrors({});
  }, [showModal]);

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
        return <Badge variant="default" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold"><ShieldCheck className="h-3 w-3" /> Admin</Badge>;
      case "teacher":
        return <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-semibold"><UserCheck className="h-3 w-3" /> Teacher</Badge>;
      case "student":
        return <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold"><GraduationCap className="h-3 w-3" /> Student</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/15 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Users className="h-6 w-6" />
            </div>
            User Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts, roles, contact details, and school assignments across the institution.
          </p>
        </div>
        <Button onClick={openCreateModal} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2 self-start md:self-auto">
          <Plus className="h-4.5 w-4.5" /> Add New User
        </Button>
      </div>

      {/* Analytics / Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/70 hover:border-primary/40 transition-all shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-xl bg-muted/60 text-foreground">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 hover:border-amber-500/40 transition-all shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admins</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{stats.admins}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 hover:border-blue-500/40 transition-all shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teachers</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats.teachers}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 hover:border-emerald-500/40 transition-all shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.students}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border border-border/80 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/40 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, role, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background border-border/80 focus:border-primary"
              />
            </div>

            {/* Role Filter Tabs & Sorting */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 text-xs">
                {(["all", "admin", "teacher", "student"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${roleFilter === r
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Column Sort Selector */}
              <div className="flex items-center gap-1 text-xs border border-border/60 rounded-xl bg-background p-1">
                <span className="text-muted-foreground px-2 font-medium flex items-center gap-1">
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse">Fetching users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
              <div className="p-4 rounded-full bg-muted/50 text-muted-foreground">
                <Users className="h-8 w-8" />
              </div>
              <h4 className="font-semibold text-base">No Users Found</h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                No users match your active search filter. Try clearing query filters or add a new user.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm divide-y divide-border">
                <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User Info</th>
                    <th className="px-6 py-4">Contact Detail</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Assigned School</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {filteredUsers.filter((user) => !USER_ROLES_NOT_TABLE.includes(user?.role?.toUpperCase() as string)).map((user) => (
                    <tr key={user.id} className="hover:bg-muted/40 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" className="bg-primary/15 text-primary border border-primary/20 font-bold h-10 w-10">
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((t) => t[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {user.phone ? (
                          <span className="flex items-center gap-1.5 text-xs">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {user.phone}
                          </span>
                        ) : (
                          <span className="text-xs italic text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/50 px-2.5 py-1 rounded-lg border border-border/40">
                          <Building2 className="h-3.5 w-3.5 text-primary/70" />
                          {user.schoolName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1 opacity-90 group-hover:opacity-100">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEditModal(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(user)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={closeModal}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base">{editingUser ? "Edit User Record" : "Add User Account"}</h3>
              </div>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                  <Input
                    placeholder="Enter full name..."
                    value={formState.name}
                    onInput={(e) => validateField("name", (e.target as HTMLInputElement).value)}
                    onChange={(e) => {
                      setFormState({ ...formState, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                    }}
                    className={`h-10 ${fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[11px] text-destructive font-medium">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="e.g. user@school.com"
                    value={formState.email}
                    onInput={(e) => validateField("email", (e.target as HTMLInputElement).value)}
                    onChange={(e) => {
                      setFormState({ ...formState, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                    }}
                    className={`h-10 ${fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-destructive font-medium">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number *</label>
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
                      className={`h-10 ${fieldErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-destructive font-medium">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role *</label>
                    <select
                      value={formState.role}
                      onChange={(e) => {
                        const selectedRole = roles.find((r) => r.roleName === e.target.value || r.label === e.target.value);
                        setFormState({
                          ...formState,
                          role: e.target.value,
                          roleId: selectedRole ? String(selectedRole.roleId) : formState.roleId,
                        });
                      }}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none capitalize"
                    >
                      {roles && roles.length > 0 && (
                        roles.map((r) => (
                          <option key={r.roleId} value={r.roleName}>
                            {r.label || r.roleName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>


                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned School *</label>
                  <select
                    value={formState.schoolId}
                    onChange={(e) => setFormState({ ...formState, schoolId: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  >

                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>


              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5 bg-muted/20">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
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

export const UsersPage = mapper(UsersPageContent);
