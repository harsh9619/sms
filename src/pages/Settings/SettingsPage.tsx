import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { THEMES, User } from "../../types";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import {
  fetchSchoolsRequest,
  fetchAllUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
  updateSchoolRequest,
} from "../../saga";
import { School } from "../../context/SchoolContext";
import schoolService, { MasterTheme } from "../../Services/school.service";
import {
  Settings as SettingsIcon,
  Palette,
  Sun,
  Moon,
  Check,
  School as SchoolIcon,
  Shield,
  BookOpen,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Users,
  Hash,
  Building,
  CreditCard,
  Loader2,
} from "lucide-react";

// ─── Redux wiring ─────────────────────────────────────────────────────────────

const mapStateToProps = (state: AppState) => ({
  schools: state.school.schools,
  users: state.users.users,
  loading: state.school.loading,
  updating: (state.school as any).updating as boolean,
  updateError: (state.school as any).updateError as string | null,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchSchoolsRequest: () => dispatch(fetchSchoolsRequest()),
  fetchAllUsersRequest: () => dispatch(fetchAllUsersRequest()),
  createUserRequest: (user: any) => dispatch(createUserRequest(user)),
  updateUserRequest: (payload: { id: string; user: any }) => dispatch(updateUserRequest(payload)),
  deleteUserRequest: (id: string) => dispatch(deleteUserRequest(id)),
  updateSchoolRequest: (payload: any) => dispatch(updateSchoolRequest(payload)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof mapper>;

// ─── School Edit Form ─────────────────────────────────────────────────────────

interface SchoolEditForm {
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  board: string;
  subscription: string;
  maxStudents: string;
  isActive: boolean;
  theme: string;
  appearanceMode: "light" | "dark";
}

const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge", "Other"];
const SUBSCRIPTION_TIERS = [
  { value: "free", label: "Free" },
  { value: "basic", label: "Basic" },
  { value: "premium", label: "Premium" },
  { value: "enterprise", label: "Enterprise" },
];

function makeForm(s: School): SchoolEditForm {
  return {
    name: s.name ?? "",
    slug: s.slug ?? "",
    address: s.address ?? "",
    phone: s.phone ?? "",
    email: s.email ?? "",
    board: (s as any).board ?? s.type ?? "",
    subscription: s.subscription ?? "free",
    maxStudents: s.maxStudents ? String(s.maxStudents) : "",
    isActive: s.isActive ?? true,
    theme: s.theme ?? "default",
    appearanceMode: (s.appearanceMode as any) ?? "light",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

function SettingsPageContent({
  schools, users, loading, updating, updateError,
  fetchSchoolsRequest, fetchAllUsersRequest,
  createUserRequest, updateUserRequest, deleteUserRequest, updateSchoolRequest,
}: PropsFromRedux) {
  const { theme, mode, setTheme, setMode } = useTheme();

  // User modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", role: "teacher", schoolId: "" });
  const [formError, setFormError] = useState<string | null>(null);

  // School edit modal state
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schoolForm, setSchoolForm] = useState<SchoolEditForm | null>(null);
  const [schoolFormError, setSchoolFormError] = useState<string | null>(null);
  const [schoolSaveSuccess, setSchoolSaveSuccess] = useState(false);
  const [masterThemes, setMasterThemes] = useState<MasterTheme[]>([]);
  const [themesLoading, setThemesLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"schools" | "appearance">("schools");

  useEffect(() => {
    fetchSchoolsRequest();
    fetchAllUsersRequest();
    setThemesLoading(true);
    schoolService.getMasterThemes()
      .then(setMasterThemes)
      .catch(() => setMasterThemes([
        { id: 1, name: "default", label: "Ocean Blue", color: "#3b82f6", sortOrder: 1 },
        { id: 2, name: "emerald", label: "Emerald", color: "#10b981", sortOrder: 2 },
        { id: 3, name: "purple", label: "Royal Purple", color: "#8b5cf6", sortOrder: 3 },
        { id: 4, name: "rose", label: "Rose", color: "#f43f5e", sortOrder: 4 },
        { id: 5, name: "amber", label: "Sunset Amber", color: "#f97316", sortOrder: 5 },
      ]))
      .finally(() => setThemesLoading(false));
  }, []);

  // Detect update success
  useEffect(() => {
    if (schoolSaveSuccess && !updating && !updateError) {
      setTimeout(() => {
        setEditingSchool(null);
        setSchoolForm(null);
        setSchoolSaveSuccess(false);
      }, 900);
    }
  }, [updating, updateError, schoolSaveSuccess]);

  const getUserCount = (schoolId: string, role: string) =>
    users.filter((u) => u.schoolIds?.includes(schoolId) && u.role === role).length;

  // ── User modal ──

  const openCreateUser = (schoolId?: string) => {
    setEditingUser(null);
    setUserForm({ name: "", email: "", phone: "", role: "teacher", schoolId: schoolId || schools[0]?.id || "" });
    setFormError(null);
    setShowUserModal(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, phone: user.phone || "", role: user.role, schoolId: user.schoolIds?.[0] || "" });
    setFormError(null);
    setShowUserModal(true);
  };

  const closeUserModal = () => { setShowUserModal(false); setEditingUser(null); setFormError(null); };

  const handleSaveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.schoolId) {
      setFormError("Name, email, and school are required.");
      return;
    }
    const payload = { name: userForm.name.trim(), email: userForm.email.trim(), phone: userForm.phone.trim() || null, role: userForm.role, schoolId: userForm.schoolId };
    if (editingUser) updateUserRequest({ id: editingUser.id, user: payload });
    else createUserRequest(payload);
    closeUserModal();
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Delete user ${user.name}? This cannot be undone.`)) deleteUserRequest(user.id);
  };

  // ── School edit modal ──

  const openEditSchool = (school: School) => {
    setEditingSchool(school);
    setSchoolForm(makeForm(school));
    setSchoolFormError(null);
    setSchoolSaveSuccess(false);
  };

  const closeSchoolModal = () => {
    if (updating) return;
    setEditingSchool(null);
    setSchoolForm(null);
    setSchoolFormError(null);
    setSchoolSaveSuccess(false);
  };

  const setField = (k: keyof SchoolEditForm, v: any) =>
    setSchoolForm((f) => f ? { ...f, [k]: v } : f);

  const handleSaveSchool = () => {
    if (!schoolForm || !editingSchool) return;
    if (!schoolForm.name.trim() || !schoolForm.slug.trim()) {
      setSchoolFormError("Name and slug are required.");
      return;
    }
    setSchoolFormError(null);
    setSchoolSaveSuccess(true);
    updateSchoolRequest({
      id: editingSchool.id,
      name: schoolForm.name.trim(),
      slug: schoolForm.slug.trim(),
      address: schoolForm.address.trim() || undefined,
      phone: schoolForm.phone.trim() || undefined,
      email: schoolForm.email.trim() || undefined,
      board: schoolForm.board || undefined,
      subscription: schoolForm.subscription,
      maxStudents: schoolForm.maxStudents ? Number(schoolForm.maxStudents) : undefined,
      isActive: schoolForm.isActive,
      theme: schoolForm.theme,
      appearanceMode: schoolForm.appearanceMode,
    });
  };

  const inputCls = (err?: boolean) =>
    `w-full h-9 rounded-lg border ${err ? "border-destructive" : "border-input"} bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all`;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage schools, appearance, and system preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-0">
        {[
          { id: "schools", label: "Schools", icon: SchoolIcon },
          { id: "appearance", label: "Appearance", icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB: Schools ── */}
      {activeTab === "schools" && (
        <Card className="overflow-hidden border border-border/80 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2.5 text-base">
                  <SchoolIcon className="h-5 w-5 text-primary" />
                  Registered Schools
                </CardTitle>
                <CardDescription className="mt-1">
                  View, edit, and manage all registered schools and their settings.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs font-bold">{schools.length} school{schools.length !== 1 ? "s" : ""}</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading schools…</p>
              </div>
            ) : schools.length === 0 ? (
              <div className="py-16 text-center">
                <SchoolIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No schools registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/50">
                      {["School", "Contact", "Plan", "Theme", "Mode", "Status", "Members", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {schools.map((school) => {
                      const adminCount = getUserCount(school.id, "admin");
                      const teacherCount = getUserCount(school.id, "teacher");
                      const studentCount = getUserCount(school.id, "student");
                      const themeColor = THEMES.find((t) => t.name === school.theme)?.color ?? "#3b82f6";
                      const initials = school.name.substring(0, 2).toUpperCase();

                      return (
                        <tr key={school.id} className="group hover:bg-muted/20 transition-colors">

                          {/* School name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-[160px]">
                              <div className="h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                                style={{ backgroundColor: themeColor }}>
                                {initials}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground leading-tight">{school.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{school.slug}</p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3">
                            <div className="space-y-0.5 min-w-[140px]">
                              {school.email && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" /><span className="truncate max-w-[130px]">{school.email}</span>
                                </div>
                              )}
                              {school.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" /><span>{school.phone}</span>
                                </div>
                              )}
                              {school.address && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" /><span className="truncate max-w-[130px]">{school.address}</span>
                                </div>
                              )}
                              {!school.email && !school.phone && !school.address && (
                                <span className="text-xs text-muted-foreground/40 italic">—</span>
                              )}
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="px-4 py-3">
                            <Badge variant={
                              school.subscription === "enterprise" ? "default"
                                : school.subscription === "premium" ? "warning"
                                  : school.subscription === "basic" ? "info"
                                    : "secondary"
                            } className="capitalize text-[10px] font-bold px-2 py-0.5">
                              {school.subscription ?? "free"}
                            </Badge>
                          </td>

                          {/* Theme */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full ring-2 ring-white/60 dark:ring-black/30"
                                style={{ backgroundColor: themeColor }} />
                              <span className="text-xs text-muted-foreground capitalize">{school.theme ?? "default"}</span>
                            </div>
                          </td>

                          {/* Mode */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {school.appearanceMode === "dark"
                                ? <Moon className="h-3.5 w-3.5 text-blue-400" />
                                : <Sun className="h-3.5 w-3.5 text-amber-500" />}
                              <span className="text-xs text-muted-foreground capitalize">{school.appearanceMode ?? "light"}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <Badge variant={school.isActive ? "success" : "secondary"} className="text-[10px] font-bold px-2">
                              {school.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>

                          {/* Members */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                              <span className="text-rose-500 font-semibold">{adminCount}A</span>
                              <span>·</span>
                              <span className="text-blue-500 font-semibold">{teacherCount}T</span>
                              <span>·</span>
                              <span className="text-emerald-500 font-semibold">{studentCount}S</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" title="Edit school" onClick={() => openEditSchool(school)}
                                className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Add user" onClick={() => openCreateUser(school.id)}
                                className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── TAB: Appearance ── */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          {/* Theme Colors */}
          <Card className="border border-border/80 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-primary" />
                Theme Color
              </CardTitle>
              <CardDescription>Choose a global color theme for your dashboard interface</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {THEMES.map((t) => (
                  <button key={t.name} onClick={() => setTheme(t.name)}
                    className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${theme === t.name ? "shadow-md" : "border-border hover:border-muted-foreground/30"
                      }`}
                    style={theme === t.name ? { borderColor: t.color, background: `${t.color}0d` } : {}}>
                    {theme === t.name && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: t.color }} />
                      </div>
                    )}
                    <div className="h-12 w-12 rounded-full shadow-lg ring-4 ring-white dark:ring-gray-800"
                      style={{ backgroundColor: t.color }} />
                    <span className="text-xs font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appearance Mode */}
          <Card className="border border-border/80 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                {mode === "light" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
                Appearance Mode
              </CardTitle>
              <CardDescription>Select how the dashboard looks</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <button onClick={() => setMode("light")}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${mode === "light" ? "border-amber-400 bg-amber-50/60 dark:bg-amber-900/10 shadow-md" : "border-border hover:border-amber-300/50"
                    }`}>
                  <div className="h-16 w-24 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                    <Sun className="h-6 w-6 text-amber-500" />
                  </div>
                  <span className={`text-sm font-semibold ${mode === "light" ? "text-amber-600" : ""}`}>Light</span>
                  {mode === "light" && <Badge className="bg-amber-500 text-white text-[10px] px-2">Active</Badge>}
                </button>
                <button onClick={() => setMode("dark")}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${mode === "dark" ? "border-blue-500 bg-slate-900/10 shadow-md" : "border-border hover:border-blue-400/40"
                    }`}>
                  <div className="h-16 w-24 rounded-lg bg-gray-900 border border-gray-700 shadow-sm flex items-center justify-center">
                    <Moon className="h-6 w-6 text-blue-400" />
                  </div>
                  <span className={`text-sm font-semibold ${mode === "dark" ? "text-blue-400" : ""}`}>Dark</span>
                  {mode === "dark" && <Badge className="bg-blue-500 text-white text-[10px] px-2">Active</Badge>}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Component Preview */}
          <Card className="border border-border/80 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/40">
              <CardTitle className="text-base">Component Preview</CardTitle>
              <CardDescription>See how your selected theme and mode look in practice</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              <div className="p-4 rounded-xl bg-primary text-primary-foreground">
                <p className="font-semibold">Primary Color Card</p>
                <p className="text-sm opacity-80">This shows your selected theme color in action.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── User Add/Edit Modal ── */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeUserModal}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base">{editingUser ? "Edit User" : "Add User"}</h3>
              <button onClick={closeUserModal} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4 text-left">
              {formError && <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg">{formError}</div>}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Name *</label>
                <Input placeholder="Full name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email *</label>
                <Input placeholder="Email address" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                  <Input placeholder="Phone number" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Role *</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">School *</label>
                <select value={userForm.schoolId} onChange={(e) => setUserForm({ ...userForm, schoolId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Select school</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={closeUserModal}>Cancel</Button>
              <Button onClick={handleSaveUser}>{editingUser ? "Save Changes" : "Create User"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── School Edit Modal ── */}
      {editingSchool && schoolForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeSchoolModal}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                  {editingSchool.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit School</h3>
                  <p className="text-xs text-muted-foreground">{editingSchool.name}</p>
                </div>
              </div>
              <button onClick={closeSchoolModal} disabled={updating} className="text-muted-foreground hover:text-foreground disabled:opacity-40">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left">
              {schoolFormError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{schoolFormError}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Basic Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Building className="h-3.5 w-3.5" />Name *</label>
                    <input className={inputCls(!schoolForm.name)} value={schoolForm.name}
                      onChange={(e) => setField("name", e.target.value)} placeholder="School name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Hash className="h-3.5 w-3.5" />Slug *</label>
                    <input className={`${inputCls(!schoolForm.slug)} font-mono`} value={schoolForm.slug}
                      onChange={(e) => setField("slug", e.target.value)} placeholder="url-slug" />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Address</label>
                    <input className={inputCls()} value={schoolForm.address}
                      onChange={(e) => setField("address", e.target.value)} placeholder="123 School Street" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" />Phone</label>
                    <input className={inputCls()} value={schoolForm.phone}
                      onChange={(e) => setField("phone", e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" />Email</label>
                    <input type="email" className={inputCls()} value={schoolForm.email}
                      onChange={(e) => setField("email", e.target.value)} placeholder="admin@school.edu" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />Board</label>
                    <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={schoolForm.board} onChange={(e) => setField("board", e.target.value)}>
                      <option value="">— Select board —</option>
                      {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Config */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Configuration</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" />Subscription</label>
                    <select className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={schoolForm.subscription} onChange={(e) => setField("subscription", e.target.value)}>
                      {SUBSCRIPTION_TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" />Max Students</label>
                    <input type="number" className={inputCls()} value={schoolForm.maxStudents}
                      onChange={(e) => setField("maxStudents", e.target.value)} placeholder="500" />
                  </div>
                </div>
                {/* Active toggle */}
                <div className="pt-2">
                  <button type="button" onClick={() => setField("isActive", !schoolForm.isActive)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 w-full transition-all ${schoolForm.isActive ? "border-emerald-500/50 bg-emerald-500/5" : "border-border bg-muted/20"
                      }`}>
                    <div className={`h-5 w-10 rounded-full relative flex-shrink-0 transition-colors ${schoolForm.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"}`}>
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${schoolForm.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className={`text-sm font-semibold ${schoolForm.isActive ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {schoolForm.isActive ? "Active — school is accessible" : "Inactive — school is hidden"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Theme & Appearance */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Theme & Appearance</p>

                {/* Theme color swatches */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Theme Color</label>
                  {themesLoading ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Loading from DB…</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {masterThemes.map((t) => (
                        <button key={t.name} type="button" title={t.label} onClick={() => setField("theme", t.name)}
                          className={`relative h-10 w-10 rounded-full transition-all duration-200 ring-2 ring-white/60 dark:ring-black/30 hover:scale-110 ${schoolForm.theme === t.name ? "ring-4 ring-offset-2 scale-110" : ""
                            }`}
                          style={{
                            backgroundColor: t.color,
                            ringColor: schoolForm.theme === t.name ? t.color : undefined,
                          }}>
                          {schoolForm.theme === t.name && (
                            <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {(() => {
                    const at = masterThemes.find((t) => t.name === schoolForm.theme);
                    return at ? (
                      <p className="text-xs font-medium" style={{ color: at.color }}>
                        ● {at.label} ({at.color})
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Appearance mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Appearance Mode</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setField("appearanceMode", "light")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${schoolForm.appearanceMode === "light"
                          ? "border-amber-400 bg-amber-50/60 text-amber-700 dark:text-amber-400"
                          : "border-border text-muted-foreground hover:border-amber-300/50"
                        }`}>
                      <Sun className="h-4 w-4 text-amber-500" /> Light
                      {schoolForm.appearanceMode === "light" && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => setField("appearanceMode", "dark")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${schoolForm.appearanceMode === "dark"
                          ? "border-blue-500 bg-slate-900/10 text-blue-400"
                          : "border-border text-muted-foreground hover:border-blue-400/40"
                        }`}>
                      <Moon className="h-4 w-4 text-blue-400" /> Dark
                      {schoolForm.appearanceMode === "dark" && <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-5 border-t border-border flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-muted-foreground">
                School ID: <span className="font-mono">{editingSchool.id}</span>
              </div>
              <div className="flex gap-2.5">
                <Button variant="outline" onClick={closeSchoolModal} disabled={updating}>Cancel</Button>
                <Button onClick={handleSaveSchool} disabled={updating} className="min-w-[120px]">
                  {updating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                  ) : schoolSaveSuccess && !updateError ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2 text-green-300" />Saved!</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Save Changes</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const SettingsPage = mapper(SettingsPageContent);
