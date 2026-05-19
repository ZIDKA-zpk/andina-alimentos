import { updateProduct } from "@/actions/products";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { getProducts } from "@/lib/data";
import { toMoney } from "@/lib/format";

type AdminProductsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const [params, products] = await Promise.all([searchParams, getProducts()]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-emerald-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Gestion de productos
        </h1>

        <FeedbackMessage error={params.error} success={params.success} />

        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <form
              action={updateProduct}
              className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end"
              key={product.id}
            >
              <input name="id" type="hidden" value={product.id} />
              <div>
                <p className="font-semibold text-slate-950">{product.name}</p>
                <p className="text-sm text-slate-500">
                  {product.sku} · Actual{" "}
                  {toMoney(product.promo_price ?? product.base_price)}
                </p>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">
                  Precio base
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  defaultValue={product.base_price}
                  min={0}
                  name="base_price"
                  step="0.01"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">
                  Promo
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  defaultValue={product.promo_price ?? ""}
                  min={0}
                  name="promo_price"
                  step="0.01"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">
                  Stock
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                  defaultValue={product.stock_qty}
                  min={0}
                  name="stock_qty"
                  type="number"
                />
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    defaultChecked={product.is_active}
                    name="is_active"
                    type="checkbox"
                  />
                  Activo
                </label>
                <button
                  className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                  type="submit"
                >
                  Guardar
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
