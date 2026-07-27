import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admins")({
  head: () => ({
    meta: [
      { title: "Admins — Mentor Matrix" },
      { name: "description", content: "Manage administrators and roles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admins,
});

const admins = [
  { id: "a1", name: "Anita Desai", email: "anita@college.edu", role: "Super Admin", avatar: "AD" },
  { id: "a2", name: "Rajesh Kumar", email: "rajesh@college.edu", role: "Admin", avatar: "RK" },
  { id: "a3", name: "Sara Fernandes", email: "sara@college.edu", role: "Admin", avatar: "SF" },
];

function Admins() {
  return (
    <>
      <PageHeader
        title="Administrators"
        subtitle="Users with elevated permissions across the institution."
        actions={<Button className="gap-1" onClick={() => toast("Invite admin (demo)")}><UserPlus className="h-4 w-4" /> Invite admin</Button>}
      />
      <Card className="p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{a.avatar}</AvatarFallback></Avatar>
                    <span className="font-medium">{a.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                <TableCell><Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> {a.role}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost">Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
