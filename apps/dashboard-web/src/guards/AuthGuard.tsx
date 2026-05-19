import type { ReactNode } from "react";
import { useAuth } from "@/stores/auth.store";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const user = useAuth((s) => s.user);
  // Phase 2 stub: always render. Phase 3 will redirect to /login when null.
  void user;
  return <>{children}</>;
}
