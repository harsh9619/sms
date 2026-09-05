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



interface AuthContextType {
  user: User | null;
  originalUser: User | null;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getDemoCredentials: () => { email: string; password: string; role: UserRole }[];
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
      dispatch(fetchAuthAllUsersRequest());
    }
  }, [user, dispatch]);


  // Prefetch users via Redux Saga to enable server-side auth simulation
  useEffect(() => {
    dispatch(fetchUsersRequest());
  }, [dispatch]);

  // Fetch current user via Redux Saga if token exists but user state is empty
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUserRequest());
    }
  }, [token, user, dispatch]);

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(loginRequest({ email, password }));
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
      { email: "admin@school.com", password: "admin123", role: "admin" as UserRole },
      { email: "teacher@school.com", password: "admin123", role: "teacher" as UserRole },
      { email: "student@school.com", password: "admin123", role: "student" as UserRole },
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
