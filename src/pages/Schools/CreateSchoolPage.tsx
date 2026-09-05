import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import { createSchoolRequest, fetchSchoolsRequest } from "../../saga";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import schoolService, { type MasterTheme } from "../../Services/school.service";
import {
  School,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Hash,
  Sun,
  Moon,
  Palette,
} from "lucide-react";

// ─── Redux wiring ─────────────────────────────────────────────────────────────

const mapStateToProps = (state: AppState) => ({
  creating: (state.school as any).creating as boolean,
  createError: (state.school as any).createError as string | null,
  schools: state.school.schools,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createSchoolRequest: (payload: any) => dispatch(createSchoolRequest(payload)),
  fetchSchoolsRequest: () => dispatch(fetchSchoolsRequest()),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof mapper>;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  slug: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  board: string;
  academicYear: string;
  maxStudents: string;
  subscription: string;
  isActive: boolean;
  theme: string;
  appearanceMode: "light" | "dark";
}

const SCHOOL_TYPES = ["Primary School", "Secondary School", "Higher Secondary", "College", "University", "Other"];
const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge", "Other"];
const SUBSCRIPTION_TIERS = [
  { value: "free",       label: "Free",       desc: "Up to 100 students" },
  { value: "basic",      label: "Basic",      desc: "Up to 500 students" },
  { value: "premium",    label: "Premium",    desc: "Up to 2000 students" },
  { value: "enterprise", label: "Enterprise", desc: "Unlimited students" },
];

const STEPS = [
  { id: 1, label: "Identity",   icon: School,  desc: "Name & type" },
  { id: 2, label: "Contact",    icon: MapPin,  desc: "Address & info" },
  { id: 3, label: "Config",     icon: BookOpen,desc: "Plan & settings" },
  { id: 4, label: "Appearance", icon: Palette, desc: "Theme & mode" },
];

const INITIAL_FORM: FormData = {
  name: "", slug: "", type: "Secondary School",
  address: "", phone: "", email: "",
  board: "CBSE",
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  maxStudents: "500", subscription: "basic", isActive: true,
  theme: "default", appearanceMode: "light",
};

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Component ────────────────────────────────────────────────────────────────

function CreateSchoolPageContent({
  creating, createError, schools, createSchoolRequest, fetchSchoolsRequest,
}: PropsFromRedux) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [createdSchool, setCreatedSchool] = useState<any>(null);
  const [prevCount, setPrevCount] = useState(schools.length);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [masterThemes, setMasterThemes] = useState<MasterTheme[]>([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  // Load master themes from DB via API
  useEffect(() => {
    setThemesLoading(true);
    schoolService.getMasterThemes()
      .then(setMasterThemes)
      .catch(() => setMasterThemes([
        { id: 1, name: "default", label: "Ocean Blue",   color: "#3b82f6", sortOrder: 1 },
        { id: 2, name: "emerald", label: "Emerald",      color: "#10b981", sortOrder: 2 },
        { id: 3, name: "purple",  label: "Royal Purple", color: "#8b5cf6", sortOrder: 3 },
        { id: 4, name: "rose",    label: "Rose",         color: "#f43f5e", sortOrder: 4 },
        { id: 5, name: "amber",   label: "Sunset Amber", color: "#f97316", sortOrder: 5 },
      ]))
      .finally(() => setThemesLoading(false));
  }, []);

  // Detect successful creation
  useEffect(() => {
    if (submitted && !creating) {
      if (schools.length > prevCount) {
        setCreatedSchool(schools[schools.length - 1]);
      } else if (createError) {
        setSubmitted(false);
      }
    }
  }, [creating, schools, submitted, prevCount, createError]);

  const set = (k: keyof FormData, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleNameChange = (v: string) => {
    setForm((f) => ({ ...f, name: v, slug: slugify(v) }));
    setErrors((e) => ({ ...e, name: undefined, slug: undefined }));
  };

  const validate = (s: number) => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (s === 1) {
      if (!form.name.trim()) errs.name = "School name is required.";
      if (!form.slug.trim()) errs.slug = "Slug is required.";
      else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = "Only lowercase letters, numbers, hyphens.";
    }
    if (s === 2 && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email.";
    if (s === 3) {
      if (!form.academicYear.trim()) errs.academicYear = "Academic year is required.";
      if (form.maxStudents && isNaN(Number(form.maxStudents))) errs.maxStudents = "Must be a number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate(step)) setStep((s) => Math.min(s + 1, 4)); };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = () => {
    if (!validate(4)) return;
    setPrevCount(schools.length);
    setSubmitted(true);
    createSchoolRequest({
      name: form.name.trim(), slug: form.slug.trim(), type: form.type,
      address: form.address.trim() || undefined, phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined, board: form.board || undefined,
      academicYear: form.academicYear.trim(),
      maxStudents: form.maxStudents ? Number(form.maxStudents) : undefined,
      subscription: form.subscription, isActive: form.isActive,
      theme: form.theme, appearanceMode: form.appearanceMode,
    });
    setTimeout(() => fetchSchoolsRequest(), 1200);
  };

  const activeTheme = masterThemes.find((t) => t.name === form.theme);

  // ── Success Screen ───────────────────────────────────────────────────────────
  if (createdSchool) {
    const themeObj = masterThemes.find((t) => t.name === createdSchool.theme)
      ?? masterThemes.find((t) => t.name === "default");
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-6">
        <div className="text-center space-y-6 max-w-md animate-scale-in">
          <div className="mx-auto w-20 h-20 rounded-full border-4 flex items-center justify-center"
            style={{ background: `${themeObj?.color}18`, borderColor: `${themeObj?.color}40` }}>
            <CheckCircle2 className="h-10 w-10" style={{ color: themeObj?.color }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">School Created!</h2>
            <p className="text-muted-foreground mt-2">
              <span className="font-semibold text-foreground">{createdSchool.name}</span> has been successfully registered.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border text-left text-sm space-y-2">
            {[
              ["Slug", createdSchool.slug],
              ["Theme", themeObj?.label ?? createdSchool.theme],
              ["Mode", createdSchool.appearanceMode === "dark" ? "🌙 Dark" : "☀️ Light"],
              ["Plan", createdSchool.subscription],
              ["Status", "Active"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setCreatedSchool(null); setSubmitted(false); setStep(1); setForm(INITIAL_FORM); }}>
              Create Another
            </Button>
            <Button className="flex-1" onClick={() => navigate(`/school/${createdSchool.id}/dashboard`)}>
              Go to Dashboard <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Field wrapper ────────────────────────────────────────────────────────────
  const Field = ({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
    </div>
  );

  const inputCls = (err?: string) =>
    `w-full h-10 rounded-lg border ${err ? "border-destructive" : "border-input"} bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all`;

  // ── Main Render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <School className="h-5 w-5 text-primary" />
          </div>
          Register New School
        </h1>
        <p className="text-sm text-muted-foreground pl-11">Fill in the details to onboard a new institution.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone ? "bg-primary border-primary text-primary-foreground"
                    : isActive ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/20"
                    : "bg-muted/50 border-border text-muted-foreground"
                }`}>
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                  <p className="text-[10px] text-muted-foreground/70 hidden sm:block">{s.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-6 rounded transition-all duration-500 ${step > s.id ? "bg-primary" : "bg-border"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Card */}
      <Card className="border border-border/80 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/40">
          <CardTitle className="text-base">
            {["", "School Identity", "Contact Information", "Configuration & Plan", "Theme & Appearance"][step]}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Provide the school's name and institutional type."}
            {step === 2 && "Add address, phone, and email details."}
            {step === 3 && "Set up academic year, student limit, and subscription."}
            {step === 4 && "Choose a color theme and display mode for this school's dashboard."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">

          {/* Step 1 — Identity */}
          {step === 1 && (
            <div className="space-y-5">
              <Field label="School Name" error={errors.name} required>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input id="school-name" className={`${inputCls(errors.name)} pl-9`}
                    placeholder="e.g. Greenfield Public School" value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)} autoFocus />
                </div>
              </Field>

              <Field label="URL Slug" error={errors.slug} required>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input id="school-slug" className={`${inputCls(errors.slug)} pl-9 font-mono`}
                    placeholder="greenfield-public-school" value={form.slug}
                    onChange={(e) => set("slug", slugify(e.target.value))} />
                </div>
                <p className="text-[10px] text-muted-foreground/60">Auto-generated. Used in URLs and API calls.</p>
              </Field>

              <Field label="School Type" required>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SCHOOL_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => set("type", t)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                        form.type === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                      }`}>{t}</button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Step 2 — Contact */}
          {step === 2 && (
            <div className="space-y-5">
              <Field label="Address">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input id="school-address" className={`${inputCls()} pl-9`} placeholder="123 Education Lane, City"
                    value={form.address} onChange={(e) => set("address", e.target.value)} />
                </div>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Phone Number">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input id="school-phone" className={`${inputCls()} pl-9`} placeholder="+91 98765 43210"
                      value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </div>
                </Field>
                <Field label="Email Address" error={errors.email}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input id="school-email" type="email" className={`${inputCls(errors.email)} pl-9`} placeholder="admin@school.edu"
                      value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                </Field>
              </div>
              <Field label="Curriculum / Board">
                <div className="grid grid-cols-3 gap-2">
                  {BOARDS.map((b) => (
                    <button key={b} type="button" onClick={() => set("board", b)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        form.board === b ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                      }`}>{b}</button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Step 3 — Config */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Academic Year" error={errors.academicYear} required>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input id="school-academic-year" className={`${inputCls(errors.academicYear)} pl-9`} placeholder="2025-2026"
                      value={form.academicYear} onChange={(e) => set("academicYear", e.target.value)} />
                  </div>
                </Field>
                <Field label="Max Students" error={errors.maxStudents}>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input id="school-max-students" className={`${inputCls(errors.maxStudents)} pl-9`} placeholder="500"
                      value={form.maxStudents} onChange={(e) => set("maxStudents", e.target.value)} />
                  </div>
                </Field>
              </div>

              <Field label="Subscription Plan">
                <div className="grid grid-cols-2 gap-3">
                  {SUBSCRIPTION_TIERS.map((t) => (
                    <button key={t.value} type="button" onClick={() => set("subscription", t.value)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        form.subscription === t.value ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-muted/20 hover:border-primary/40"
                      }`}>
                      <p className={`text-sm font-bold ${form.subscription === t.value ? "text-primary" : "text-foreground"}`}>
                        {t.label}
                        {t.value === "premium" && <Sparkles className="inline h-3.5 w-3.5 ml-1 text-amber-500" />}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="School Status">
                <button type="button" onClick={() => set("isActive", !form.isActive)}
                  className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all ${
                    form.isActive ? "border-emerald-500/50 bg-emerald-500/5" : "border-border bg-muted/20"
                  }`}>
                  <div className={`h-5 w-10 rounded-full relative flex-shrink-0 transition-colors ${form.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${form.isActive ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {form.isActive ? "Active" : "Inactive"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {form.isActive ? "School will be visible and accessible." : "School will be hidden from users."}
                    </p>
                  </div>
                </button>
              </Field>
            </div>
          )}

          {/* Step 4 — Theme & Appearance */}
          {step === 4 && (
            <div className="space-y-6">

              {/* Theme Color (from master_themes DB table) */}
              <Field label="Theme Color">
                {themesLoading ? (
                  <div className="flex items-center gap-3 py-6">
                    <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading themes from database…</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {masterThemes.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        id={`theme-${t.name}`}
                        onClick={() => set("theme", t.name)}
                        className={`relative flex flex-col items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                          form.theme === t.name ? "shadow-md" : "border-border bg-muted/20"
                        }`}
                        style={form.theme === t.name ? { borderColor: t.color, background: `${t.color}0d` } : {}}
                      >
                        {form.theme === t.name && (
                          <div className="absolute top-1.5 right-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" style={{ color: t.color }} />
                          </div>
                        )}
                        <div
                          className="h-12 w-12 rounded-full ring-2 ring-white/60 dark:ring-black/30 transition-transform duration-200"
                          style={{
                            backgroundColor: t.color,
                            transform: form.theme === t.name ? "scale(1.12)" : "scale(1)",
                            boxShadow: form.theme === t.name ? `0 4px 16px ${t.color}50` : undefined,
                          }}
                        />
                        <span className="text-[11px] font-semibold text-center leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {activeTheme && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
                    style={{ background: `${activeTheme.color}12`, color: activeTheme.color }}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: activeTheme.color }} />
                    Selected: <strong>{activeTheme.label}</strong>&nbsp;({activeTheme.color})
                  </div>
                )}
              </Field>

              {/* Appearance Mode */}
              <Field label="Appearance Mode">
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" id="appearance-light" onClick={() => set("appearanceMode", "light")}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                      form.appearanceMode === "light"
                        ? "border-amber-400 bg-amber-50/60 dark:bg-amber-900/10 shadow-md shadow-amber-200/50"
                        : "border-border bg-muted/20 hover:border-amber-300/50"
                    }`}>
                    <div className="h-14 w-20 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                      <Sun className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${form.appearanceMode === "light" ? "text-amber-600" : "text-foreground"}`}>Light Mode</p>
                      <p className="text-[10px] text-muted-foreground">Bright & clean interface</p>
                    </div>
                    {form.appearanceMode === "light" && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                  </button>

                  <button type="button" id="appearance-dark" onClick={() => set("appearanceMode", "dark")}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                      form.appearanceMode === "dark"
                        ? "border-blue-500 bg-slate-900/10 shadow-md shadow-blue-900/20"
                        : "border-border bg-muted/20 hover:border-blue-400/40"
                    }`}>
                    <div className="h-14 w-20 rounded-lg bg-gray-900 border border-gray-700 shadow-sm flex items-center justify-center">
                      <Moon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${form.appearanceMode === "dark" ? "text-blue-400" : "text-foreground"}`}>Dark Mode</p>
                      <p className="text-[10px] text-muted-foreground">Easy on the eyes</p>
                    </div>
                    {form.appearanceMode === "dark" && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                  </button>
                </div>
              </Field>

              {/* Full summary before submitting */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Full Summary</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  {[
                    ["Name", form.name || "—"],
                    ["Slug", form.slug || "—"],
                    ["Type", form.type],
                    ["Board", form.board],
                    ["Email", form.email || "—"],
                    ["Academic Year", form.academicYear],
                    ["Plan", form.subscription],
                    ["Max Students", form.maxStudents || "—"],
                    ["Theme", activeTheme?.label ?? form.theme],
                    ["Mode", form.appearanceMode === "dark" ? "🌙 Dark" : "☀️ Light"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium text-right truncate max-w-[110px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error banner */}
          {createError && submitted && (
            <div className="mt-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{createError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={step === 1 ? () => navigate(-1) : handleBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />{step === 1 ? "Cancel" : "Back"}
        </Button>

        {step < 4 ? (
          <Button onClick={handleNext} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={creating} className="gap-2 min-w-[140px]">
            {creating ? (
              <><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Creating…</>
            ) : (
              <><School className="h-4 w-4" />Create School</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export const CreateSchoolPage = mapper(CreateSchoolPageContent);
