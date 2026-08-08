export const DEFAULT_BRANCH_ID = 1;

export const ORDER_STATE_LABELS: Record<string, string> = {
  pending: "En espera",
  preparing: "En preparación",
  ready: "Listo",
  delivered: "Entregado",
};

export const ORDER_STATE_SEQUENCE = ["pending", "preparing", "ready", "delivered"] as const;
