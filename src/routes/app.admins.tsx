import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, ShieldCheck, AlertCircle } from "lucide-react";
import { api, type AdminResponse } from "@/lib/api-client";
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
  const [adminsList, setAdminsList] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states for creating admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("9876543210");
  const [password, setPassword] = useState("Password@123");
  const [creating, setCreating] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await api.getAdmins();
      setAdminsList(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch admins list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminsList.length >= 10) {
      toast.error("Maximum limit of 10 Admin accounts reached!");
      return;
    }

    try {
      setCreating(true);
      await api.createAdmin({ name, email, phone, password });
      toast.success("New Admin account created successfully!");
      setShowModal(false);
      setName("");
      setEmail("");
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to create Admin");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrators Control Panel"
        subtitle="Manage system administrators (Up to 10 Administrators allowed)."
        actions={
          <Button
            className="gap-2 text-xs font-semibold"
            disabled={adminsList.length >= 10}
            onClick={() => setShowModal(true)}
          >
            <UserPlus className="h-4 w-4" /> Add Admin ({adminsList.length}/10)
          </Button>
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
        <Card className="border-primary/30 p-6 shadow-xl">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base font-bold">Create New Administrator Account</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Full Name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Ramesh Kumar" className="h-9 text-xs" />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@college.edu" className="h-9 text-xs" />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Phone (10 Digits)</Label>
                <Input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="h-9 text-xs" />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Password</Label>
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password@123" className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="text-xs">Cancel</Button>
              <Button type="submit" size="sm" disabled={creating} className="text-xs font-semibold">{creating ? "Creating..." : "Save Admin"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4">
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading administrators from database...</div>
        ) : adminsList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminsList.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {a.name ? a.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "AD"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-xs">{a.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <ShieldCheck className="h-3 w-3" /> System Admin
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.active ? "default" : "destructive"} className="text-[10px]">
                      {a.active ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <div className="text-sm font-medium">No Administrators Found</div>
            <p className="text-xs text-muted-foreground">Click "Add Admin" above to register additional administrators (up to 10).</p>
          </div>
        )}
      </Card>
    </div>
  );
}
