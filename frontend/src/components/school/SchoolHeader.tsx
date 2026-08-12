"use client";

import React, { useState, useEffect } from "react";
import { HeaderBase } from "../layout/HeaderBase";
import { UserMenu } from "../layout/UserMenu";

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
        <div
          role="tablist"
          aria-label="Secciones del panel escolar"
          className="flex items-center gap-6"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`text-sm font-semibold transition-colors pb-1 border-b-2 capitalize ${
                  isActive
                    ? "text-primary border-primary"
                    : "text-on-surface-variant border-transparent hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      }
      actions={<UserMenu userName={adminName} />}
    />
  );
}
