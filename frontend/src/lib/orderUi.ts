import type { OrderState } from "@/types/order";

export const ORDER_STATE_BADGE_CLASSES: Record<OrderState, string> = {
  pending: "bg-amber-100 text-amber-900 border-amber-300",
  preparing: "bg-blue-100 text-blue-900 border-blue-300",
  ready: "bg-emerald-100 text-emerald-900 border-emerald-300",
  picked_up: "bg-gray-100 text-gray-700 border-gray-300",
  rejected: "bg-red-100 text-red-900 border-red-300",
};

export const ORDER_STATE_DOT_CLASSES: Record<OrderState, string> = {
  pending: "bg-amber-500",
  preparing: "bg-blue-500",
  ready: "bg-emerald-500",
  picked_up: "bg-gray-400",
  rejected: "bg-red-500",
};

export const ORDER_PROGRESS_STATES: OrderState[] = [
  "pending",
  "preparing",
  "ready",
  "picked_up",
];
