export const currency = new Intl.NumberFormat("es-BO", {
  currency: "BOB",
  style: "currency",
});

export const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function toMoney(value: number | string | null | undefined) {
  return currency.format(Number(value ?? 0));
}
