import { FeedbackMessage } from "@/components/ui/feedback-message";
import { getSellerOrders } from "@/lib/data";
import { formatDate, toMoney } from "@/lib/format";

const statusLabel = {
  approved: "Aprobado",
  cancelled: "Cancelado",
  pending: "Pendiente",
  rejected: "Rechazado",
};

type SellerOrdersPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function SellerOrdersPage({
  searchParams,
}: SellerOrdersPageProps) {
  const [params, orders] = await Promise.all([searchParams, getSellerOrders()]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-emerald-700">Pedidos</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Historial de pedidos
        </h1>

        <FeedbackMessage error={params.error} success={params.success} />

        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={order.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-slate-950">
                    {toMoney(order.total)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {statusLabel[order.status]}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {!orders.length ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
              Aun no tienes pedidos.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
