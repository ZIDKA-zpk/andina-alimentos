import type { UserRole } from "@/types/domain";

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
