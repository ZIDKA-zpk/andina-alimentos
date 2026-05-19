import { approveOrder, rejectOrder } from "@/actions/orders";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { getAdminOrders } from "@/lib/data";
import { formatDate, toMoney } from "@/lib/format";

const statusLabel = {
  approved: "Aprobado",
  cancelled: "Cancelado",
  pending: "Pendiente",
  rejected: "Rechazado",
};

type AdminOrdersPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const [params, orders] = await Promise.all([searchParams, getAdminOrders()]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-emerald-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Pedidos recibidos
        </h1>

        <FeedbackMessage error={params.error} success={params.success} />

        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={order.id}
            >
              <div className="grid gap-3 sm:grid-cols-4 sm:items-center">
                <div>
                  <p className="font-semibold text-slate-950">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {order.seller_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {order.seller_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-700">
                    {formatDate(order.created_at)}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {statusLabel[order.status]}
                  </p>
                </div>
                <p className="font-semibold text-slate-950">
                  {toMoney(order.total)}
                </p>
                <div className="flex gap-2">
                  {order.status === "pending" ? (
                    <>
                      <form action={approveOrder} className="flex-1">
                        <input name="order_id" type="hidden" value={order.id} />
                        <button
                          className="h-10 w-full rounded-md bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800"
                          type="submit"
                        >
                          Aprobar
                        </button>
                      </form>
                      <form action={rejectOrder} className="flex-1">
                        <input name="order_id" type="hidden" value={order.id} />
                        <button
                          className="h-10 w-full rounded-md border border-slate-300 text-sm font-semibold text-slate-700 hover:border-red-500"
                          type="submit"
                        >
                          Rechazar
                        </button>
                      </form>
                    </>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                      Procesado
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}

          {!orders.length ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
              Todavia no hay pedidos.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
