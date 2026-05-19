import Link from "next/link";

import { getAdminOrders, getProducts, getSellers } from "@/lib/data";

export default async function AdminPage() {
  const [products, orders, sellers] = await Promise.all([
    getProducts(),
    getAdminOrders(),
    getSellers(),
  ]);
  const pendingOrders = orders.filter((order) => order.status === "pending");

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-emerald-700">Administrador</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Control del negocio
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-600"
            href="/admin/productos"
          >
            <p className="text-sm text-slate-500">Productos</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {products.length}
            </p>
          </Link>
          <Link
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-600"
            href="/admin/pedidos"
          >
            <p className="text-sm text-slate-500">Pedidos</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {pendingOrders.length}
            </p>
          </Link>
          <Link
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-600"
            href="/admin/vendedores"
          >
            <p className="text-sm text-slate-500">Vendedores</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {sellers.length}
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
