import Link from "next/link";

import { logout } from "@/actions/auth";
import { requireRole } from "@/lib/auth";

export default async function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole("seller");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Andina de Alimentos
            </p>
            <p className="text-sm text-slate-500">{profile.full_name}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
            <Link className="hover:text-emerald-700" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-emerald-700" href="/productos">
              Productos
            </Link>
            <Link className="hover:text-emerald-700" href="/pedidos">
              Pedidos
            </Link>
            <form action={logout}>
              <button className="hover:text-red-600" type="submit">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
