import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, User } from "lucide-react";
import { api, type AdminResponse } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admins")({
  head: () => ({
    meta: [
      { title: "Administrators — Smart Attendance System" },
      { name: "description", content: "Manage system administrators and security roles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admins,
});

function Admins() {
  const { userEmail } = useApp();
  const [adminsList, setAdminsList] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states for registering new admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("9876543210");
  const [password, setPassword] = useState("Password@123");
  const [creating, setCreating] = useState(false);

  const fetchAdmins = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getAdmins();
      if (Array.isArray(data)) {
        setAdminsList(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch registered admins:", err);
      if (!silent) {
        toast.error(err.message || "Failed to load registered administrators from MySQL");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins(false);
    const interval = setInterval(() => {
      fetchAdmins(true);
    }, 5000);

    const handleStorage = () => fetchAdmins(true);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchAdmins]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminsList.length >= 10) {
      toast.error("Maximum limit of 10 Administrator accounts reached!");
      return;
    }

    try {
      setCreating(true);
      await api.createAdmin({ name, email, phone, password });
      toast.success(`Admin account registered successfully for ${name}!`);
      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("Password@123");
      fetchAdmins(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to register Administrator account");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrators Control Panel"
        subtitle="Live list of registered system administrators with role access and account management."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => fetchAdmins(false)}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="gap-2 text-xs font-semibold"
              disabled={adminsList.length >= 10}
              onClick={() => setShowModal(true)}
            >
              <UserPlus className="h-4 w-4" /> Add Admin ({adminsList.length}/10)
            </Button>
          </div>
        }
      />

      {adminsList.length >= 10 && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex items-center gap-3 p-4 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <strong>Maximum Limit Reached:</strong> This institution has reached the maximum cap of 10 Administrator accounts.
            </div>
          </CardContent>
        </Card>
      )}

      {showModal && (
        <Card className="border-primary/30 p-6 shadow-xl bg-card">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Register New Administrator Account
            </CardTitle>
            <CardDescription className="text-xs">
              Enter details for the new administrator. Data will be saved directly into MySQL database.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Full Name</Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  className="h-9 text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@college.edu"
                  className="h-9 text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Phone (10 Digits)</Label>
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Password</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password@123"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={creating} className="text-xs font-semibold">
                {creating ? "Saving to MySQL..." : "Register Admin"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Registered Administrators ({adminsList.length})
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                All registered admin accounts saved in the MySQL database system.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">
              Active Admins: {adminsList.filter((a) => a.active !== false).length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading registered administrators from MySQL...
            </div>
          ) : adminsList.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-xs">Admin Name</TableHead>
                    <TableHead className="text-xs">Email Address</TableHead>
                    <TableHead className="text-xs">Phone Number</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminsList.map((a) => {
                    const isCurrent = userEmail && a.email && a.email.toLowerCase() === userEmail.toLowerCase();
                    const displayName = a.name || (a.email ? a.email.split("@")[0] : "System Admin");
                    const initials = displayName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <TableRow key={a.id || a.email} className={`border-border/30 ${isCurrent ? "bg-primary/5" : ""}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {initials || "AD"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-foreground">{displayName}</span>
                                {isCurrent && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
                                    You (Logged In)
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{a.email}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{a.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1 text-[10px] font-semibold bg-primary/10 text-primary border-primary/20">
                            <ShieldCheck className="h-3 w-3" /> System Administrator
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={`text-[10px] font-bold ${
                              a.active !== false
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-rose-600 hover:bg-rose-700 text-white"
                            }`}
                          >
                            {a.active !== false ? "ACTIVE" : "DISABLED"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2 my-4 mx-4">
              <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <div className="text-sm font-medium">No Registered Administrators Found</div>
              <p className="text-xs text-muted-foreground">Click "Add Admin" above or register an Admin account to add system administrators.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
