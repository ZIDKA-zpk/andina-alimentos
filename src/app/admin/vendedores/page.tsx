import { getSellers } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default async function AdminSellersPage() {
  const sellers = await getSellers();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-emerald-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Vendedores registrados
        </h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {sellers.map((seller) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={seller.id}
            >
              <p className="font-semibold text-slate-950">
                {seller.full_name || "Vendedor sin nombre"}
              </p>
              <p className="mt-1 text-sm text-slate-500">{seller.email}</p>
              <p className="mt-1 text-xs text-slate-400">
                Registro: {formatDate(seller.created_at)}
              </p>
              <p
                className={`mt-4 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                  seller.is_active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {seller.is_active ? "Activo" : "Pendiente"}
              </p>
            </article>
          ))}

          {!sellers.length ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
              Todavia no hay vendedores registrados.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
