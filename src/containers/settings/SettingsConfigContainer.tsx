import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../saga/rootReducer";
import { useTheme } from "../../context/ThemeContext";
import {
  fetchSettingsConfigRequest,
  updateSchoolConfigRequest,
  createUserConfigRequest,
  updateUserConfigRequest,
  deleteUserConfigRequest,
  clearSettingsConfigMessages,
} from "../../saga/settingsConfig";
import { SettingsConfigUI } from "../../components/modules/settings/SettingsConfigUI";
import { SchoolEditForm } from "../../saga/settingsConfig/types";
import { School } from "../../context/SchoolContext";
import { User } from "../../types";

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

export function SettingsConfigContainer() {
  const dispatch = useDispatch();
  const { theme, mode, setTheme, setMode } = useTheme();

  const {
    schools,
    users,
    masterThemes,
    loading,
    updating,
    themesLoading,
    successMsg,
    error,
  } = useSelector((state: RootState) => state.settingsConfig);

  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", role: "teacher", schoolId: "" });
  const [formError, setFormError] = useState<string | null>(null);

  // School Edit Modal State
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schoolForm, setSchoolForm] = useState<SchoolEditForm | null>(null);
  const [schoolFormError, setSchoolFormError] = useState<string | null>(null);
  const [schoolSaveSuccess, setSchoolSaveSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchSettingsConfigRequest());
  }, [dispatch]);

  // Clear feedback messages after 3s
  useEffect(() => {
    if (successMsg || error) {
      const timer = setTimeout(() => {
        dispatch(clearSettingsConfigMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, error, dispatch]);

  // Detect school update success
  useEffect(() => {
    if (schoolSaveSuccess && !updating && !error) {
      const timer = setTimeout(() => {
        setEditingSchool(null);
        setSchoolForm(null);
        setSchoolSaveSuccess(false);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [updating, error, schoolSaveSuccess]);

  const handleRefresh = () => {
    dispatch(fetchSettingsConfigRequest());
  };

  const getUserCount = (schoolId: string, role: string) =>
    users.filter((u) => u.schoolIds?.includes(schoolId) && u.role === role).length;
  debugger
  // User Modal Handlers
  const openCreateUser = (schoolId?: string) => {
    setEditingUser(null);
    setUserForm({ name: "", email: "", phone: "", role: "teacher", schoolId: schoolId || schools[0]?.id || "" });
    setFormError(null);
    setShowUserModal(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, phone: user.phone || "", role: user.role, schoolId: String(user.schoolIds?.[0] || user.schoolId || "") });
    setFormError(null);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setFormError(null);
  };

  const handleSaveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.schoolId) {
      setFormError("Name, email, and school are required.");
      return;
    }
    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      phone: userForm.phone.trim() || null,
      role: userForm.role,
      schoolId: userForm.schoolId,
    };

    if (editingUser) {
      dispatch(updateUserConfigRequest({ id: editingUser.id, user: payload }));
    } else {
      dispatch(createUserConfigRequest(payload));
    }
    closeUserModal();
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Delete user ${user.name}? This cannot be undone.`)) {
      dispatch(deleteUserConfigRequest(user.id));
    }
  };

  // School Edit Modal Handlers
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
    setSchoolForm((f) => (f ? { ...f, [k]: v } : f));

  const handleSaveSchool = () => {
    if (!schoolForm || !editingSchool) return;
    if (!schoolForm.name.trim() || !schoolForm.slug.trim()) {
      setSchoolFormError("Name and slug are required.");
      return;
    }
    setSchoolFormError(null);
    setSchoolSaveSuccess(true);
    dispatch(
      updateSchoolConfigRequest({
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
      })
    );
  };

  return (
    <SettingsConfigUI
      schools={schools}
      users={users}
      loading={loading}
      updating={updating}
      error={error}
      successMsg={successMsg}
      theme={theme}
      mode={mode}
      setTheme={setTheme}
      setMode={setMode}
      masterThemes={masterThemes}
      themesLoading={themesLoading}
      showUserModal={showUserModal}
      editingUser={editingUser}
      userForm={userForm}
      setUserForm={setUserForm}
      formError={formError}
      openCreateUser={openCreateUser}
      openEditUser={openEditUser}
      closeUserModal={closeUserModal}
      handleSaveUser={handleSaveUser}
      handleDeleteUser={handleDeleteUser}
      editingSchool={editingSchool}
      schoolForm={schoolForm}
      schoolFormError={schoolFormError}
      schoolSaveSuccess={schoolSaveSuccess}
      openEditSchool={openEditSchool}
      closeSchoolModal={closeSchoolModal}
      setField={setField}
      handleSaveSchool={handleSaveSchool}
      handleRefresh={handleRefresh}
      getUserCount={getUserCount}
    />
  );
}

export default SettingsConfigContainer;
