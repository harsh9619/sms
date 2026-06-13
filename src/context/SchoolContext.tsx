import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { fetchSchools } from "../lib/api";
import { useAuth } from "./AuthContext";

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
  const { user, isAuthenticated } = useAuth();
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [activeSchool, setActiveSchoolState] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all schools from backend
  const refetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSchools();
      setAllSchools(data);
    } catch (err) {
      console.error("SchoolContext: fetchSchools failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
    // If none are specified, they fallback safely to only the first school in the system to prevent unauthorized access.
    if (userSchoolIds.length === 0) {
      return allSchools.slice(0, 1);
    }
    
    return allSchools.filter((school) => userSchoolIds.includes(school.id));
  }, [allSchools, user, isAuthenticated]);

  // Handle setting active school and syncing with localStorage
  const setActiveSchool = useCallback((schoolInput: School | string) => {
    let selected: School | null = null;
    if (typeof schoolInput === "string") {
      selected = allSchools.find((s) => s.id === schoolInput) || null;
    } else {
      selected = schoolInput;
    }

    if (selected) {
      setActiveSchoolState(selected);
      localStorage.setItem("sms_active_school_id", selected.id);
      window.dispatchEvent(new Event("sms_active_school_changed"));
    }
  }, [allSchools]);

  // Sync active school when user logs in or list of user schools changes
  useEffect(() => {
    if (!isAuthenticated || userSchools.length === 0) {
      setActiveSchoolState(null);
      localStorage.removeItem("sms_active_school_id");
      window.dispatchEvent(new Event("sms_active_school_changed"));
      return;
    }

    const savedId = localStorage.getItem("sms_active_school_id");
    const matchedSaved = userSchools.find((s) => s.id === savedId);

    if (matchedSaved) {
      setActiveSchoolState(matchedSaved);
      window.dispatchEvent(new Event("sms_active_school_changed"));
    } else if (userSchools.length === 1) {
      // Default to the single accessible school
      const defaultSchool = userSchools[0];
      setActiveSchoolState(defaultSchool);
      localStorage.setItem("sms_active_school_id", defaultSchool.id);
      window.dispatchEvent(new Event("sms_active_school_changed"));
    } else {
      // If there are multiple schools and no saved choice, default to the first one
      const defaultSchool = userSchools[0];
      setActiveSchoolState(defaultSchool);
      localStorage.setItem("sms_active_school_id", defaultSchool.id);
      window.dispatchEvent(new Event("sms_active_school_changed"));
    }

  }, [isAuthenticated, userSchools]);

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
