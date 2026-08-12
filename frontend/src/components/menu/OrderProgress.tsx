import React from "react";
import { ORDER_STATE_LABELS } from "@/types/order";
import { ORDER_PROGRESS_STATES } from "@/lib/orderUi";

interface OrderProgressProps {
  state: string;
}

export function OrderProgress({ state }: OrderProgressProps) {
  const currentIndex = Math.max(
    0,
    ORDER_PROGRESS_STATES.indexOf(state as (typeof ORDER_PROGRESS_STATES)[number]),
  );

  return (
    <div>
      <div className="flex items-center">
        {ORDER_PROGRESS_STATES.map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={`h-3 w-3 rounded-full shrink-0 border-2 ${
                index <= currentIndex
                  ? "bg-primary border-primary"
                  : "bg-surface border-outline-variant/40"
              }`}
            />
            {index < ORDER_PROGRESS_STATES.length - 1 && (
              <div
                className={`flex-1 h-1 mx-1 rounded-full ${
                  index < currentIndex ? "bg-primary" : "bg-outline-variant/30"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {ORDER_PROGRESS_STATES.map((step, index) => (
          <span
            key={step}
            className={`text-[10px] font-semibold text-center ${
              index === 0
                ? "text-left"
                : index === ORDER_PROGRESS_STATES.length - 1
                  ? "text-right"
                  : "text-center"
            } ${index <= currentIndex ? "text-primary" : "text-on-surface-variant/50"}`}
            style={{ width: `${100 / ORDER_PROGRESS_STATES.length}%` }}
          >
            {ORDER_STATE_LABELS[step]}
          </span>
        ))}
      </div>
    </div>
  );
}
