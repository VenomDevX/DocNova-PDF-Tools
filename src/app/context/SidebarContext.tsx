import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Ctx {
  collapsed: boolean;
  toggle: () => void;
  width: number;
}

const SidebarContext = createContext<Ctx>({ collapsed: false, toggle: () => {}, width: 240 });
export const useSidebar = () => useContext(SidebarContext);

export const SIDEBAR_W_EXPANDED = 240;
export const SIDEBAR_W_COLLAPSED = 68;

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("docnova-sidebar-collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("docnova-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  const width = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, width }}>
      {children}
    </SidebarContext.Provider>
  );
}
