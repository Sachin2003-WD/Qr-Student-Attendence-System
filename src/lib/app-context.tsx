import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./mock-data";

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  userName: string;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const r = (localStorage.getItem("mm.role") as Role | null) ?? "student";
    const t = (localStorage.getItem("mm.theme") as "light" | "dark" | null) ?? "light";
    setRoleState(r);
    setTheme(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("mm.theme", theme);
  }, [theme]);

  const setRole = (r: Role) => {
    setRoleState(r);
    localStorage.setItem("mm.role", r);
  };
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const userName =
    role === "student" ? "Rohan Verma" : role === "mentor" ? "Dr. Priya Sharma" : "Admin Console";

  return (
    <Ctx.Provider value={{ role, setRole, theme, toggleTheme, userName }}>{children}</Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
