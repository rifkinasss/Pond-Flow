import { getCurrentUser } from "@/shared/lib/auth";

export async function getAdminUser() {
  const user = await getCurrentUser();
  return user && (user.role === "admin" || user.role === "superadmin") ? user : null;
}
