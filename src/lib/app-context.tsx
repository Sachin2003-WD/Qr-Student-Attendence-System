import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api-client";

export type Role = "student" | "admin";

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  userName: string;
  userEmail: string;
  userUsn: string;
  updateUserName: (name: string) => void;
  updateUserUsn: (usn: string) => void;
  updateUserProfile: (data: { name?: string; email?: string; usn?: string }) => void;
  logout: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userUsn, setUserUsn] = useState<string>("");

  useEffect(() => {
    const rawRole = localStorage.getItem("sa.role") || localStorage.getItem("mm.role") || "student";
    const storedRole: Role = rawRole === "admin" ? "admin" : "student";
    const storedTheme = ((localStorage.getItem("sa.theme") || localStorage.getItem("mm.theme")) as "light" | "dark" | null) ?? "light";
    const storedEmail = localStorage.getItem("sa.email") || localStorage.getItem("mm.email") || "";
    const storedName = localStorage.getItem("sa.name");
    const storedUsn = localStorage.getItem("sa.usn") || "";

    setRoleState(storedRole);
    setTheme(storedTheme);
    setUserEmail(storedEmail);
    setUserUsn(storedUsn);
    if (storedName) {
      setUserName(storedName);
    } else if (storedEmail) {
      setUserName(storedEmail.split("@")[0]);
    }

    if (api.getToken()) {
      api.getProfile()
        .then((profile) => {
          if (profile?.name && !storedName) setUserName(profile.name);
          if (profile?.email && !storedEmail) setUserEmail(profile.email);
          if (profile?.usn) {
            setUserUsn(profile.usn);
            localStorage.setItem("sa.usn", profile.usn);
          }
        })
        .catch(() => {
          // ignore profile fetch error
        });
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("sa.theme", theme);
  }, [theme]);

  const setRole = (r: Role) => {
    setRoleState(r);
    localStorage.setItem("sa.role", r);
  };

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const updateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem("sa.name", name);
  };

  const updateUserUsn = (usn: string) => {
    setUserUsn(usn);
    localStorage.setItem("sa.usn", usn);
  };

  const updateUserProfile = (data: { name?: string; email?: string; usn?: string }) => {
    if (data.name) {
      setUserName(data.name);
      localStorage.setItem("sa.name", data.name);
    }
    if (data.email) {
      setUserEmail(data.email);
      localStorage.setItem("sa.email", data.email);
    }
    if (data.usn) {
      setUserUsn(data.usn);
      localStorage.setItem("sa.usn", data.usn);
    }
  };

  const logout = () => {
    api.logout();
    window.location.href = "/login";
  };

  return (
    <Ctx.Provider
      value={{
        role,
        setRole,
        theme,
        toggleTheme,
        userName: userName || userEmail || "User",
        userEmail,
        userUsn,
        updateUserName,
        updateUserUsn,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
