import { User } from "../types/auth";

export type UserRole = "admin" | "user";

export function getDashboardUrl(role: UserRole): string {
  return role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}

export function isAuthorizedForRoute(user: User | null, requiredRole?: UserRole): boolean {
  if (!user) return false;
  if (!requiredRole) return true;
  return user.role === requiredRole;
}

export function redirectAfterLogin(user: User): string {
  if (!user?.role) return "/user/dashboard";
  return getDashboardUrl(user.role as UserRole);
}
