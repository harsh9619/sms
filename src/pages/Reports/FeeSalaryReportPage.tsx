import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useSchool } from "../../context/SchoolContext";
// Student data is fetched from API when needed. Local fee/salary mocks are used for reporting.
import type { FeeRecord, SalaryRecord, Student, Teacher } from "../../types";
import {
  fetchFees,
  fetchSalaries,
  createFee,
  updateFee,
  deleteFee,
  createSalary,
  updateSalary,
  deleteSalary,
} from "../../lib/api";
import {
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Filter,
  X,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  generateFeeReport,
  generateFeeSummaryReport,
  generateSalaryReport,
  generateSalarySummaryReport,
} from "../../lib/reportUtils";

// Sample fee and salary data (local fixtures for reports)
const SAMPLE_FEES: FeeRecord[] = [
  {
    id: "f1",
    studentId: "s1",
    studentName: "John Doe",
    rollNumber: "101",
    class: "10",
    section: "A",
    feeType: "tuition",
    amount: 5000,
    dueDate: "2024-05-31",
    paidDate: "2024-05-15",
    status: "paid",
  },
  {
    id: "f2",
    studentId: "s2",
    studentName: "Jane Smith",
    rollNumber: "102",
    class: "10",
    section: "A",
    feeType: "tuition",
    amount: 5000,
    dueDate: "2024-05-31",
    status: "overdue",
  },
  {
    id: "f3",
    studentId: "s3",
    studentName: "Bob Johnson",
    rollNumber: "103",
    class: "10",
    section: "B",
    feeType: "transport",
    amount: 1000,
    dueDate: "2024-05-31",
    status: "pending",
  },
];

const SAMPLE_SALARIES: SalaryRecord[] = [
  {
    id: "sal1",
    teacherId: "t1",
    teacherName: "Mr. Smith",
    subject: "Mathematics",
    baseSalary: 40000,
    allowances: 5000,
    deductions: 2000,
    month: "May",
    year: 2024,
    status: "paid",
    paidDate: "2024-05-05",
  },
  {
    id: "sal2",
    teacherId: "t2",
    teacherName: "Mrs. Johnson",
    subject: "Science",
    baseSalary: 40000,
    allowances: 5000,
    deductions: 2000,
    month: "May",
    year: 2024,
    status: "pending",
  },
  {
    id: "sal3",
    teacherId: "t3",
    teacherName: "Mr. Brown",
    subject: "English",
    baseSalary: 38000,
    allowances: 4000,
    deductions: 1800,
    month: "May",
    year: 2024,
    status: "processing",
  },
];

type TabType = "fees" | "salaries";

export function FeeSalaryReportPage() {
  const { activeSchool } = useSchool();
  const [activeTab, setActiveTab] = useState<TabType>("fees");
  const [fees, setFees] = useState<FeeRecord[]>(SAMPLE_FEES);
  const [salaries, setSalaries] = useState<SalaryRecord[]>(SAMPLE_SALARIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue" | "processing">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  // Filter fees
  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const matchesSearch =
        fee.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.rollNumber.includes(searchQuery);
      const matchesStatus = filterStatus === "all" || fee.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [fees, searchQuery, filterStatus]);

  // Filter salaries
  const filteredSalaries = useMemo(() => {
    return salaries.filter((salary) => {
      const matchesSearch =
        salary.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || salary.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [salaries, searchQuery, filterStatus]);

  // Fee statistics
  const feeStats = useMemo(() => {
    return {
      total: fees.length,
      paid: fees.filter((f) => f.status === "paid").length,
      pending: fees.filter((f) => f.status === "pending").length,
      overdue: fees.filter((f) => f.status === "overdue").length,
      totalAmount: fees.reduce((sum, f) => sum + f.amount, 0),
      paidAmount: fees
        .filter((f) => f.status === "paid")
        .reduce((sum, f) => sum + f.amount, 0),
    };
  }, [fees]);

  React.useEffect(() => {
    let mounted = true;
    fetchFees()
      .then((d) => { if (mounted) setFees(d); })
      .catch(() => { /* keep SAMPLE_FEES */ });
    fetchSalaries()
      .then((d) => { if (mounted) setSalaries(d); })
      .catch(() => { /* keep SAMPLE_SALARIES */ });
    return () => { mounted = false; };
  }, [activeSchool]);

  // Salary statistics
  const salaryStats = useMemo(() => {
    return {
      total: salaries.length,
      paid: salaries.filter((s) => s.status === "paid").length,
      pending: salaries.filter((s) => s.status === "pending").length,
      processing: salaries.filter((s) => s.status === "processing").length,
      totalAmount: salaries.reduce((sum, s) => sum + (s.baseSalary + s.allowances - s.deductions), 0),
      paidAmount: salaries
        .filter((s) => s.status === "paid")
        .reduce((sum, s) => sum + (s.baseSalary + s.allowances - s.deductions), 0),
    };
  }, [salaries]);

  const handleDeleteFee = (id: string) => {
    if (!confirm("Are you sure you want to delete this fee record?")) return;
    (async () => {
      try {
        await deleteFee(id);
        setFees((prev) => prev.filter((f) => f.id !== id));
      } catch (err) {
        // fallback: optimistic remove already reverted by not applying change
        alert("Failed to delete fee record");
      }
    })();
  };

  const handleDeleteSalary = (id: string) => {
    if (!confirm("Are you sure you want to delete this salary record?")) return;
    (async () => {
      try {
        await deleteSalary(id);
        setSalaries((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        alert("Failed to delete salary record");
      }
    })();
  };

  const openAddForm = () => {
    setEditingRecord(null);
    if (activeTab === "fees") {
      setFormData({ studentName: "", rollNumber: "", feeType: "tuition", amount: 0, dueDate: new Date().toISOString().slice(0,10), status: "pending" });
    } else {
      const now = new Date();
      setFormData({ teacherName: "", subject: "", baseSalary: 0, allowances: 0, deductions: 0, month: now.toLocaleString('default', { month: 'long' }), year: now.getFullYear(), status: "pending" });
    }
    setShowModal(true);
  };

  const openEditForm = (record: any) => {
    setEditingRecord(record);
    setFormData(record);
    setShowModal(true);
  };

  const handleSave = async () => {
    // basic validation
    setFormError(null);
    if (activeTab === "fees") {
      if (!formData.studentName || !formData.rollNumber || !formData.amount) {
        setFormError("Student name, roll number and amount are required.");
        return;
      }
    } else {
      if (!formData.teacherName || !formData.subject || !formData.baseSalary) {
        setFormError("Teacher name, subject and base salary are required.");
        return;
      }
    }
    setIsSaving(true);
    try {
      // normalize numeric fields before sending
      if (activeTab === "fees") {
        formData.amount = Number(formData.amount || 0);
      } else {
        formData.baseSalary = Number(formData.baseSalary || 0);
        formData.allowances = Number(formData.allowances || 0);
        formData.deductions = Number(formData.deductions || 0);
        formData.year = Number(formData.year || new Date().getFullYear());
      }
      if (activeTab === "fees") {
        if (editingRecord) {
          const updated = await updateFee(editingRecord.id, formData);
          setFees((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
          setOperationMessage("Fee updated");
        } else {
          const created = await createFee(formData);
          setFees((prev) => [created, ...prev]);
          setOperationMessage("Fee created");
        }
      } else {
        if (editingRecord) {
          const updated = await updateSalary(editingRecord.id, formData);
          setSalaries((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          setOperationMessage("Salary updated");
        } else {
          const created = await createSalary(formData);
          setSalaries((prev) => [created, ...prev]);
          setOperationMessage("Salary created");
        }
      }
      setShowModal(false);
      setEditingRecord(null);
      setFormData({});
      // show a brief operation message
      setFormSuccess("Saved");
      setTimeout(() => setFormSuccess(null), 2500);
      setTimeout(() => setOperationMessage(null), 3000);
    } catch (err) {
      setFormError("Save failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadgeVariant = (status: string): any => {
    if (status === "paid") return "success";
    if (status === "pending") return "warning";
    if (status === "overdue") return "destructive";
    if (status === "processing") return "info";
    return "secondary";
  };

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-warning" />;
    if (status === "overdue") return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (status === "processing") return <TrendingUp className="h-4 w-4 text-info" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary" />
            Financial Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Fee and Salary Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAddForm}>
            <Plus className="h-4 w-4 mr-2" /> Add Record
          </Button>
        </div>
      </div>
      {formSuccess && (
        <div className="text-sm text-success">{operationMessage || formSuccess}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {["fees", "salaries"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as TabType);
              setFilterStatus("all");
              setSearchQuery("");
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {activeTab === "fees" ? (
          <>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">₹{feeStats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{feeStats.total} records</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-success">{feeStats.paid}</p>
                <p className="text-xs text-success">₹{feeStats.paidAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{feeStats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{feeStats.overdue}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Total Salaries</p>
                <p className="text-2xl font-bold">₹{salaryStats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{salaryStats.total} records</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-success">{salaryStats.paid}</p>
                <p className="text-xs text-success">₹{salaryStats.paidAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{salaryStats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-info">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-info">{salaryStats.processing}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder={activeTab === "fees" ? "Search by student name or roll no..." : "Search by teacher name or subject..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "paid" | "pending" | "overdue" | "processing")}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              {activeTab === "fees" && <option value="overdue">Overdue</option>}
              {activeTab === "salaries" && <option value="processing">Processing</option>}
            </select>
            <Button
              variant="outline"
              onClick={() => {
                if (activeTab === "fees") {
                  if (filteredFees.length > 0) {
                    generateFeeReport(filteredFees, { title: "Fee Report" });
                  }
                } else {
                  if (filteredSalaries.length > 0) {
                    generateSalaryReport(filteredSalaries, { title: "Salary Report" });
                  }
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (activeTab === "fees") {
                  generateFeeSummaryReport(fees);
                } else {
                  generateSalarySummaryReport(salaries);
                }
              }}
            >
              Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fees Table */}
      {activeTab === "fees" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left font-semibold">Student</th>
                    <th className="px-6 py-3 text-left font-semibold">Roll No</th>
                    <th className="px-6 py-3 text-left font-semibold">Fee Type</th>
                    <th className="px-6 py-3 text-left font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4">{fee.studentName}</td>
                      <td className="px-6 py-4">{fee.rollNumber}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{fee.feeType}</Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold">₹{fee.amount}</td>
                      <td className="px-6 py-4">{fee.dueDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(fee.status)}
                          <Badge variant={getStatusBadgeVariant(fee.status)}>
                            {fee.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFee(fee.id)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(fee)}
                            className="hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredFees.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No fee records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Salaries Table */}
      {activeTab === "salaries" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left font-semibold">Teacher</th>
                    <th className="px-6 py-3 text-left font-semibold">Subject</th>
                    <th className="px-6 py-3 text-left font-semibold">Base Salary</th>
                    <th className="px-6 py-3 text-left font-semibold">Allowances</th>
                    <th className="px-6 py-3 text-left font-semibold">Deductions</th>
                    <th className="px-6 py-3 text-left font-semibold">Net Salary</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map((salary) => (
                    <tr key={salary.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4">{salary.teacherName}</td>
                      <td className="px-6 py-4">{salary.subject}</td>
                      <td className="px-6 py-4">₹{salary.baseSalary}</td>
                      <td className="px-6 py-4">₹{salary.allowances}</td>
                      <td className="px-6 py-4">₹{salary.deductions}</td>
                      <td className="px-6 py-4 font-semibold">
                        ₹{salary.baseSalary + salary.allowances - salary.deductions}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(salary.status)}
                          <Badge variant={getStatusBadgeVariant(salary.status)}>
                            {salary.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSalary(salary.id)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(salary)}
                            className="hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSalaries.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No salary records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingRecord ? 'Edit' : 'Add'} {activeTab === 'fees' ? 'Fee' : 'Salary'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="text-sm text-destructive mb-2">{formError}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTab === 'fees' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student Name</label>
                      <Input value={formData.studentName || ''} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} placeholder="Student name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Roll Number</label>
                      <Input value={formData.rollNumber || ''} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} placeholder="Roll number" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fee Type</label>
                      <Input value={formData.feeType || ''} onChange={(e) => setFormData({ ...formData, feeType: e.target.value })} placeholder="tuition / transport" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount</label>
                      <Input value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} placeholder="Amount" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Teacher Name</label>
                      <Input value={formData.teacherName || ''} onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })} placeholder="Teacher name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input value={formData.subject || ''} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Subject" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Base Salary</label>
                      <Input value={formData.baseSalary || ''} onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })} placeholder="Base Salary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Allowances</label>
                      <Input value={formData.allowances || ''} onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })} placeholder="Allowances" />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : editingRecord ? 'Save' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
