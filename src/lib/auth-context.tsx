"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  role: "worker" | "clinic";
  email: string;
  name: string;
  initials: string;
  authUserId: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(supaUser: User): AuthUser | null {
  const meta = supaUser.user_metadata;
  if (!meta?.role || !meta?.profileId) return null;
  return {
    id: meta.profileId,
    role: meta.role,
    email: supaUser.email ?? "",
    name: meta.name ?? supaUser.email ?? "",
    initials: meta.initials ?? "",
    authUserId: supaUser.id,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user: supaUser } }) => {
      if (supaUser) {
        setUser(toAuthUser(supaUser));
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(toAuthUser(session.user));
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: "Invalid email or password. Try a test account below." };
      }
      if (data.user) {
        setUser(toAuthUser(data.user));
      }
      return { success: true };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }, [supabase, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
