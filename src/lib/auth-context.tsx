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
  needsProfile: boolean;
  pendingAuthUser: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  setProfileComplete: (authUser: AuthUser) => void;
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
  const [needsProfile, setNeedsProfile] = useState(false);
  const [pendingAuthUser, setPendingAuthUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: supaUser } }) => {
      if (supaUser) {
        const authUser = toAuthUser(supaUser);
        if (authUser) {
          setUser(authUser);
        } else {
          // Signed in but no profile (e.g., new Google user)
          setPendingAuthUser(supaUser);
          setNeedsProfile(true);
        }
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const authUser = toAuthUser(session.user);
          if (authUser) {
            setUser(authUser);
            setNeedsProfile(false);
            setPendingAuthUser(null);
          } else {
            setPendingAuthUser(session.user);
            setNeedsProfile(true);
          }
        } else {
          setUser(null);
          setNeedsProfile(false);
          setPendingAuthUser(null);
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
        console.error("Supabase sign-in error:", error.message, error.status);
        return { success: false, error: error.message || "Invalid email or password." };
      }
      if (data.user) {
        setUser(toAuthUser(data.user));
      }
      return { success: true };
    },
    [supabase],
  );

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNeedsProfile(false);
    setPendingAuthUser(null);
    router.push("/");
  }, [supabase, router]);

  const setProfileComplete = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    setNeedsProfile(false);
    setPendingAuthUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, needsProfile, pendingAuthUser, signIn, signInWithGoogle, signOut, setProfileComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
