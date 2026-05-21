import type { ProductListItem } from "@/lib/data";

type OrderDraftItem = {
  product_id: string;
  quantity: number;
};

function getBestDiscount(product: ProductListItem, quantity: number) {
  return (
    product.discount_rules
      .filter((rule) => rule.active && rule.min_qty <= quantity)
      .sort((a, b) => b.discount_percent - a.discount_percent)[0]
      ?.discount_percent ?? 0
  );
}

export function calculateEstimatedOrderTotal(
  products: ProductListItem[],
  selectedItems: OrderDraftItem[],
) {
  return selectedItems.reduce((total, item) => {
    const product = products.find(
      (candidate) => candidate.id === item.product_id,
    );

    if (!product || item.quantity <= 0) {
      return total;
    }

    const unitPrice = product.promo_price ?? product.base_price;
    const discount = getBestDiscount(product, item.quantity);

    return total + item.quantity * unitPrice * (1 - discount / 100);
  }, 0);
}
