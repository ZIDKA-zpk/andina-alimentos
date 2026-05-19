import Link from "next/link";

import { getProducts, getSellerOrders } from "@/lib/data";

export default async function SellerDashboardPage() {
  const [products, orders] = await Promise.all([
    getProducts(),
    getSellerOrders(),
  ]);

  const activeProducts = products.filter((product) => product.is_active).length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-emerald-700">
          Panel de vendedor
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Resumen comercial
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Productos disponibles</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {activeProducts}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Pedidos pendientes</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {pendingOrders}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            className="rounded-md bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800"
            href="/productos"
          >
            Ver productos
          </Link>
          <Link
            className="rounded-md border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:border-emerald-600"
            href="/pedidos"
          >
            Historial de pedidos
          </Link>
        </div>
      </section>
    </main>
  );
}
