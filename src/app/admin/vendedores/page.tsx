import { updateSeller } from "@/actions/sellers";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { getSellers } from "@/lib/data";
import { formatDate } from "@/lib/format";

type AdminSellersPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AdminSellersPage({
  searchParams,
}: AdminSellersPageProps) {
  const [params, sellers] = await Promise.all([searchParams, getSellers()]);
  const activeSellers = sellers.filter((seller) => seller.is_active).length;
  const pendingSellers = sellers.length - activeSellers;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-emerald-700">Admin</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">
              Gestion de vendedores
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Activa cuentas, actualiza datos de contacto y controla quien puede
              crear pedidos.
            </p>
          </div>
        </div>

        <FeedbackMessage error={params.error} success={params.success} />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total vendedores</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {sellers.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Activos</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-700">
              {activeSellers}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pendientes</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {pendingSellers}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {sellers.map((seller) => (
            <form
              action={updateSeller}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={seller.id}
            >
              <input name="id" type="hidden" value={seller.id} />

              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    {seller.email}
                  </p>
                  <label className="mt-3 block">
                    <span className="text-xs font-medium text-slate-500">
                      Nombre
                    </span>
                    <input
                      className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600"
                      defaultValue={seller.full_name}
                      name="full_name"
                      placeholder="Nombre del vendedor"
                      required
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-slate-500">
                    Telefono
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600"
                    defaultValue={seller.phone ?? ""}
                    name="phone"
                    placeholder="Ej. 70000000"
                  />
                </label>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Registro
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {formatDate(seller.created_at)}
                  </p>
                  <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      className="h-4 w-4 accent-emerald-700"
                      defaultChecked={seller.is_active}
                      name="is_active"
                      type="checkbox"
                    />
                    Cuenta activa
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <span
                    className={`inline-flex justify-center rounded-md px-3 py-2 text-xs font-semibold ${
                      seller.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {seller.is_active ? "Activo" : "Pendiente"}
                  </span>
                  <button
                    className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                    type="submit"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          ))}

          {!sellers.length ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
              Todavia no hay vendedores registrados. Crea usuarios en Supabase
              Auth y luego activalos aqui.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
