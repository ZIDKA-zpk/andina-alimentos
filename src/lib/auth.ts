import { redirect } from "next/navigation";

import { getRoleHome } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/server";
export {
  getAllowedNextPath,
  getRoleHome,
  getSafeNextPath,
} from "@/lib/auth-routes";
import type { UserRole } from "@/types/domain";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
};

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
