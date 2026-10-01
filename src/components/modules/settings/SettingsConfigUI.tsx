import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { DataTable, ColumnDef } from "../../ui/DataTable";
import { THEMES, User } from "../../../types";
import { School } from "../../../context/SchoolContext";
import { SettingsConfigUIProps, SchoolEditForm } from "../../../saga/settingsConfig/types";
import {
  Settings as SettingsIcon,
  Palette,
  Sun,
  Moon,
  Check,
  School as SchoolIcon,
  MapPin,
  Phone,
  Mail,
  Edit,
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
  RefreshCw,
  BookOpen,
} from "lucide-react";

const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge", "Other"];
const SUBSCRIPTION_TIERS = [
  { value: "free", label: "Free" },
  { value: "basic", label: "Basic" },
  { value: "premium", label: "Premium" },
  { value: "enterprise", label: "Enterprise" },
];

export function SettingsConfigUI(props: SettingsConfigUIProps) {
  const {
    schools,
    users,
    loading,
    updating,
    error,
    successMsg,
    masterThemes,
    themesLoading,
    showUserModal,
    editingUser,
    userForm,
    setUserForm,
    formError,
    openCreateUser,
    openEditUser,
    closeUserModal,
    handleSaveUser,
    handleDeleteUser,
    editingSchool,
    schoolForm,
    schoolFormError,
    schoolSaveSuccess,
    openEditSchool,
    closeSchoolModal,
    setField,
    handleSaveSchool,
    handleRefresh,
    getUserCount,
  } = props;

  const inputCls = (err?: boolean) =>
    `w-full h-9 rounded-lg border ${err ? "border-destructive" : "border-input"} bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all`;

  // DataTable column definitions for Registered Schools
  const columns: ColumnDef<School>[] = useMemo(
    () => [
      {
        key: "school",
        header: "School",
        cell: (school) => {
          const themeColor = THEMES.find((t) => t.name === school.theme)?.color ?? "#3b82f6";
          const initials = school.name.substring(0, 2).toUpperCase();
          return (
            <div className="flex items-center gap-3 min-w-[160px]">
              <div
                className="h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs"
                style={{ backgroundColor: themeColor }}
              >
                {initials}
              </div>
              <div>
                <p className="font-semibold text-foreground leading-tight">{school.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{school.slug}</p>
              </div>
            </div>
          );
        },
      },
      {
        key: "contact",
        header: "Contact",
        cell: (school) => (
          <div className="space-y-0.5 min-w-[140px]">
            {school.email && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[130px]">{school.email}</span>
              </div>
            )}
            {school.phone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span>{school.phone}</span>
              </div>
            )}
            {school.address && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[130px]">{school.address}</span>
              </div>
            )}
            {!school.email && !school.phone && !school.address && (
              <span className="text-xs text-muted-foreground/40 italic">—</span>
            )}
          </div>
        ),
      },
      {
        key: "plan",
        header: "Plan",
        cell: (school) => (
          <Badge
            variant={
              school.subscription === "enterprise"
                ? "default"
                : school.subscription === "premium"
                  ? "warning"
                  : school.subscription === "basic"
                    ? "info"
                    : "secondary"
            }
            className="capitalize text-[10px] font-bold px-2 py-0.5"
          >
            {school.subscription ?? "free"}
          </Badge>
        ),
      },
      {
        key: "theme",
        header: "Theme",
        cell: (school) => {
          const themeColor = THEMES.find((t) => t.name === school.theme)?.color ?? "#3b82f6";
          return (
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full ring-2 ring-white/60 dark:ring-black/30"
                style={{ backgroundColor: themeColor }}
              />
              <span className="text-xs text-muted-foreground capitalize">{school.theme ?? "default"}</span>
            </div>
          );
        },
      },

      {
        key: "status",
        header: "Status",
        cell: (school) => (
          <Badge variant={school.isActive ? "success" : "secondary"} className="text-[10px] font-bold px-2">
            {school.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (school) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Edit school"
              onClick={() => openEditSchool(school)}
              className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            {/* <Button
              variant="ghost"
              size="icon"
              title="Add user"
              onClick={() => openCreateUser(school.id)}
              className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button> */}
          </div>
        ),
      },
    ],
    [getUserCount, openEditSchool, openCreateUser]
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 mx-auto space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Manage registered schools and system preferences.</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto gap-1.5 text-xs font-semibold h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Banner Feedback Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registered Schools Card */}
      <Card className="overflow-hidden border border-border/80 shadow-xl rounded-2xl">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                <SchoolIcon className="h-5 w-5 text-primary" />
                Registered Schools
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                View, edit, and manage all registered schools and their settings.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs font-bold">
              {schools.length} school{schools.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <DataTable<School>
            data={schools}
            columns={columns}
            rowKey={(school) => school.id}
            loading={loading}
            bordered={true}
            emptyText="No registered schools found."
            emptyIcon={<SchoolIcon className="h-10 w-10 opacity-30" />}
            renderMobileCard={(school) => {
              const adminCount = getUserCount(school.id, "admin");
              const teacherCount = getUserCount(school.id, "teacher");
              const studentCount = getUserCount(school.id, "student");
              const themeColor = THEMES.find((t) => t.name === school.theme)?.color ?? "#3b82f6";
              const initials = school.name.substring(0, 2).toUpperCase();

              return (
                <div className="p-3.5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs"
                        style={{ backgroundColor: themeColor }}
                      >
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm">{school.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-mono">{school.slug}</p>
                      </div>
                    </div>
                    <Badge variant={school.isActive ? "success" : "secondary"} className="text-[10px] font-bold">
                      {school.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[10px] font-bold uppercase block">Plan & Mode</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0">
                          {school.subscription ?? "free"}
                        </Badge>
                        <span className="text-[11px] capitalize text-muted-foreground flex items-center gap-1">
                          {school.appearanceMode === "dark" ? (
                            <Moon className="h-3 w-3 text-blue-400" />
                          ) : (
                            <Sun className="h-3 w-3 text-amber-500" />
                          )}
                          {school.appearanceMode ?? "light"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[10px] font-bold uppercase block">Members</span>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5">
                        <span className="text-rose-500 font-semibold">{adminCount}A</span>
                        <span>·</span>
                        <span className="text-blue-500 font-semibold">{teacherCount}T</span>
                        <span>·</span>
                        <span className="text-emerald-500 font-semibold">{studentCount}S</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditSchool(school)}
                      className="h-8 text-xs font-bold gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit School
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCreateUser(school.id)}
                      className="h-8 text-xs font-bold gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add User
                    </Button>
                  </div>
                </div>
              );
            }}
          />
        </CardContent>
      </Card>

      {/* ── User Add/Edit Modal ── */}
      {showUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-2 sm:p-4 overflow-y-auto"
          onClick={closeUserModal}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-base">{editingUser ? "Edit User" : "Add User"}</h3>
              <button onClick={closeUserModal} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-4 text-left overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg">{formError}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Name *</label>
                <Input
                  placeholder="Full name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email *</label>
                <Input
                  placeholder="Email address"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                  <Input
                    placeholder="Phone number"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
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
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Select school</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-2.5 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={closeUserModal} className="w-full sm:w-auto text-xs font-semibold h-9">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveUser} className="w-full sm:w-auto text-xs font-bold h-9">
                {editingUser ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── School Edit Modal ── */}
      {editingSchool && schoolForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-2 sm:p-4 overflow-y-auto"
          onClick={closeSchoolModal}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col animate-scale-in my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                  {editingSchool.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Edit School</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{editingSchool.name}</p>
                </div>
              </div>
              <button
                onClick={closeSchoolModal}
                disabled={updating}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5 text-left">
              {schoolFormError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {schoolFormError}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Basic Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" />
                      Name *
                    </label>
                    <input
                      className={inputCls(!schoolForm.name)}
                      value={schoolForm.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="School name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5" />
                      Slug *
                    </label>
                    <input
                      className={`${inputCls(!schoolForm.slug)} font-mono`}
                      value={schoolForm.slug}
                      onChange={(e) => setField("slug", e.target.value)}
                      placeholder="url-slug"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Address
                    </label>
                    <input
                      className={inputCls()}
                      value={schoolForm.address}
                      onChange={(e) => setField("address", e.target.value)}
                      placeholder="123 School Street"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      Phone
                    </label>
                    <input
                      className={inputCls()}
                      value={schoolForm.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </label>
                    <input
                      type="email"
                      className={inputCls()}
                      value={schoolForm.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="admin@school.edu"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      Board
                    </label>
                    <select
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={schoolForm.board}
                      onChange={(e) => setField("board", e.target.value)}
                    >
                      <option value="">— Select board —</option>
                      {BOARDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Config */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Configuration</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" />
                      Subscription
                    </label>
                    <select
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={schoolForm.subscription}
                      onChange={(e) => setField("subscription", e.target.value)}
                    >
                      {SUBSCRIPTION_TIERS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Max Students
                    </label>
                    <input
                      type="number"
                      className={inputCls()}
                      value={schoolForm.maxStudents}
                      onChange={(e) => setField("maxStudents", e.target.value)}
                      placeholder="500"
                    />
                  </div>
                </div>
                {/* Active toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setField("isActive", !schoolForm.isActive)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 w-full transition-all ${schoolForm.isActive ? "border-emerald-500/50 bg-emerald-500/5" : "border-border bg-muted/20"
                      }`}
                  >
                    <div
                      className={`h-5 w-10 rounded-full relative flex-shrink-0 transition-colors ${schoolForm.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${schoolForm.isActive ? "translate-x-5" : "translate-x-0.5"
                          }`}
                      />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold ${schoolForm.isActive ? "text-emerald-600" : "text-muted-foreground"
                        }`}
                    >
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
                        <button
                          key={t.name}
                          type="button"
                          title={t.label}
                          onClick={() => setField("theme", t.name)}
                          className={`relative h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 ring-2 ring-white/60 dark:ring-black/30 hover:scale-110 ${schoolForm.theme === t.name ? "ring-4 ring-offset-2 scale-110" : ""
                            }`}
                          style={{
                            backgroundColor: t.color,
                          }}
                        >
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
                  <div className="flex gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setField("appearanceMode", "light")}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all ${schoolForm.appearanceMode === "light"
                        ? "border-amber-400 bg-amber-50/60 text-amber-700 dark:text-amber-400"
                        : "border-border text-muted-foreground hover:border-amber-300/50"
                        }`}
                    >
                      <Sun className="h-4 w-4 text-amber-500" /> Light
                      {schoolForm.appearanceMode === "light" && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setField("appearanceMode", "dark")}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all ${schoolForm.appearanceMode === "dark"
                        ? "border-blue-500 bg-slate-900/10 text-blue-400"
                        : "border-border text-muted-foreground hover:border-blue-400/40"
                        }`}
                    >
                      <Moon className="h-4 w-4 text-blue-400" /> Dark
                      {schoolForm.appearanceMode === "dark" && <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 sm:p-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <div className="text-xs text-muted-foreground self-start sm:self-auto">
                School ID: <span className="font-mono">{editingSchool.id}</span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={closeSchoolModal} disabled={updating} className="flex-1 sm:flex-none text-xs font-semibold h-9">
                  Cancel
                </Button>
                <Button onClick={handleSaveSchool} size="sm" disabled={updating} className="flex-1 sm:flex-none min-w-[110px] text-xs font-bold h-9">
                  {updating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Saving…
                    </>
                  ) : schoolSaveSuccess && !error ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-300" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      Save Changes
                    </>
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

export default SettingsConfigUI;
