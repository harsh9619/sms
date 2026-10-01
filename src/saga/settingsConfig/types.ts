import React from "react";
import type { User } from "../../types";
import type { School } from "../../context/SchoolContext";
import type { MasterTheme } from "../../Services/school.service";

export interface SchoolEditForm {
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

export interface SettingsConfigState {
  schools: School[];
  users: User[];
  masterThemes: MasterTheme[];
  loading: boolean;
  updating: boolean;
  themesLoading: boolean;
  successMsg: string | null;
  error: string | null;
}

export interface SettingsConfigUIProps {
  schools: School[];
  users: User[];
  loading: boolean;
  updating: boolean;
  error: string | null;
  successMsg: string | null;

  // Theme & Mode Context
  theme?: string;
  mode?: "light" | "dark";
  setTheme?: (theme: string) => void;
  setMode?: (mode: "light" | "dark") => void;

  // Master Themes
  masterThemes: MasterTheme[];
  themesLoading: boolean;

  // User modal
  showUserModal: boolean;
  editingUser: User | null;
  userForm: { name: string; email: string; phone: string; role: string; schoolId: string };
  setUserForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; role: string; schoolId: string }>>;
  formError: string | null;
  openCreateUser: (schoolId?: string) => void;
  openEditUser: (user: User) => void;
  closeUserModal: () => void;
  handleSaveUser: () => void;
  handleDeleteUser: (user: User) => void;

  // School edit modal
  editingSchool: School | null;
  schoolForm: SchoolEditForm | null;
  schoolFormError: string | null;
  schoolSaveSuccess: boolean;
  openEditSchool: (school: School) => void;
  closeSchoolModal: () => void;
  setField: (k: keyof SchoolEditForm, v: any) => void;
  handleSaveSchool: () => void;
  handleRefresh: () => void;

  getUserCount: (schoolId: string, role: string) => number;
}
