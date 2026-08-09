import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api-client";

export type Role = "student" | "faculty" | "admin";

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  userName: string;
  userEmail: string;
  updateUserName: (name: string) => void;
  logout: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const storedRole = (localStorage.getItem("sa.role") || localStorage.getItem("mm.role") || "student") as Role;
    const storedTheme = ((localStorage.getItem("sa.theme") || localStorage.getItem("mm.theme")) as "light" | "dark" | null) ?? "light";
    const storedEmail = localStorage.getItem("sa.email") || localStorage.getItem("mm.email") || "";
    const storedName = localStorage.getItem("sa.name");

    setRoleState(storedRole);
    setTheme(storedTheme);
    setUserEmail(storedEmail);
    if (storedName) {
      setUserName(storedName);
    } else if (storedEmail) {
      setUserName(storedEmail.split("@")[0]);
    }

    if (api.getToken()) {
      api.getProfile()
        .then((profile) => {
          if (profile?.name && !storedName) setUserName(profile.name);
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
        updateUserName,
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
