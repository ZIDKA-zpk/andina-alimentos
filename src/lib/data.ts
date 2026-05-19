import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/domain";

export type ProductListItem = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  promo_price: number | null;
  stock_qty: number;
  is_active: boolean;
  discount_rules: {
    id: string;
    min_qty: number;
    discount_percent: number;
    active: boolean;
  }[];
};

export type SellerOrderListItem = {
  id: string;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  total: number;
  notes: string | null;
  created_at: string;
};

export type AdminOrderListItem = SellerOrderListItem & {
  seller_id: string;
  seller_name: string;
  seller_email: string;
};

export type SellerProfileListItem = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: "seller";
  is_active: boolean;
  created_at: string;
};

type ProductRow = Omit<ProductListItem, "discount_rules">;

type DiscountRuleRow = {
  id: string;
  product_id: string;
  min_qty: number;
  discount_percent: number;
  active: boolean;
};

function normalizeProduct(product: ProductRow): ProductRow {
  return {
    ...product,
    base_price: Number(product.base_price),
    promo_price:
      product.promo_price === null ? null : Number(product.promo_price),
    stock_qty: Number(product.stock_qty),
  };
}

function normalizeOrder(order: SellerOrderListItem): SellerOrderListItem {
  return {
    ...order,
    discount_total: Number(order.discount_total),
    subtotal: Number(order.subtotal),
    total: Number(order.total),
  };
}

export async function getProducts() {
  const supabase = await createClient();

  const { data: products, error: productError } = await supabase
    .from("products")
    .select(
      "id, name, sku, description, image_url, base_price, promo_price, stock_qty, is_active",
    )
    .order("name");

  if (productError) {
    throw new Error(productError.message);
  }

  const productRows = (products ?? []).map((product) =>
    normalizeProduct(product as ProductRow),
  );
  const productIds = productRows.map((product) => product.id);

  if (!productIds.length) {
    return [];
  }

  const { data: rules, error: rulesError } = await supabase
    .from("discount_rules")
    .select("id, product_id, min_qty, discount_percent, active")
    .in("product_id", productIds)
    .order("min_qty");

  if (rulesError) {
    throw new Error(rulesError.message);
  }

  const rulesByProduct = new Map<string, ProductListItem["discount_rules"]>();

  for (const rule of (rules ?? []) as DiscountRuleRow[]) {
    const list = rulesByProduct.get(rule.product_id) ?? [];
    list.push({
      active: rule.active,
      discount_percent: Number(rule.discount_percent),
      id: rule.id,
      min_qty: Number(rule.min_qty),
    });
    rulesByProduct.set(rule.product_id, list);
  }

  return productRows.map((product) => ({
    ...product,
    discount_rules: rulesByProduct.get(product.id) ?? [],
  }));
}

export async function getSellerOrders() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, subtotal, discount_total, total, notes, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SellerOrderListItem[]).map(normalizeOrder);
}

export async function getAdminOrders() {
  const supabase = await createClient();

  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, seller_id, status, subtotal, discount_total, total, notes, created_at",
    )
    .order("created_at", { ascending: false });

  if (orderError) {
    throw new Error(orderError.message);
  }

  const orderRows = ((orders ?? []) as (SellerOrderListItem & {
    seller_id: string;
  })[]).map((order) => ({
    ...normalizeOrder(order),
    seller_id: order.seller_id,
  }));

  const sellerIds = [...new Set(orderRows.map((order) => order.seller_id))];

  if (!sellerIds.length) {
    return [];
  }

  const { data: sellers, error: sellersError } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", sellerIds);

  if (sellersError) {
    throw new Error(sellersError.message);
  }

  const sellersById = new Map(
    (sellers ?? []).map((seller) => [
      seller.id,
      {
        email: seller.email as string,
        full_name: seller.full_name as string,
      },
    ]),
  );

  return orderRows.map((order) => {
    const seller = sellersById.get(order.seller_id);

    return {
      ...order,
      seller_email: seller?.email ?? "Sin email",
      seller_name: seller?.full_name || "Vendedor sin nombre",
    };
  });
}

export async function getSellers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, is_active, created_at")
    .eq("role", "seller")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SellerProfileListItem[];
}
