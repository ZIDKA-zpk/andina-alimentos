import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Andina de Alimentos
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-5xl">
              Pedidos para vendedores de congelados
            </h1>
          </div>
        </header>

        <div className="grid gap-4 py-10 md:grid-cols-3">
          <Link
            href="/login"
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500"
          >
            <p className="text-sm font-medium text-slate-500">Acceso</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Iniciar sesion
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Entrada unica para vendedores y administradores.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500"
          >
            <p className="text-sm font-medium text-slate-500">Vendedor</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Panel de pedidos
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ver productos, precios, descuentos y pedidos recientes.
            </p>
          </Link>

          <Link
            href="/admin"
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500"
          >
            <p className="text-sm font-medium text-slate-500">Admin</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Gestion comercial
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Productos, stock, pedidos pendientes y vendedores.
            </p>
          </Link>
        </div>

        <footer className="border-t border-slate-200 pt-5 text-sm text-slate-500">
          MVP local: primero armamos pantallas, luego conectamos Supabase.
        </footer>
      </section>
    </main>
  );
}
