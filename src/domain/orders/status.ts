export const ORDER_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  approved: [],
  cancelled: [],
  pending: ["approved", "rejected", "cancelled"],
  rejected: [],
};

export function getNextOrderStatuses(status: OrderStatus) {
  return allowedTransitions[status];
}

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
) {
  return allowedTransitions[from].includes(to);
}

export function isFinalOrderStatus(status: OrderStatus) {
  return allowedTransitions[status].length === 0;
}

export function assertCanTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
) {
  if (!canTransitionOrderStatus(from, to)) {
    throw new Error(`No se puede cambiar un pedido de ${from} a ${to}.`);
  }
}
