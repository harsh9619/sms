import React from "react";
import type { ClassInfo } from "../../types";
import { SubjectMaster, SubjectItem } from "../../Services/classSubject.service";

export interface ClassMasterItem {
  id: string;
  name: string;
  gradeLevel?: number;
  description?: string;
}

export interface GroupedClassItem {
  className: string;
  classIds: string[];
  classes: ClassInfo[];
  divisionNames: string[];
  divisionCount: number;
  assignedSubjects: SubjectItem[];
}

export interface ClassSubjectConfigState {
  classesList: ClassInfo[];
  classMasters: ClassMasterItem[];
  masterSubjects: SubjectMaster[];
  allAssignedSubjects: SubjectItem[];
  divMasters: string[];
  loading: boolean;
  saving: boolean;
  saveSuccess: boolean;
  creatingClass: boolean;
  deleting: boolean;
  successMsg: string | null;
  error: string | null;
}

export interface ClassSubjectConfigUIProps {
  groupedClasses: GroupedClassItem[];
  classesList: ClassInfo[];
  classMasters: ClassMasterItem[];
  masterSubjects: SubjectMaster[];
  allAssignedSubjects: SubjectItem[];
  divMasters: string[];
  activeDivisionsList: string[];
  subjectCategories: string[];
  filteredModalMasters: SubjectMaster[];
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;

  tableSearch: string;
  setTableSearch: (s: string) => void;
  gradeFilter: string;
  setGradeFilter: (g: string) => void;

  editingGroup: GroupedClassItem | null;
  setEditingGroup: (g: GroupedClassItem | null) => void;
  editingSubjectMasterIds: string[];
  editingSearch: string;
  setEditingSearch: (s: string) => void;
  editingCategory: string;
  setEditingCategory: (c: string) => void;
  saving: boolean;
  saveSuccess: boolean;

  showAddClassModal: boolean;
  setShowAddClassModal: (show: boolean) => void;
  selectedGradeNames: string[];
  setSelectedGradeNames: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDivisions: string[];
  setSelectedDivisions: React.Dispatch<React.SetStateAction<string[]>>;
  customGradeInput: string;
  setCustomGradeInput: (s: string) => void;
  customSectionInput: string;
  setCustomSectionInput: (s: string) => void;
  selectedNewClassSubjectIds: string[];
  setSelectedNewClassSubjectIds: React.Dispatch<React.SetStateAction<string[]>>;
  creatingClass: boolean;

  deletingGroup: GroupedClassItem | null;
  setDeletingGroup: (g: GroupedClassItem | null) => void;
  deleting: boolean;

  handleOpenEditGroupModal: (group: GroupedClassItem) => void;
  toggleSubjectMaster: (id: string) => void;
  handleSelectAllVisible: (masters: SubjectMaster[]) => void;
  handleClearAllVisible: (masters: SubjectMaster[]) => void;
  handleSaveClassSubjects: () => void;
  toggleGradeName: (name: string) => void;
  toggleDivision: (div: string) => void;
  toggleNewClassSubject: (id: string) => void;
  handleSelectAllNewClassSubjects: (masters?: SubjectMaster[]) => void;
  handleClearAllNewClassSubjects: () => void;
  handleCreateClassesBatch: (e: React.FormEvent) => void;
  handleDeleteGroupedClass: () => void;
  handleRefresh: () => void;

  totalClassesToCreate: number;
}

