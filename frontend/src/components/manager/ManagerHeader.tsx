"use client";

import React from "react";
import { Store, UserCircle2, User } from "lucide-react";
import { HeaderBase } from "../layout/HeaderBase";

interface ManagerHeaderProps {
  activeTab: "branches" | "users" | "dashboard";
  setActiveTab: (tab: "branches" | "users" | "dashboard") => void;
  userName?: string;
}

export function ManagerHeader({ activeTab, setActiveTab, userName = "Juan" }: ManagerHeaderProps) {
  const tabs = [
    { id: "branches", label: "Sucursales" },
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
      actions={
        <button className="w-10 h-10 rounded-full bg-primary-container/20 border border-outline-variant/30 flex items-center justify-center cursor-pointer">
              <User className="h-5 w-5 text-primary" />
            </button>
      }
    />
  );
}