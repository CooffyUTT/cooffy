"use client";

import React, { useEffect, useState } from "react";
import { HeaderBase } from "../layout/HeaderBase";
import { UserMenu } from "../layout/UserMenu";

interface ManagerHeaderProps {
  activeTab: "branches" | "menu" | "users" | "dashboard";
  setActiveTab: (tab: "branches" | "menu" | "users" | "dashboard") => void;
}

export function ManagerHeader({ activeTab, setActiveTab }: ManagerHeaderProps) {
  const [userName, setUserName] = useState("Gerente");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("userData");
      if (raw) {
        const userData = JSON.parse(raw) as { name?: string; user?: string };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserName(userData.name || userData.user || "Gerente");
      }
    } catch {
      // ignore malformed userData
    }
  }, []);

  const tabs = [
    { id: "branches", label: "Sucursales" },
    { id: "menu", label: "Menú" },
    { id: "users", label: "Usuarios" },
    { id: "dashboard", label: "Dashboard" },
  ] as const;

  return (
    <HeaderBase
      // Navegación del Manager
      navigation={
        <>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 capitalize ${
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-on-surface-variant border-transparent hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </>
      }
      // Badge del usuario Manager a la derecha
      actions={<UserMenu userName={userName} />}
    />
  );
}
