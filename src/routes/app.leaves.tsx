import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  User,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Send,
  Building2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { api, type LeaveItem } from "@/lib/api-client";

export const Route = createFileRoute("/app/leaves")({
  head: () => ({
    meta: [
      { title: "Leave Requests — Smart Attendance System" },
      {
        name: "description",
        content: "Submit and review student leave requests and excused absence approvals.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeaveRequestsPage,
});

function LeaveRequestsPage() {
  const { role, userName, userEmail, userUsn } = useApp();
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Student New Leave Modal State
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [leaveType, setLeaveType] = useState<string>("SICK");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Admin Review Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [remarks, setRemarks] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const loadLeaves = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (role === "student") {
        const data = await api.getMyLeaveRequests();
        setLeaves(data);
      } else {
        const data = await api.getAllLeaveRequests();
        setLeaves(data);
      }
    } catch {
      // silent
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
    const interval = setInterval(() => {
      loadLeaves(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [role]);

  // Calculate Duration in Days
  const durationDays = useMemo(() => {
    if (!fromDate || !toDate) return 1;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [fromDate, toDate]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      toast.error("Please select both start and end dates.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From date cannot be after To date.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason for your leave.");
      return;
    }

    setSubmitting(true);
    try {
      await api.submitLeaveRequest({
        fromDate,
        toDate,
        leaveType,
        reason: reason.trim(),
      });
      toast.success("Leave request submitted successfully for review!");
      setIsApplyOpen(false);
      setReason("");
      loadLeaves(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedLeave) return;
    setReviewing(true);
    try {
      await api.updateLeaveStatus(selectedLeave.id, reviewAction, remarks.trim());
      toast.success(`Leave request ${reviewAction.toLowerCase()} successfully!`);
      setSelectedLeave(null);
      setRemarks("");
      loadLeaves(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to update leave status.");
    } finally {
      setReviewing(false);
    }
  };

  // Filtered List
  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const matchesTab = activeTab === "ALL" ? true : item.status.toUpperCase() === activeTab;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.studentName.toLowerCase().includes(query) ||
        item.studentUsn?.toLowerCase().includes(query) ||
        item.studentEmail?.toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query) ||
        item.leaveType?.toLowerCase().includes(query);
      return matchesTab && matchesQuery;
    });
  }, [leaves, activeTab, searchQuery]);

  // Statistics Counters
  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "student" ? "My Leave Applications" : "Student Leave Management"}
        subtitle={
          role === "student"
            ? "Submit formal leave applications, track faculty approval status, and manage medical or on-duty records."
            : "Review, approve, or decline student leave applications and manage excused absence records."
        }
        actions={
          role === "student" ? (
            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  <Plus className="h-4 w-4" /> Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleApplyLeave} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                      <FileCheck className="h-5 w-5 text-primary" /> Apply for Student Leave
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Submit an official absence request for review by department faculty.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-2">
                    {/* Student Info Pill */}
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-foreground block">{userName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {userEmail}
                        </span>
                      </div>
                      {userUsn && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[11px] font-bold text-primary bg-background"
                        >
                          {userUsn}
                        </Badge>
                      )}
                    </div>

                    {/* Leave Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Leave Category
                      </label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="SICK">Medical / Sick Leave</option>
                        <option value="CASUAL">Personal / Casual Leave</option>
                        <option value="ACADEMIC">Academic On-Duty (Conference / Project)</option>
                        <option value="SPORTS">Sports / Cultural Representative</option>
                        <option value="EMERGENCY">Family Emergency</option>
                        <option value="OTHER">Other Reason</option>
                      </select>
                    </div>

                    {/* Date Range Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">From Date</label>
                        <Input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="h-9 text-xs font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">To Date</label>
                        <Input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="h-9 text-xs font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Calculated Duration */}
                    <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                      <span className="text-muted-foreground">Total Absence Duration:</span>
                      <strong className="font-bold text-primary font-mono">
                        {durationDays > 0
                          ? `${durationDays} Day${durationDays > 1 ? "s" : ""}`
                          : "Invalid date range"}
                      </strong>
                    </div>

                    {/* Reason Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Explanation / Justification
                      </label>
                      <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="State reason for absence (e.g. recovering from fever, attending state robotics hackathon)..."
                        className="min-h-[85px] text-xs resize-none"
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsApplyOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submitting || durationDays <= 0}
                      className="text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadLeaves(false)}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              Requests
            </Button>
          )
        }
      />

      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border border-border/60 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Requests</span>
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">{totalCount}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Submitted applications</div>
        </Card>

        <Card className="p-4 border border-amber-500/30 bg-amber-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Pending Review
            </span>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Awaiting decision</div>
        </Card>

        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Approved Leaves
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Excused & attendance credited
          </div>
        </Card>

        <Card className="p-4 border border-rose-500/30 bg-rose-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Declined / Rejected
            </span>
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
            {rejectedCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Not approved</div>
        </Card>
      </div>

      {/* 2. FILTER TABS & SEARCH BAR */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <Button
                size="sm"
                variant={activeTab === "ALL" ? "default" : "outline"}
                onClick={() => setActiveTab("ALL")}
                className="text-xs font-semibold h-8 px-3 rounded-lg"
              >
                All ({totalCount})
              </Button>
              <Button
                size="sm"
                variant={activeTab === "PENDING" ? "default" : "outline"}
                onClick={() => setActiveTab("PENDING")}
                className={`text-xs font-semibold h-8 px-3 rounded-lg ${
                  activeTab === "PENDING" ? "bg-amber-600 text-white hover:bg-amber-700" : ""
                }`}
              >
                Pending ({pendingCount})
              </Button>
              <Button
                size="sm"
                variant={activeTab === "APPROVED" ? "default" : "outline"}
                onClick={() => setActiveTab("APPROVED")}
                className={`text-xs font-semibold h-8 px-3 rounded-lg ${
                  activeTab === "APPROVED" ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""
                }`}
              >
                Approved ({approvedCount})
              </Button>
              <Button
                size="sm"
                variant={activeTab === "REJECTED" ? "default" : "outline"}
                onClick={() => setActiveTab("REJECTED")}
                className={`text-xs font-semibold h-8 px-3 rounded-lg ${
                  activeTab === "REJECTED" ? "bg-rose-600 text-white hover:bg-rose-700" : ""
                }`}
              >
                Rejected ({rejectedCount})
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search leaves or USN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
              Loading leave records...
            </div>
          ) : filteredLeaves.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[650px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Student / USN</TableHead>
                    <TableHead className="text-xs font-bold">Leave Type</TableHead>
                    <TableHead className="text-xs font-bold">Date Range</TableHead>
                    <TableHead className="text-xs font-bold">Reason & Justification</TableHead>
                    <TableHead className="text-xs font-bold">Status</TableHead>
                    {role === "admin" && (
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.map((l) => {
                    const days = (() => {
                      const start = new Date(l.fromDate);
                      const end = new Date(l.toDate);
                      const diff = end.getTime() - start.getTime();
                      return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1, 1);
                    })();

                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-foreground block">
                              {l.studentName}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                              {l.studentUsn ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-mono px-1 py-0 h-4 bg-background"
                                >
                                  {l.studentUsn}
                                </Badge>
                              ) : null}
                              <span>{l.studentEmail}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {l.leaveType || "CASUAL"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="text-xs font-mono font-medium text-foreground">
                              {l.fromDate} → {l.toDate}
                            </div>
                            <span className="text-[11px] text-muted-foreground font-semibold">
                              {days} Day{days > 1 ? "s" : ""}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="max-w-[280px]">
                            <p className="text-xs text-foreground line-clamp-2">{l.reason}</p>
                            {l.remarks && (
                              <p className="text-[11px] text-primary mt-1 font-medium italic">
                                Note: {l.remarks}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`text-[10px] font-bold ${
                              l.status === "APPROVED"
                                ? "bg-emerald-600 text-white"
                                : l.status === "REJECTED"
                                  ? "bg-rose-600 text-white"
                                  : "bg-amber-500 text-white"
                            }`}
                          >
                            {l.status === "APPROVED" && "✓ Approved"}
                            {l.status === "PENDING" && "⏳ Pending"}
                            {l.status === "REJECTED" && "✕ Rejected"}
                          </Badge>
                        </TableCell>

                        {role === "admin" && (
                          <TableCell className="text-right">
                            {l.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLeave(l);
                                    setReviewAction("APPROVED");
                                  }}
                                  className="h-7 text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 px-2.5"
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLeave(l);
                                    setReviewAction("REJECTED");
                                  }}
                                  className="h-7 text-xs font-bold text-rose-600 border-rose-500/30 hover:bg-rose-500/10 gap-1 px-2.5"
                                >
                                  <X className="h-3.5 w-3.5" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-medium">
                                Reviewed {l.reviewedBy ? `by ${l.reviewedBy}` : ""}
                              </span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <FileCheck className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="font-bold text-sm">No Leave Requests Found</p>
              <p className="text-[11px] max-w-sm mx-auto">
                {role === "student"
                  ? "You have not submitted any leave applications yet. Click 'Apply for Leave' to submit your first request."
                  : "No leave requests match the current tab filter."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADMIN REVIEW CONFIRMATION MODAL */}
      <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              {reviewAction === "APPROVED" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600" />
              )}
              {reviewAction === "APPROVED" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Reviewing leave application for <strong>{selectedLeave?.studentName}</strong> (
              {selectedLeave?.studentUsn || selectedLeave?.studentEmail}).
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedLeave.fromDate} → {selectedLeave.toDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground">{selectedLeave.leaveType}</span>
                </div>
                <div className="pt-1 text-muted-foreground border-t border-border/40">
                  <span className="font-semibold text-foreground">Reason: </span>
                  {selectedLeave.reason}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Official Remarks / Feedback (Optional)
                </label>
                <Input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    reviewAction === "APPROVED"
                      ? "Approved by HOD. Medical certificate noted."
                      : "Insufficient attendance or invalid reason provided."
                  }
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedLeave(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={reviewing}
              onClick={handleReviewSubmit}
              className={`text-xs font-bold ${
                reviewAction === "APPROVED"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }`}
            >
              {reviewing
                ? "Processing..."
                : reviewAction === "APPROVED"
                  ? "Confirm Approval"
                  : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
