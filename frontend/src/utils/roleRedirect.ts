import { User } from "../types/auth";

export function redirectAfterLogin(user: User): string {
  if (!user?.role) return "/user/dashboard";
  return user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}
