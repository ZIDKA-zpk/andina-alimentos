import {
  calculateOrderEstimate,
  type OrderDraftItem,
  type ProductPricingSnapshot,
} from "@/domain/orders/pricing";
import type { ProductListItem } from "@/lib/data";

export type SelectedOrderItemInput = {
  product_id: string;
  quantity: number;
};

function toProductPricingSnapshot(
  product: ProductListItem,
): ProductPricingSnapshot {
  return {
    basePrice: product.base_price,
    discountRules: product.discount_rules.map((rule) => ({
      active: rule.active,
      discountPercent: rule.discount_percent,
      minQty: rule.min_qty,
    })),
    id: product.id,
    promoPrice: product.promo_price,
  };
}

function toOrderDraftItem(item: SelectedOrderItemInput): OrderDraftItem {
  return {
    productId: item.product_id,
    quantity: item.quantity,
  };
}

export function calculateEstimatedOrderTotal(
  products: ProductListItem[],
  selectedItems: SelectedOrderItemInput[],
) {
  return calculateOrderEstimate(
    products.map(toProductPricingSnapshot),
    selectedItems.map(toOrderDraftItem),
  );
}
