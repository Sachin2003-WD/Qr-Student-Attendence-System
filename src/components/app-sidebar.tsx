import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Calendar, Bell, User, Settings,
  Users, GraduationCap, BarChart3, Building2, ShieldCheck, Sparkles, QrCode,
  FileCheck, Clock, BookOpen, Layers, FlaskConical
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useApp, type Role } from "@/lib/app-context";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const common: Item[] = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Attendance", url: "/app/attendance", icon: QrCode },
  { title: "Lab Attendance", url: "/app/labs", icon: FlaskConical },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Notifications", url: "/app/notifications", icon: Bell },
];

const studentMenu: Item[] = [
  { title: "Timetable", url: "/app/timetable", icon: Clock },
  { title: "Leave Requests", url: "/app/leaves", icon: FileCheck },
  { title: "Reports", url: "/app/reports", icon: BarChart3 },
];

const adminMenu: Item[] = [
  { title: "Students", url: "/app/students", icon: Users },
  { title: "Leave Requests", url: "/app/leaves", icon: FileCheck },
  { title: "Admins (10 Max)", url: "/app/admins", icon: ShieldCheck },
  { title: "Batches", url: "/app/batches", icon: Layers },
  { title: "Departments", url: "/app/departments", icon: Building2 },
  { title: "Reports", url: "/app/reports", icon: BarChart3 },
];

const account: Item[] = [
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

function menuFor(role: Role) {
  return role === "admin" ? adminMenu : studentMenu;
}

export function AppSidebar() {
  const { role } = useApp();
  const { setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (u: string) => pathname === u;

  const roleMenu = menuFor(role);
  const roleLabel = role === "admin" ? "Admin" : "Student";

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/app/dashboard" onClick={handleNavClick} className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-bold tracking-tight">Attendrix</div>
            <div className="truncate text-xs text-muted-foreground">{roleLabel} Workspace</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {common.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}>
                    <Link to={i.url} onClick={handleNavClick}><i.icon className="h-4 w-4" /><span>{i.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{roleLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {roleMenu.map((i) => (
                <SidebarMenuItem key={i.url + i.title}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}>
                    <Link to={i.url} onClick={handleNavClick}><i.icon className="h-4 w-4" /><span>{i.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {account.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}>
                    <Link to={i.url} onClick={handleNavClick}><i.icon className="h-4 w-4" /><span>{i.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
        Smart Attendance v2.0
      </SidebarFooter>
    </Sidebar>
  );
}
