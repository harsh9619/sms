import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchSchoolsRequest, setActiveSchool as setActiveSchoolAction } from "../store/slices/schoolSlice";

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  theme?: string;
}

interface SchoolContextType {
  schools: School[];
  activeSchool: School | null;
  setActiveSchool: (school: School | string) => void;
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

    const savedId = localStorage.getItem("sms_active_school_id");
    const matchedSaved = userSchools.find((s) => s.id === savedId);

    if (matchedSaved) {
      dispatch(setActiveSchoolAction(matchedSaved));
    } else if (userSchools.length === 1) {
      dispatch(setActiveSchoolAction(userSchools[0]));
    } else {
      dispatch(setActiveSchoolAction(userSchools[0]));
    }
  }, [isAuthenticated, userSchools, dispatch]);

  return (
    <SchoolContext.Provider
      value={{
        schools: userSchools,
        activeSchool,
        setActiveSchool,
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
