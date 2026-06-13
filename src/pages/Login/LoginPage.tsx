import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Mail, Lock, Eye, EyeOff, School, ArrowRight, Shield, BookOpen, GraduationCap, ChevronDown } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, getDemoCredentials, logout, isAuthenticated } = useAuth();
  const { schools, setActiveSchool } = useSchool();
  const [showSchoolSelect, setShowSchoolSelect] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const navigate = useNavigate();

  // Monitor user login state and schools list to decide whether to show school selector
  React.useEffect(() => {
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
    setLoading(true);
    setError("");

    const result = await login(email, password);
    if (result.success) {
      setJustLoggedIn(true);
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    const demoCreds = getDemoCredentials();
    const cred = demoCreds.find((c) => c.email === demoEmail);
    const pass = cred ? cred.password : "demo123";

    setEmail(demoEmail);
    setPassword(pass);
    setLoading(true);
    setError("");

    const result = await login(demoEmail, pass);
    if (result.success) {
      setJustLoggedIn(true);
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
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
                    onClick={() => {
                      const school = schools.find((s) => s.id === selectedSchoolId) || schools[0];
                      setActiveSchool(school);
                      navigate("/dashboard");
                    }}
                    className="w-full h-11 mt-2 font-bold animate-fade-in"
                  >
                    Continue to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2 animate-pulse-glow" />
                  </Button>

                  <button
                    onClick={() => {
                      setShowSchoolSelect(false);
                      setJustLoggedIn(false);
                      setLoading(false);
                      logout();
                    }}
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">
                        Email
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
                          onClick={() => handleDemoLogin(cred.email)}
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
