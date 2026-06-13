import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, UserRole } from "../types";
import { fetchUsers, fetchAllUsers } from "../lib/api";


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
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("sms_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [simulatedRole, setSimulatedRoleState] = useState<UserRole | null>(() => {
    return (localStorage.getItem("sms_simulated_role") as UserRole) || null;
  });

  const [allUsers, setAllUsers] = useState<any[]>([]);

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

  // Fetch all users to map role switcher profiles if user is admin
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAllUsers()
        .then((data) => setAllUsers(data))
        .catch((err) => console.error("AuthContext: fetchAllUsers failed", err));
    } else {
      setAllUsers([]);
    }
  }, [user]);

  // Prefetch users from API to enable server-side auth simulation
  useEffect(() => {
    fetchUsers().catch(() => { });
  }, []);

  const login = useCallback(async (email: string) => {
    // Simulate API delay and require server users
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const users = await fetchUsers();
      const serverUser = users.find((u: User) => u.email === email);
      if (serverUser) {
        setUser(serverUser);
        localStorage.setItem("sms_user", JSON.stringify(serverUser));
        return { success: true };
      }
    } catch (err) {
      // server unavailable or error
      console.error("Auth: fetchUsers failed", err);
    }
    return { success: false, error: "Invalid email or password" };
  }, []);

  const setSimulatedRole = useCallback((role: UserRole | null) => {
    setSimulatedRoleState(role);
    if (role) {
      localStorage.setItem("sms_simulated_role", role);
    } else {
      localStorage.removeItem("sms_simulated_role");
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSimulatedRoleState(null);
    localStorage.removeItem("sms_user");
    localStorage.removeItem("sms_simulated_role");
    localStorage.removeItem("sms_active_school_id");
  }, []);

  const getDemoCredentials = useCallback(() => {
    return [
      { email: "admin@school.com", password: "admin123", role: "admin" as UserRole },
      { email: "teacher@school.com", password: "teacher123", role: "teacher" as UserRole },
      { email: "student@school.com", password: "student123", role: "student" as UserRole },
    ];
  }, []);

  // Intercept returned user profile to simulate the switched role
  const effectiveUser = React.useMemo(() => {
    if (!user) return null;
    if (user.role !== "admin" || !simulatedRole || simulatedRole === "admin") {
      return user;
    }

    const matched = allUsers.find(
      (u) => u.role === simulatedRole && u.schoolIds && u.schoolIds.includes(activeSchoolId)
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
