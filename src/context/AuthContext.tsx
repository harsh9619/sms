import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, UserRole } from "../types";
import { useAppDispatch, useAppSelector } from "../saga/hooks";
import {
  loginRequest,
  fetchCurrentUserRequest,
  fetchAuthAllUsersRequest,
  setSimulatedRole as setSimulatedRoleAction,
  logout as logoutAction,
  fetchUsersRequest,
} from "../saga";



import { hasModuleAccess, hasPermission as checkPermission, ACFAction } from "../constants/navigation";

interface AuthContextType {
  user: User | null;
  originalUser: User | null;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, loginType?: "email" | "mobile" | "username") => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getDemoCredentials: () => { userName: string; email: string; phone: string; password: string; role: UserRole }[];
  canAccessModule: (moduleKey: string) => boolean;
  hasPermission: (moduleKey: string, action: ACFAction) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, token, simulatedRole, allUsers, error: authError } = useAppSelector((state) => state.auth);

  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(() => {
    return localStorage.getItem("sms_active_school_id");
  });

  // Track active school ID updates reactive to SchoolContext updates
  useEffect(() => {
    const handleSchoolChange = () => {
      setActiveSchoolId(localStorage.getItem("sms_active_school_id"));
    };
    window.addEventListener("sms_active_school_changed", handleSchoolChange);
    return () => {
      window.removeEventListener("sms_active_school_changed", handleSchoolChange);
    };
  }, []);

  // Fetch all users via Redux Saga if user is admin
  useEffect(() => {
    if (user && user.role === "admin") {
      dispatch(fetchAuthAllUsersRequest(activeSchoolId || undefined));
    }
  }, [user, activeSchoolId, dispatch]);


  // Prefetch users via Redux Saga when authenticated to enable server-side auth simulation
  useEffect(() => {
    if (token || user) {
      dispatch(fetchUsersRequest(activeSchoolId || undefined));
    }
  }, [token, user, activeSchoolId, dispatch]);

  // Fetch current user via Redux Saga if token exists but user state is empty
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUserRequest());
    }
  }, [token, user, dispatch]);

  const login = useCallback(
    async (identifier: string, password: string, loginType?: "email" | "mobile" | "username") => {
      const isMobile = loginType === "mobile" || (/^\d+$/.test(identifier.replace(/\D/g, "")) && !identifier.includes("@") && loginType !== "username");
      const isUsername = loginType === "username";
      
      let payload;
      if (isMobile) {
        payload = { phone: identifier.replace(/\D/g, ""), identifier, loginType: "mobile" as const, password };
      } else if (isUsername) {
        payload = { username: identifier.trim(), user_name: identifier.trim(), identifier: identifier.trim(), loginType: "username" as const, password };
      } else {
        payload = { email: identifier.trim(), identifier: identifier.trim(), loginType: "email" as const, password };
      }

      dispatch(loginRequest(payload));
      // Return a promise that resolves based on Redux state outcome
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        const checkInterval = setInterval(() => {
          const currentToken = localStorage.getItem("sms_token");
          if (currentToken) {
            clearInterval(checkInterval);
            resolve({ success: true });
          } else {
            const err = localStorage.getItem("sms_auth_error");
            if (err) {
              clearInterval(checkInterval);
              localStorage.removeItem("sms_auth_error");
              resolve({ success: false, error: err });
            }
          }
        }, 100);
        // Timeout safeguard
        setTimeout(() => {
          clearInterval(checkInterval);
          if (localStorage.getItem("sms_token")) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: authError || "Login request timed out" });
          }
        }, 2500);
      });
    },
    [dispatch, authError]
  );

  const setSimulatedRole = useCallback(
    (role: UserRole | null) => {
      dispatch(setSimulatedRoleAction(role));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const getDemoCredentials = useCallback(() => {
    return [
      { userName: "admin", email: "admin@greenwood.edu.in", phone: "9876543210", password: "admin123", role: "admin" as UserRole },
      { userName: "teacher", email: "anita.verma@greenwood.edu.in", phone: "9800000001", password: "admin123", role: "teacher" as UserRole },
      { userName: "student", email: "student_101@greenwood.edu.in", phone: "9600000001", password: "admin123", role: "student" as UserRole },
    ];
  }, []);

  // Intercept returned user profile to simulate the switched role
  const effectiveUser = React.useMemo(() => {
    if (!user) return null;
    if (user.role !== "admin" || !simulatedRole || simulatedRole === "admin") {
      return user;
    }

    const matched = allUsers.find(
      (u) => u.role === simulatedRole && u.schoolIds && u.schoolIds.includes(activeSchoolId || "")
    );

    if (matched) {
      return {
        ...user,
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: simulatedRole,
      };
    }

    // Dynamic fallbacks matching seeded user details for robust UX
    return {
      ...user,
      id: simulatedRole === "teacher" ? "t1" : "student_user_1001",
      name: simulatedRole === "teacher" ? "Priya Sharma" : "Arjun Singh",
      email: simulatedRole === "teacher" ? "teacher@school.com" : "student@school.com",
      role: simulatedRole,
    };
  }, [user, simulatedRole, allUsers, activeSchoolId]);

  const canAccessModule = useCallback(
    (moduleKey: string) => {
      return hasModuleAccess(effectiveUser?.role, moduleKey);
    },
    [effectiveUser?.role]
  );

  const hasPermissionCallback = useCallback(
    (moduleKey: string, action: ACFAction) => {
      return checkPermission(effectiveUser?.role, moduleKey, action);
    },
    [effectiveUser?.role]
  );

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        originalUser: user,
        simulatedRole,
        setSimulatedRole,
        isAuthenticated: !!user,
        login,
        logout,
        getDemoCredentials,
        canAccessModule,
        hasPermission: hasPermissionCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
