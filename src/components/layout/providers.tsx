"use client";

import { AuthProvider } from "@/lib/auth-context";
import { HelpProvider } from "@/lib/help-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HelpProvider>{children}</HelpProvider>
    </AuthProvider>
  );
}
