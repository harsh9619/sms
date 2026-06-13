import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";
import { fetchSchools, fetchUsers, createUser, updateUser, deleteUser } from "../../lib/api";
import { School, useSchool } from "../../context/SchoolContext";
import { User } from "../../types";
import { Plus, Edit, Trash2, Users, X } from "lucide-react";

export function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [schools, setSchools] = React.useState<School[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"name" | "email" | "role" | "school">("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [formState, setFormState] = React.useState({
    name: "",
    email: "",
    phone: "",
    role: "teacher",
    schoolId: "",
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const { activeSchool } = useSchool();

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([fetchSchools(), fetchUsers()])
      .then(([schoolsData, usersData]) => {
        if (!active) return;
        setSchools(schoolsData);
        setUsers(usersData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("UsersPage: failed to load users or schools", err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeSchool]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormState({
      name: "",
      email: "",
      phone: "",
      role: "teacher",
      schoolId: activeSchool?.id || schools[0]?.id || "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormState({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      schoolId: user.schoolIds?.[0] || activeSchool?.id || schools[0]?.id || "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const toggleSort = (column: "name" | "email" | "role" | "school") => {
    if (sortBy === column) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const filteredUsers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const visibleUsers = activeSchool
      ? users.filter((user) => user.schoolIds?.includes(activeSchool.id))
      : users;
    const withSchoolName = visibleUsers.map((user) => ({
      ...user,
      schoolName: schools.find((s) => s.id === user.schoolIds?.[0])?.name || "Unassigned",
    }));

    const filtered = query
      ? withSchoolName.filter((user) =>
          [user.name, user.email, user.role, user.schoolName]
            .join(" ")
            .toLowerCase()
            .includes(query)
        )
      : withSchoolName;

    return filtered.slice().sort((a, b) => {
      const left = (sortBy === "school" ? a.schoolName : a[sortBy]).toLowerCase();
      const right = (sortBy === "school" ? b.schoolName : b[sortBy]).toLowerCase();
      if (left < right) return sortDir === "asc" ? -1 : 1;
      if (left > right) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, schools, searchQuery, sortBy, sortDir]);

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!formState.name.trim() || !formState.email.trim() || !formState.role || !formState.schoolId) {
      setFormError("Name, email, role, and school are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim() || null,
        role: formState.role,
        schoolId: formState.schoolId,
      };

      const result = editingUser
        ? await updateUser(editingUser.id, payload)
        : await createUser(payload);

      setUsers((prev) => {
        if (editingUser) {
          return prev.map((u) => (u.id === result.id ? result : u));
        }
        return [result, ...prev];
      });
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user ${user.name}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error("UsersPage delete failed", err);
      window.alert("Could not delete user. Please try again.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            User Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and remove user accounts for admins, teachers, and students.</p>
        </div>
        <Button onClick={openCreateModal} className="shadow-lg shadow-primary/10">
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      <Card className="border border-border/80 shadow-xl">
        <CardHeader className="bg-muted/30 border-b border-border/40">
          <CardTitle className="text-base font-semibold">Users</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] items-center">
            <Input
              placeholder="Search by name, email, role, or school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Sort by:</span>
              <button
                onClick={() => toggleSort("name")}
                className={`px-2 py-1 rounded-lg border ${sortBy === "name" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
              >
                Name {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </button>
              <button
                onClick={() => toggleSort("email")}
                className={`px-2 py-1 rounded-lg border ${sortBy === "email" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
              >
                Email {sortBy === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </button>
              <button
                onClick={() => toggleSort("role")}
                className={`px-2 py-1 rounded-lg border ${sortBy === "role" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
              >
                Role {sortBy === "role" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </button>
              <button
                onClick={() => toggleSort("school")}
                className={`px-2 py-1 rounded-lg border ${sortBy === "school" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
              >
                School {sortBy === "school" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No users match your search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Role</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">School</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="bg-card/60 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                            <AvatarFallback>{user.name.split(" ").map((token) => token[0]).join("").toUpperCase().slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{user.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-4 whitespace-nowrap capitalize text-muted-foreground">{user.role}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{user.schoolName}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden animate-scale-in" onClick={(event) => event.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base">{editingUser ? "Edit User" : "Add User"}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              {formError && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">{formError}</div>}
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Name *</label>
                  <Input
                    placeholder="Full name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Email *</label>
                  <Input
                    placeholder="Email address"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                    <Input
                      placeholder="Phone number"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Role *</label>
                    <select
                      value={formState.role}
                      onChange={(e) => setFormState({ ...formState, role: e.target.value })}
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
                    value={formState.schoolId}
                    onChange={(e) => setFormState({ ...formState, schoolId: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="">Select school</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {editingUser ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
