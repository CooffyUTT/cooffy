"use client";

import React from "react";
import { User } from "lucide-react";
import { HeaderBase } from "../layout/HeaderBase";

export function SchoolHeader() {
  let adminName = "Admin";
  if (typeof window !== "undefined") {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        adminName = userData.name || "Admin";
      }
    } catch {}
  }

  return (
    <HeaderBase
      navigation={
        <button
          className="text-sm font-semibold transition-colors pb-1 border-b-2 capitalize text-primary border-primary cursor-default"
          aria-current="page"
        >
          Sucursales
        </button>
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
