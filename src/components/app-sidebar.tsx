import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Calendar, CalendarPlus, MessageSquare, Bell, User, Settings,
  Users, GraduationCap, BarChart3, Building2, ShieldCheck, Sparkles,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useApp } from "@/lib/app-context";
import type { Role } from "@/lib/mock-data";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const common: Item[] = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Notifications", url: "/app/notifications", icon: Bell },
];

const studentMenu: Item[] = [
  { title: "Book Session", url: "/app/schedule", icon: CalendarPlus },
  { title: "My Sessions", url: "/app/sessions", icon: MessageSquare },
  { title: "Mentors", url: "/app/mentors", icon: GraduationCap },
  { title: "Feedback", url: "/app/feedback", icon: MessageSquare },
];
const mentorMenu: Item[] = [
  { title: "Requests", url: "/app/sessions", icon: MessageSquare },
  { title: "My Students", url: "/app/students", icon: Users },
  { title: "Feedback", url: "/app/feedback", icon: MessageSquare },
  { title: "Reports", url: "/app/reports", icon: BarChart3 },
];
const adminMenu: Item[] = [
  { title: "Students", url: "/app/students", icon: Users },
  { title: "Mentors", url: "/app/mentors", icon: GraduationCap },
  { title: "Admins", url: "/app/admins", icon: ShieldCheck },
  { title: "Departments", url: "/app/departments", icon: Building2 },
  { title: "Sessions", url: "/app/sessions", icon: MessageSquare },
  { title: "Reports", url: "/app/reports", icon: BarChart3 },
];

const account: Item[] = [
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

function menuFor(role: Role) {
  return role === "student" ? studentMenu : role === "mentor" ? mentorMenu : adminMenu;
}

export function AppSidebar() {
  const { role } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (u: string) => pathname === u;

  const roleMenu = menuFor(role);
  const roleLabel = role === "student" ? "Student" : role === "mentor" ? "Mentor" : "Admin";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/app/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold">Mentor Matrix</div>
            <div className="truncate text-xs text-muted-foreground">{roleLabel} workspace</div>
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
                    <Link to={i.url}><i.icon className="h-4 w-4" /><span>{i.title}</span></Link>
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
                    <Link to={i.url}><i.icon className="h-4 w-4" /><span>{i.title}</span></Link>
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
                    <Link to={i.url}><i.icon className="h-4 w-4" /><span>{i.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          v1.0 · Enterprise
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
