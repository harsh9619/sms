import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { useTheme } from "../../context/ThemeContext";
import { Shield, BookOpen, GraduationCap } from "lucide-react";
import { LoginUI } from "../../components/login/LoginUI";

export function LoginContainer() {
    const [loginType, setLoginType] = useState<"email" | "mobile">("email");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login, getDemoCredentials, logout, isAuthenticated } = useAuth();
    const { schools, setActiveSchool } = useSchool();
    const { setTheme } = useTheme();
    const [showSchoolSelect, setShowSchoolSelect] = useState(false);
    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const navigate = useNavigate();

    // Reset theme to default on login page
    useEffect(() => {
        setTheme("default");
        localStorage.setItem("sms_theme", "default");
    }, [setTheme]);

    // Monitor user login state and schools list to decide whether to show school selector
    useEffect(() => {
        const activeSchoolId = localStorage.getItem("sms_active_school_id");
        const isPendingSelection = justLoggedIn || (isAuthenticated && !activeSchoolId);
        if (isPendingSelection && schools.length > 0) {
            const defaultSchool = schools.find((s) => s.id === activeSchoolId) || schools[0];
            setActiveSchool(defaultSchool);
            navigate("/dashboard");
        }
    }, [schools, justLoggedIn, isAuthenticated, navigate, setActiveSchool]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (loginType === "mobile") {
            const digitsOnly = identifier.replace(/\D/g, "");
            if (digitsOnly.length !== 10) {
                setError("Mobile number must be exactly 10 digits.");
                return;
            }
        } else {
            if (!identifier.trim() || !identifier.includes("@")) {
                setError("Please enter a valid email address.");
                return;
            }
        }

        setLoading(true);

        const result = await login(identifier, password, loginType);
        if (result.success) {
            setJustLoggedIn(true);
        } else {
            setError(result.error || "Login failed");
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demoKey: string) => {
        const demoCreds = getDemoCredentials();
        const cred = demoCreds.find((c) => c.email === demoKey || c.phone === demoKey);
        
        let targetValue = demoKey;

        if (cred) {
            targetValue = loginType === "mobile" ? (cred.phone || "9876543210") : cred.email;
        }
        const pass = cred ? cred.password : "admin123";

        setIdentifier(targetValue);
        setPassword(pass);
        setLoading(true);
        setError("");

        const result = await login(targetValue, pass, loginType);
        if (result.success) {
            setJustLoggedIn(true);
        } else {
            setError(result.error || "Login failed");
            setLoading(false);
        }
    };

    const handleSelectSchoolSubmit = () => {
        const school = schools.find((s) => s.id === selectedSchoolId) || schools[0];
        setActiveSchool(school);
        navigate("/dashboard");
    };

    const handleBackToSignIn = () => {
        setShowSchoolSelect(false);
        setJustLoggedIn(false);
        setLoading(false);
        logout();
    };

    const demoCredentials = getDemoCredentials();
    const roleIcons: Record<string, React.ReactNode> = {
        admin: <Shield className="h-4 w-4" />,
        teacher: <BookOpen className="h-4 w-4" />,
        student: <GraduationCap className="h-4 w-4" />,
    };

    const roleColors: Record<string, string> = {
        admin: "from-red-500 to-orange-500",
        teacher: "from-blue-500 to-cyan-500",
        student: "from-green-500 to-emerald-500",
    };

    return (
        <LoginUI
            loginType={loginType}
            setLoginType={(type) => {
                setLoginType(type);
                setError("");
                setIdentifier("");
            }}
            email={identifier}
            setEmail={setIdentifier}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            error={error}
            showSchoolSelect={showSchoolSelect}
            selectedSchoolId={selectedSchoolId}
            setSelectedSchoolId={setSelectedSchoolId}
            schools={schools}
            demoCredentials={demoCredentials}
            roleIcons={roleIcons}
            roleColors={roleColors}
            onFormSubmit={handleSubmit}
            onDemoLogin={handleDemoLogin}
            onSelectSchoolSubmit={handleSelectSchoolSubmit}
            onBackToSignIn={handleBackToSignIn}
        />
    );
}
