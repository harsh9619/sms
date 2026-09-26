import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Mail, Phone, User as UserIcon, Lock, Eye, EyeOff, School, ArrowRight, Shield, BookOpen, GraduationCap, ChevronDown } from "lucide-react";
import type { School as SchoolType } from "../../context/SchoolContext";

export interface LoginUIProps {
    loginType?: "username" | "email" | "mobile";
    setLoginType?: (type: "username" | "email" | "mobile") => void;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    showPassword: boolean;
    setShowPassword: (val: boolean) => void;
    loading: boolean;
    error: string;
    showSchoolSelect: boolean;
    selectedSchoolId: string;
    setSelectedSchoolId: (val: string) => void;
    schools: SchoolType[];
    demoCredentials: Array<{ role: string; email: string; phone?: string; userName?: string }>;
    roleIcons: Record<string, React.ReactNode>;
    roleColors: Record<string, string>;
    onFormSubmit: (e: React.FormEvent) => void;
    onDemoLogin: (emailOrPhoneOrUser: string) => void;
    onSelectSchoolSubmit: () => void;
    onBackToSignIn: () => void;
}

export function LoginUI({
    loginType,
    setLoginType,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    showSchoolSelect,
    selectedSchoolId,
    setSelectedSchoolId,
    schools,
    demoCredentials,
    roleIcons,
    roleColors,
    onFormSubmit,
    onDemoLogin,
    onSelectSchoolSubmit,
    onBackToSignIn,
}: LoginUIProps) {
    const [internalLoginType, setInternalLoginType] = useState<"username" | "email" | "mobile">("username");
    const activeLoginType = loginType || internalLoginType;

    const handleTypeChange = (type: "username" | "email" | "mobile") => {
        if (setLoginType) {
            setLoginType(type);
        } else {
            setInternalLoginType(type);
        }
        setEmail("");
    };

    return (
        <div className="min-h-screen flex animate-fade-in">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-accent/80 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-sidebar-accent/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-sidebar-accent/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
                    <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/20">
                        <School className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 text-center">EduManage</h1>
                    <p className="text-lg text-white/70 text-center max-w-md mb-12">
                        A modern school management system designed to streamline education administration.
                    </p>

                    {/* Feature Cards */}
                    <div className="space-y-4 w-full max-w-sm">
                        {[
                            { title: "Role-Based Access", desc: "Admin, Teacher & Student portals" },
                            { title: "Smart Attendance", desc: "Image-to-Excel OCR processing" },
                            { title: "Data Management", desc: "Complete student & staff records" },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                            >
                                <div className="h-10 w-10 rounded-lg bg-sidebar-accent/30 flex items-center justify-center flex-shrink-0">
                                    <div className="h-2 w-2 rounded-full bg-sidebar-accent animate-pulse-glow" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                                    <p className="text-xs text-white/50">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form / School Selection */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                            <School className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">EduManage</h1>
                            <p className="text-xs text-muted-foreground">School Management</p>
                        </div>
                    </div>

                    <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl transition-all duration-300">
                        {showSchoolSelect ? (
                            <>
                                <CardHeader className="text-center pb-2 animate-scale-in">
                                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-inner">
                                        <School className="h-6 w-6 animate-pulse-glow" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">Select School</CardTitle>
                                    <CardDescription>Choose a school to continue to your dashboard</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-2 animate-scale-in">
                                    <div className="space-y-2 text-left">
                                        <label className="text-sm font-semibold text-muted-foreground" htmlFor="school-select">
                                            Select School
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="school-select"
                                                value={selectedSchoolId}
                                                onChange={(e) => setSelectedSchoolId(e.target.value)}
                                                className="w-full h-12 rounded-xl border border-border bg-gradient-to-b from-background to-muted/20 px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer font-medium text-foreground transition-all"
                                            >
                                                {schools.map((school) => (
                                                    <option key={school.id} value={school.id} className="bg-card text-foreground">
                                                        {school.name} ({school.type || "School"})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={onSelectSchoolSubmit}
                                        className="w-full h-11 mt-2 font-bold animate-fade-in"
                                    >
                                        Continue to Dashboard
                                        <ArrowRight className="h-4 w-4 ml-2 animate-pulse-glow" />
                                    </Button>

                                    <button
                                        onClick={onBackToSignIn}
                                        className="w-full mt-2 text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                                    >
                                        Back to Sign In
                                    </button>
                                </CardContent>
                            </>
                        ) : (
                            <>
                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                                    <CardDescription>Sign in to your account to continue</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={onFormSubmit} className="space-y-4">
                                        {error && (
                                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                                                {error}
                                            </div>
                                        )}

                                        {/* Toggle Login Method */}
                                        <div className="flex bg-muted/60 p-1 rounded-xl gap-1 border border-border/50">
                                            <button
                                                type="button"
                                                onClick={() => handleTypeChange("username")}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                                    activeLoginType === "username"
                                                        ? "bg-background text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                <UserIcon className="h-3.5 w-3.5" />
                                                Username
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleTypeChange("email")}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                                    activeLoginType === "email"
                                                        ? "bg-background text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                <Mail className="h-3.5 w-3.5" />
                                                Email
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleTypeChange("mobile")}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                                    activeLoginType === "mobile"
                                                        ? "bg-background text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                <Phone className="h-3.5 w-3.5" />
                                                Mobile
                                            </button>
                                        </div>

                                        {activeLoginType === "username" ? (
                                            <div className="space-y-2 animate-fade-in">
                                                <label className="text-sm font-medium" htmlFor="username">
                                                    Username
                                                </label>
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    placeholder="Enter your username (e.g. admin)"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    icon={<UserIcon className="h-4 w-4" />}
                                                    required
                                                />
                                            </div>
                                        ) : activeLoginType === "email" ? (
                                            <div className="space-y-2 animate-fade-in">
                                                <label className="text-sm font-medium" htmlFor="email">
                                                    Email Address
                                                </label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    icon={<Mail className="h-4 w-4" />}
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2 animate-fade-in">
                                                <label className="text-sm font-medium" htmlFor="mobile">
                                                    Mobile Number
                                                </label>
                                                <Input
                                                    id="mobile"
                                                    type="tel"
                                                    placeholder="Enter 10-digit mobile number"
                                                    value={email}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                        setEmail(val);
                                                    }}
                                                    icon={<Phone className="h-4 w-4" />}
                                                    maxLength={10}
                                                    required
                                                />
                                                <p className="text-[11px] text-muted-foreground flex justify-between">
                                                    <span>Must be exactly 10 digits</span>
                                                    <span className={email.length === 10 ? "text-emerald-500 font-semibold" : "text-muted-foreground"}>
                                                        {email.length}/10
                                                    </span>
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="password">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    icon={<Lock className="h-4 w-4" />}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                    Checking credentials...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    Sign In
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Demo Credentials */}
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <p className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">
                                            Quick Demo Access
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {demoCredentials.map((cred) => (
                                                <button
                                                    key={cred.role}
                                                    onClick={() => onDemoLogin(activeLoginType === "mobile" ? (cred.phone || cred.email) : activeLoginType === "username" ? (cred.userName || cred.email) : cred.email)}
                                                    disabled={loading}
                                                    className="relative flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group bg-gradient-to-b from-background to-muted/30"
                                                >
                                                    <div
                                                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${roleColors[cred.role]} flex items-center justify-center text-white shadow-md`}
                                                    >
                                                        {roleIcons[cred.role]}
                                                    </div>
                                                    <span className="text-xs font-semibold capitalize">{cred.role}</span>
                                                    <Badge variant="secondary" className="text-[10px] px-1.5">
                                                        Demo
                                                    </Badge>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        © 2026 EduManage. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
