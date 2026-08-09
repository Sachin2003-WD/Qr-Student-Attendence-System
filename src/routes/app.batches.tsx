import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Plus, BookOpen, Clock, User, Calendar, Trash2, Search, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/app/batches")({
  head: () => ({
    meta: [
      { title: "Batches Management — Smart Attendance System" },
      { name: "description", content: "Create and manage academic batch codes, trainers, and class schedules." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BatchesManagementPage,
});

function BatchesManagementPage() {
  const { role } = useApp();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Batch Form States
  const [batchCode, setBatchCode] = useState("");
  const [batchName, setBatchName] = useState("");
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

  const handleOpenModal = () => {
    setBatchCode("");
    setBatchName("");
    setSubjectName("Grooming");
    setBranch("Rajajinagar Jspiders");
    setTrainerName("Laxman Ashok Handenavar");
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setClassTiming(nowTime);
    setStartDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim() || !batchName.trim()) {
      toast.error("Please enter Batch Code and Batch Name");
      return;
    }

    try {
      setCreating(true);
      const codeUpper = batchCode.trim().toUpperCase();
      await api.createBatch({
        name: batchName.trim(),
        batchCode: codeUpper,
        subjectName,
        branch,
        classTiming,
        trainerName,
        startDate,
      });
      toast.success(`Batch ${codeUpper} created successfully!`);
      setShowModal(false);
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied ${code} to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
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
        title="Admin Batch Management"
        subtitle="Create batch codes, assign faculty trainers, configure class timings, and manage academic cohorts."
        actions={
          role === "admin" ? (
            <Button className="gap-2 text-xs font-semibold shadow-md" onClick={handleOpenModal}>
              <Plus className="h-4 w-4" /> Create New Batch
            </Button>
          ) : undefined
        }
      />

      {/* CREATE BATCH MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Layers className="h-5 w-5 text-primary" /> Create New Batch Code
            </DialogTitle>
            <DialogDescription className="text-xs">
              Batch codes automatically appear in the Attendance Session Configuration list.
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
                <Label className="text-xs font-semibold">Start Date (Auto Set)</Label>
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
              <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={creating} className="text-xs font-semibold">
                {creating ? "Creating..." : "Save Batch in Database"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SEARCH BAR */}
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

      {/* BATCHES TABLE */}
      <Card className="p-4 border border-border/60">
        <CardHeader className="px-0 pt-0 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Created Batches List
            </CardTitle>
            <CardDescription className="text-xs">
              All batch codes listed here automatically populate in the Attendance Session Configuration.
            </CardDescription>
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
                  <TableHead>Branch</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Trainer / Faculty</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((b) => (
                  <TableRow key={b.id || b.batchCode}>
                    <TableCell className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                      <span>{b.batchCode || b.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopyCode(b.batchCode || b.name)}
                      >
                        {copiedCode === (b.batchCode || b.name) ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">{b.subjectName || "Grooming"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.branch || "Rajajinagar Jspiders"}</TableCell>
                    <TableCell className="text-xs font-mono">{b.classTiming || "04:45 PM"}</TableCell>
                    <TableCell className="text-xs font-medium">{b.trainerName || "Laxman Ashok Handenavar"}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{b.startDate || "2026-06-24"}</TableCell>
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
          <div className="rounded-xl border border-dashed p-8 text-center space-y-3 bg-card">
            <Layers className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <div className="space-y-1">
              <div className="text-sm font-bold">No Batches Created Yet</div>
              <p className="text-xs text-muted-foreground">Click the button below to create your first Batch Code.</p>
            </div>
            {role === "admin" && (
              <Button size="sm" className="gap-2 text-xs font-semibold" onClick={handleOpenModal}>
                <Plus className="h-4 w-4" /> Create New Batch Code Now
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
