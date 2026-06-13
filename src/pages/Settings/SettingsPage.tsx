import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { THEMES, User } from "../../types";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";
import { fetchSchools, fetchAllUsers, createUser, updateUser, deleteUser } from "../../lib/api";
import { School } from "../../context/SchoolContext";
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
  Edit,
  Trash2,
  Plus,
  X
} from "lucide-react";

export function SettingsPage() {
  const { theme, mode, setTheme, setMode } = useTheme();
  const [schools, setSchools] = React.useState<School[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showUserModal, setShowUserModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [userForm, setUserForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    role: "teacher",
    schoolId: "",
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [savingUser, setSavingUser] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([fetchSchools(), fetchAllUsers()])
      .then(([schoolsData, usersData]) => {
        if (mounted) {
          setSchools(schoolsData);
          setUsers(usersData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Settings: failed to fetch schools directory", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getSchoolUsersByRole = (schoolId: string, role: string) => {
    return users.filter(
      (u) => u.schoolIds && u.schoolIds.includes(schoolId) && u.role === role
    );
  };

  const resetUserForm = (schoolId?: string) => {
    setUserForm({
      name: "",
      email: "",
      phone: "",
      role: "teacher",
      schoolId: schoolId || schools[0]?.id || "",
    });
    setFormError(null);
  };

  const openCreateUser = (schoolId?: string) => {
    setEditingUser(null);
    resetUserForm(schoolId);
    setShowUserModal(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      schoolId: user.schoolIds?.[0] || schools[0]?.id || "",
    });
    setFormError(null);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setFormError(null);
  };

  const handleSaveUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.role || !userForm.schoolId) {
      setFormError("Name, email, role, and school are required.");
      return;
    }

    setSavingUser(true);
    try {
      const payload = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        phone: userForm.phone.trim() || null,
        role: userForm.role,
        schoolId: userForm.schoolId,
      };

      const savedUser = editingUser
        ? await updateUser(editingUser.id, payload)
        : await createUser(payload);

      setUsers((prev) => {
        if (editingUser) {
          return prev.map((u) => (u.id === savedUser.id ? savedUser : u));
        }
        return [savedUser, ...prev];
      });
      closeUserModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Delete user ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error("Delete user failed", err);
      window.alert("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Customize the look and feel of your dashboard and view active system listings</p>
      </div>

      {/* Schools Directory & Role Assignments */}
      <Card className="overflow-hidden border border-border/80 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/40 text-left">
          <CardTitle className="flex items-center gap-2.5">
            <SchoolIcon className="h-5.5 w-5.5 text-primary" />
            Schools Directory & Role Assignments
          </CardTitle>
          <CardDescription>
            View all registered schools and the list of allocated members grouped by their institutional roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading directory data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {schools.map((school) => {
                const admins = getSchoolUsersByRole(school.id, "admin");
                const teachers = getSchoolUsersByRole(school.id, "teacher");
                const students = getSchoolUsersByRole(school.id, "student");
                const initials = school.name.substring(0, 2).toUpperCase();

                return (
                  <div key={school.id} className="border border-border/60 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 bg-card/40 hover:bg-card/70 hover:shadow-lg">
                    {/* School Header */}
                    <div className="p-4 bg-muted/30 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base shadow-sm">
                          {initials}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-base text-foreground leading-tight">{school.name}</h3>
                          <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider mt-1 py-0.5 px-2 rounded-md">
                            {school.type || "School"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between w-full md:w-auto">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground md:text-right">
                          {school.address && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                              <span>{school.address}</span>
                            </div>
                          )}
                          {school.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground/60" />
                              <span>{school.phone}</span>
                            </div>
                          )}
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => openCreateUser(school.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </div>
                    </div>

                    {/* School Members Role-wise */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/50">
                      {/* Admins section */}
                      <div className="space-y-3.5 text-left md:pr-4">
                        <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs uppercase tracking-wider">
                          <Shield className="h-4 w-4" />
                          <span>Administrators ({admins.length})</span>
                        </div>
                        <div className="space-y-2">
                          {admins.map((admin) => (
                            <div key={admin.id} className="group flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30">
                              <div className="min-w-0 flex-1 flex items-center gap-2.5">
                                <Avatar size="sm" className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold">
                                  <AvatarFallback>{admin.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{admin.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{admin.email}</p>
                                </div>
                              </div>
                              <div className="hidden group-hover:flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditUser(admin)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(admin)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {admins.length === 0 && (
                            <p className="text-xs text-muted-foreground/60 italic pl-1">No administrators assigned</p>
                          )}
                        </div>
                      </div>

                      {/* Teachers section */}
                      <div className="space-y-3.5 text-left pt-5 md:pt-0 md:px-4">
                        <div className="flex items-center gap-2 text-blue-500 font-semibold text-xs uppercase tracking-wider">
                          <BookOpen className="h-4 w-4" />
                          <span>Teachers ({teachers.length})</span>
                        </div>
                        <div className="space-y-2">
                          {teachers.map((teacher) => (
                            <div key={teacher.id} className="group flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30">
                              <div className="min-w-0 flex-1 flex items-center gap-2.5">
                                <Avatar size="sm" className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold">
                                  <AvatarFallback>{teacher.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{teacher.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{teacher.email}</p>
                                </div>
                              </div>
                              <div className="hidden group-hover:flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditUser(teacher)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(teacher)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {teachers.length === 0 && (
                            <p className="text-xs text-muted-foreground/60 italic pl-1">No teachers assigned</p>
                          )}
                        </div>
                      </div>

                      {/* Students section */}
                      <div className="space-y-3.5 text-left pt-5 md:pt-0 md:pl-4">
                        <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs uppercase tracking-wider">
                          <GraduationCap className="h-4 w-4" />
                          <span>Students ({students.length})</span>
                        </div>
                        <div className="space-y-2">
                          {students.map((student) => (
                            <div key={student.id} className="group flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30">
                              <div className="min-w-0 flex-1 flex items-center gap-2.5">
                                <Avatar size="sm" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                                  <AvatarFallback>{student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{student.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{student.email}</p>
                                </div>
                              </div>
                              <div className="hidden group-hover:flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditUser(student)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(student)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {students.length === 0 && (
                            <p className="text-xs text-muted-foreground/60 italic pl-1">No students assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeUserModal}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base">{editingUser ? "Edit User" : "Add User"}</h3>
              <button onClick={closeUserModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              {formError && <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg font-medium">{formError}</div>}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Name *</label>
                <Input
                  placeholder="Full name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email *</label>
                <Input
                  placeholder="Email address"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                  <Input
                    placeholder="Phone number"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">School *</label>
                <select
                  value={userForm.schoolId}
                  onChange={(e) => setUserForm({ ...userForm, schoolId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Select school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={closeUserModal}>Cancel</Button>
              <Button onClick={handleSaveUser} disabled={savingUser}>
                {editingUser ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Theme Color
          </CardTitle>
          <CardDescription>Choose a color theme for the interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  theme === t.name
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {theme === t.name && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className="h-12 w-12 rounded-full shadow-lg ring-4 ring-white dark:ring-gray-800"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appearance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === "light" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
            Appearance
          </CardTitle>
          <CardDescription>Select light or dark mode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode("light")}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                mode === "light"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="h-16 w-24 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <Sun className="h-6 w-6 text-amber-500" />
              </div>
              <span className="text-sm font-semibold">Light Mode</span>
              {mode === "light" && <Badge className="bg-primary text-primary-foreground text-xs">Active</Badge>}
            </button>
            <button
              onClick={() => setMode("dark")}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                mode === "dark"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="h-16 w-24 rounded-lg bg-gray-900 border border-gray-700 shadow-sm flex items-center justify-center">
                <Moon className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-sm font-semibold">Dark Mode</span>
              {mode === "dark" && <Badge className="bg-primary text-primary-foreground text-xs">Active</Badge>}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your theme looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

