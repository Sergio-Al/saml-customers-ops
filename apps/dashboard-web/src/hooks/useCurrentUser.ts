import { useQuery } from "@tanstack/react-query";
import type { Role, User } from "@ai-ops/shared-types";
import { AUTH_BASE_URL } from "@/lib/auth-client";
import { http } from "@/lib/http";
import { useAuth, type UserRole } from "@/stores/auth.store";

interface MeResponse {
  user: User;
  tenantId: string;
  role: Role;
}

/**
 * Loads the current user from `/auth/me` and hydrates the auth store.
 * Should be mounted once at the top of the authed layout.
 */
export function useCurrentUser() {
  const setAuth = useAuth((s) => s.setAuth);
  const token = useAuth((s) => s.token);

  return useQuery<MeResponse>({
    queryKey: ["auth", "me"],
    enabled: Boolean(token),
    queryFn: async () => {
      const data = await http<MeResponse>(`${AUTH_BASE_URL}/auth/me`);
      if (token) {
        setAuth({
          user: {
            id: data.user.id,
            name: data.user.displayName,
            email: data.user.email,
          },
          token,
          tenantId: data.tenantId,
          role: data.role as UserRole,
        });
      }
      return data;
    },
  });
}
