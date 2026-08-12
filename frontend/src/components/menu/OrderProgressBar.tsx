import React from "react";
import { ORDER_PROGRESS_STATES } from "@/lib/orderUi";

interface OrderProgressBarProps {
  state: string;
}

export function OrderProgressBar({ state }: OrderProgressBarProps) {
  const index = Math.max(
    0,
    ORDER_PROGRESS_STATES.indexOf(state as (typeof ORDER_PROGRESS_STATES)[number]),
  );
  const percent = ((index + 1) / ORDER_PROGRESS_STATES.length) * 100;

  return (
    <div className="h-1.5 w-full rounded-full bg-outline-variant/25 overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
