export type UserRole = "admin" | "seller";

export type OrderStatus = "pending" | "approved" | "rejected" | "cancelled";

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  promoPrice?: number;
  stockQty: number;
  isActive: boolean;
};

export type Order = {
  id: string;
  sellerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
};
