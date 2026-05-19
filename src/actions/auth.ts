"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAllowedNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  next: z.string().optional(),
});

function redirectWithLoginError(message: string, next?: string): never {
  const params = new URLSearchParams({
    error: message,
  });

  if (next) {
    params.set("next", next);
  }

  redirect(`/login?${params.toString()}`);
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next")?.toString(),
  });

  if (!parsed.success) {
    redirectWithLoginError("Revisa tu email y password.");
  }

  const { email, next, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithLoginError("Credenciales incorrectas.", next);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirectWithLoginError("No pudimos iniciar tu sesion.", next);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single<{ role: UserRole; is_active: boolean }>();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirectWithLoginError("No encontramos tu perfil de usuario.", next);
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirectWithLoginError("Tu cuenta aun no esta activa.", next);
  }

  revalidatePath("/", "layout");
  redirect(getAllowedNextPath(profile.role, next));
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
