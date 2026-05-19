import { login } from "@/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Andina de Alimentos
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Iniciar sesion
          </h1>

          {params.error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {params.error}
            </p>
          ) : null}

          <form action={login} className="mt-6 space-y-4">
            <input name="next" type="hidden" value={params.next ?? ""} />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600"
                name="email"
                placeholder="vendedor@andina.com"
                required
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Password
              </span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600"
                name="password"
                placeholder="********"
                required
                type="password"
              />
            </label>
            <button
              className="h-11 w-full rounded-md bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800"
              type="submit"
            >
              Entrar
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-500">
            Usa el usuario admin o vendedor que creaste en Supabase.
          </p>
        </div>
      </section>
    </main>
  );
}
