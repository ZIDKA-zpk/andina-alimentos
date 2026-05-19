import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
};

const sellerRoutes = ["/dashboard", "/productos", "/pedidos"];

export function getRoleHome(role: UserRole) {
  return role === "admin" ? "/admin" : "/dashboard";
}

export function getSafeNextPath(next?: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}

export function getAllowedNextPath(role: UserRole, next?: string | null) {
  const safeNext = getSafeNextPath(next);

  if (!safeNext) {
    return getRoleHome(role);
  }

  if (role === "admin" && safeNext.startsWith("/admin")) {
    return safeNext;
  }

  if (
    role === "seller" &&
    sellerRoutes.some((route) => safeNext.startsWith(route))
  ) {
    return safeNext;
  }

  return getRoleHome(role);
}

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, is_active")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    return null;
  }

  return profile;
}

export async function requireRole(role: UserRole) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    const params = new URLSearchParams({
      error: "Tu cuenta aun no esta activa.",
    });

    redirect(`/logout?${params.toString()}`);
  }

  if (profile.role !== role) {
    redirect(getRoleHome(profile.role));
  }

  return profile;
}
