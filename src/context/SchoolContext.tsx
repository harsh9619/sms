import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useAppDispatch, useAppSelector } from "../saga/hooks";
import { fetchSchoolsRequest, setActiveSchool as setActiveSchoolAction } from "../saga";


export interface AcademicYearItem {
  schoolAcademicYearId: string;
  academicYearId: string;
  academicYear: string;
  isCurrent: boolean;
  createdAt?: string;
}

export interface School {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  theme?: string;
  isActive?: boolean;
  subscription?: string;
  maxStudents?: number;
  academicYear?: string;
  schoolAcademicYearId?: string;
  academicYears?: AcademicYearItem[];
  createdAt?: string;
  updatedAt?: string;
}

interface SchoolContextType {
  schools: School[];
  activeSchool: School | null;
  setActiveSchool: (school: School | string) => void;
  academicYears: AcademicYearItem[];
  activeAcademicYear: AcademicYearItem | null;
  setActiveAcademicYear: (ay: AcademicYearItem | string) => void;
  loading: boolean;
  refetchSchools: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const { schools: allSchools, activeSchool, loading } = useAppSelector((state) => state.school);

  // Trigger school fetch via Redux Saga
  const refetchSchools = useCallback(async () => {
    dispatch(fetchSchoolsRequest());
  }, [dispatch]);

  // Fetch schools on initial mount
  useEffect(() => {
    refetchSchools();
  }, [refetchSchools]);

  // Compute schools accessible to the current logged-in user based on role
  const userSchools = React.useMemo(() => {
    if (!isAuthenticated || !user) return [];

    const userSchoolIds: string[] = (user.schoolIds || []).filter(
      (id): id is string => id !== null && id !== undefined && String(id).trim() !== "" && String(id) !== "null"
    );

    // Admins without explicit school list get access to all schools in the system
    if (user.role === "admin" && userSchoolIds.length === 0) {
      return allSchools;
    }

    // Non-admins (teachers/students) must be restricted to their explicit schools.
    if (userSchoolIds.length === 0) {
      return allSchools.slice(0, 1);
    }

    return allSchools.filter((school) => userSchoolIds.includes(school.id));
  }, [allSchools, user, isAuthenticated]);

  // Handle setting active school and dispatching to Redux store
  const setActiveSchool = useCallback(
    (schoolInput: School | string) => {
      let selected: School | null = null;
      if (typeof schoolInput === "string") {
        selected = allSchools.find((s) => s.id === schoolInput) || null;
      } else {
        selected = schoolInput;
      }

      if (selected) {
        dispatch(setActiveSchoolAction(selected));
      }
    },
    [allSchools, dispatch]
  );

  // Sync active school when user logs in or list of user schools changes
  useEffect(() => {
    if (!isAuthenticated || userSchools.length === 0) {
      dispatch(setActiveSchoolAction(null));
      return;
    }

    const pathMatch = window.location.pathname.match(/\/school\/([^/]+)/);
    const urlSchoolId = pathMatch ? pathMatch[1] : new URLSearchParams(window.location.search).get("schoolId");
    const savedId = urlSchoolId || localStorage.getItem("sms_active_school_id");
    const matchedSaved = userSchools.find((s) => s.id === savedId);

    if (matchedSaved) {
      dispatch(setActiveSchoolAction(matchedSaved));
    } else if (userSchools.length > 0) {
      dispatch(setActiveSchoolAction(userSchools[0]));
    }
  }, [isAuthenticated, userSchools, dispatch]);

  const [activeAcademicYear, setActiveAcademicYearState] = useState<AcademicYearItem | null>(null);

  const academicYears = React.useMemo<AcademicYearItem[]>(() => {
    if (!activeSchool) return [];
    if (activeSchool.academicYears && activeSchool.academicYears.length > 0) {
      return activeSchool.academicYears;
    }
    if (activeSchool.academicYear) {
      return [
        {
          schoolAcademicYearId: activeSchool.schoolAcademicYearId || "0",
          academicYearId: "0",
          academicYear: activeSchool.academicYear,
          isCurrent: true,
        },
      ];
    }
    return [];
  }, [activeSchool]);

  useEffect(() => {
    if (academicYears.length > 0) {
      const savedYear = localStorage.getItem("sms_active_academic_year");
      const matched = academicYears.find((ay) => ay.academicYear === savedYear);
      const current = matched || academicYears.find((ay) => ay.isCurrent) || academicYears[0];
      setActiveAcademicYearState(current);
      localStorage.setItem("sms_active_academic_year", current.academicYear);
      if (current.academicYearId) {
        localStorage.setItem("sms_academic_year_id", current.academicYearId);
      }
    } else {
      setActiveAcademicYearState(null);
      localStorage.removeItem("sms_active_academic_year");
      localStorage.removeItem("sms_academic_year_id");
    }
  }, [academicYears]);

  const setActiveAcademicYear = useCallback(
    (ayInput: AcademicYearItem | string) => {
      let selected: AcademicYearItem | null = null;
      if (typeof ayInput === "string") {
        selected = academicYears.find(
          (ay) => ay.academicYearId === ayInput || ay.academicYear === ayInput
        ) || null;
      } else {
        selected = ayInput;
      }

      if (selected) {
        setActiveAcademicYearState(selected);
        localStorage.setItem("sms_active_academic_year", selected.academicYear);
        if (selected.academicYearId) {
          localStorage.setItem("sms_academic_year_id", selected.academicYearId);
        }
      }
    },
    [academicYears]
  );

  return (
    <SchoolContext.Provider
      value={{
        schools: userSchools,
        activeSchool,
        setActiveSchool,
        academicYears,
        activeAcademicYear,
        setActiveAcademicYear,
        loading,
        refetchSchools,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error("useSchool must be used within a SchoolProvider");
  }
  return context;
}
