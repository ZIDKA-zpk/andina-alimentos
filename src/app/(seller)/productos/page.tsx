import { randomUUID } from "node:crypto";

import { ProductOrderPanel } from "@/components/products/product-order-panel";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { getProducts } from "@/lib/data";

type SellerProductsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SellerProductsPage({
  searchParams,
}: SellerProductsPageProps) {
  const [params, products] = await Promise.all([searchParams, getProducts()]);
  const activeProducts = products.filter((product) => product.is_active);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-emerald-700">Productos</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Catalogo para pedidos
        </h1>

        <FeedbackMessage error={params.error} />

        {activeProducts.length ? (
          <ProductOrderPanel
            initialIdempotencyKey={randomUUID()}
            products={activeProducts}
          />
        ) : (
          <p className="mt-6 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No hay productos activos disponibles.
          </p>
        )}
      </section>
    </main>
  );
}
