"use client";

import React from 'react';

interface KanbanColumnProps {
  title: string;
  badgeColor: string;
  dotColor: string;
  count: number;
  children: React.ReactNode;
}

export function KanbanColumn({ title, badgeColor, dotColor, count, children }: KanbanColumnProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col min-h-0 shadow-xs">
      <div className="flex justify-between items-center pb-2.5 mb-2 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dotColor}`} />
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">{title}</h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border ${badgeColor}`}>{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {children}
      </div>
    </div>
  );
}