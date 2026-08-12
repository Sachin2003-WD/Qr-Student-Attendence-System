import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Search, Sun, LogOut, X } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { useState } from "react";

export function AppTopbar() {
  const { theme, toggleTheme, role, userName, logout } = useApp();
  const nav = useNavigate();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const initials = userName
    ? userName.split(" ").map((s) => s[0]).slice(0, 2).join("")
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/70 px-3 backdrop-blur-xl sm:px-6">
      {showMobileSearch ? (
        <div className="flex w-full items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input 
            placeholder="Search students, attendance, courses..." 
            className="h-9 flex-1 text-xs" 
            autoFocus
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 shrink-0" 
            onClick={() => setShowMobileSearch(false)}
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <SidebarTrigger />
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search students, attendance, courses..." className="h-9 pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setShowMobileSearch(true)}
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Badge variant="outline" className="hidden font-semibold capitalize sm:inline-flex px-3 py-1 text-xs">
              {role} Workspace
            </Badge>

            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Link to="/app/notifications" className="relative">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-accent focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[12ch] truncate text-sm font-medium sm:inline">{userName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">{userName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav({ to: "/app/profile" })}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav({ to: "/app/settings" })}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    toast.success("Signed out");
                    logout();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </header>
  );
}
