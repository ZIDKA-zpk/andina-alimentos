export type OrderDraftItem = {
  productId: string;
  quantity: number;
};

export type DiscountRuleSnapshot = {
  active: boolean;
  discountPercent: number;
  minQty: number;
};

export type ProductPricingSnapshot = {
  basePrice: number;
  discountRules: DiscountRuleSnapshot[];
  id: string;
  promoPrice: number | null;
};

export function getApplicableDiscount(
  product: ProductPricingSnapshot,
  quantity: number,
) {
  return (
    product.discountRules
      .filter((rule) => rule.active && rule.minQty <= quantity)
      .sort((a, b) => b.discountPercent - a.discountPercent)[0]
      ?.discountPercent ?? 0
  );
}

export function calculateOrderEstimate(
  products: ProductPricingSnapshot[],
  selectedItems: OrderDraftItem[],
) {
  return selectedItems.reduce((total, item) => {
    const product = products.find(
      (candidate) => candidate.id === item.productId,
    );

    if (!product || item.quantity <= 0) {
      return total;
    }

    const unitPrice = product.promoPrice ?? product.basePrice;
    const discount = getApplicableDiscount(product, item.quantity);

    return total + item.quantity * unitPrice * (1 - discount / 100);
  }, 0);
}
