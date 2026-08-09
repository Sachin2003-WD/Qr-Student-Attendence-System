import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, BookOpen, Clock, User, Calendar, ShieldCheck, Trash2, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/app/departments")({
  head: () => ({
    meta: [
      { title: "Admin Batches & Academic Management — Smart Attendance System" },
      { name: "description", content: "Admin batch management, subjects, trainers, and academic units." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DepartmentsAndBatches,
});

function DepartmentsAndBatches() {
  const { role } = useApp();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Form states for creating a new Batch
  const [batchName, setBatchName] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [subjectName, setSubjectName] = useState("Grooming");
  const [branch, setBranch] = useState("Rajajinagar Jspiders");
  const [classTiming, setClassTiming] = useState("04:45 PM");
  const [trainerName, setTrainerName] = useState("Laxman Ashok Handenavar");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [creating, setCreating] = useState(false);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await api.getBatches();
      setBatches(data || []);
    } catch {
      toast.error("Failed to load batches from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleOpenCreateModal = () => {
    setBatchName("");
    setBatchCode("");
    setSubjectName("Grooming");
    setBranch("Rajajinagar Jspiders");
    setTrainerName("Laxman Ashok Handenavar");
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setClassTiming(nowTimeStr);
    setStartDate(new Date().toISOString().split("T")[0]);
    setShowBatchModal(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim() || !batchName.trim()) {
      toast.error("Please enter Batch Code and Batch Name");
      return;
    }

    try {
      setCreating(true);
      await api.createBatch({
        name: batchName.trim(),
        batchCode: batchCode.trim().toUpperCase(),
        subjectName,
        branch,
        classTiming,
        trainerName,
        startDate,
      });
      toast.success(`Batch ${batchCode.trim().toUpperCase()} created successfully!`);
      setShowBatchModal(false);
      fetchBatches();
    } catch (err: any) {
      toast.error(err.message || "Failed to create batch");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBatch = async (id: number | string, code: string) => {
    if (!confirm(`Are you sure you want to delete batch ${code}?`)) return;
    try {
      await api.deleteBatch(id);
      toast.success(`Batch ${code} deleted.`);
      fetchBatches();
    } catch {
      toast.error("Failed to delete batch.");
    }
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.batchCode && b.batchCode.toLowerCase().includes(q)) ||
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.subjectName && b.subjectName.toLowerCase().includes(q)) ||
      (b.branch && b.branch.toLowerCase().includes(q)) ||
      (b.trainerName && b.trainerName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Batch & Academic Management"
        subtitle="Create, configure, and manage batch codes, subjects, class timings, and faculty trainers."
        actions={
          role === "admin" ? (
            <Button className="gap-2 text-xs font-semibold" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4" /> Create New Batch Code
            </Button>
          ) : undefined
        }
      />

      {/* BATCH CREATION MODAL */}
      <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <BookOpen className="h-5 w-5 text-primary" /> Create New Batch Code
            </DialogTitle>
            <DialogDescription className="text-xs">
              Batch started date and time are automatically set to current date/time. Configure trainer and subject details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatch} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Batch Code (e.g. JRA-GROGRD-E532)</Label>
              <Input
                required
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="e.g. JRA-GROGRD-E532"
                className="h-9 text-xs font-mono font-bold uppercase"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Batch Full Name</Label>
              <Input
                required
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. Grooming Evening Batch E532"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Subject</Label>
                <Input
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Grooming"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Branch Location</Label>
                <Input
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Rajajinagar Jspiders"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Class Start Time (Auto Set)</Label>
                <Input
                  required
                  value={classTiming}
                  onChange={(e) => setClassTiming(e.target.value)}
                  placeholder="04:45 PM"
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Batch Start Date (Auto Set)</Label>
                <Input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Trainer / Faculty Name</Label>
              <Input
                required
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Laxman Ashok Handenavar"
                className="h-9 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowBatchModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={creating} className="text-xs font-semibold">
                {creating ? "Creating..." : "Save Batch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches by code, subject, branch, or trainer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Total Batches: {filteredBatches.length}
        </span>
      </div>

      {/* BATCHES LIST TABLE */}
      <Card className="p-4 border border-border/60">
        <CardHeader className="px-0 pt-0 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Active Batches Managed by Admin
            </CardTitle>
            <CardDescription className="text-xs">Created batch codes automatically populate in the Attendance Session Configuration list.</CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading batches from database...</div>
        ) : filteredBatches.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Branch Location</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Trainer / Faculty</TableHead>
                  <TableHead>Started Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((b) => (
                  <TableRow key={b.id || b.batchCode}>
                    <TableCell className="font-mono text-xs font-bold text-primary">{b.batchCode || b.name}</TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">{b.subjectName || "Grooming"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.branch || "Rajajinagar Jspiders"}</TableCell>
                    <TableCell className="text-xs font-mono">{b.classTiming || "04:45 PM"}</TableCell>
                    <TableCell className="text-xs font-medium">{b.trainerName || "Laxman Ashok Handenavar"}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{b.startDate || "24-Jun-2026"}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        ACTIVE
                      </Badge>
                      {role === "admin" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={() => handleDeleteBatch(b.id, b.batchCode || b.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <div className="text-sm font-medium">No Batches Found</div>
            <p className="text-xs text-muted-foreground">Click "Create New Batch Code" above to create your first batch.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
