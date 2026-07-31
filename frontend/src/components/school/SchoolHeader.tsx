"use client";

import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { HeaderBase } from "../layout/HeaderBase";

interface SchoolHeaderProps {
  activeTab: "branches" | "companies";
  onTabChange: (tab: "branches" | "companies") => void;
}

export function SchoolHeader({ activeTab, onTabChange }: SchoolHeaderProps) {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAdminName(userData.name || "Admin");
      }
    } catch {}
  }, []);

  const tabs = [
    { id: "branches", label: "Sucursales" },
    { id: "companies", label: "Compañías" },
  ] as const;

  return (
    <HeaderBase
      navigation={
        <>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
      actions={
        <button
          aria-label={`Perfil de ${adminName}`}
          title={adminName}
          className="w-10 h-10 rounded-full bg-primary-container/20 border border-outline-variant/30 flex items-center justify-center cursor-pointer"
        >
          <User className="h-5 w-5 text-primary" />
        </button>
      }
    />
  );
}
