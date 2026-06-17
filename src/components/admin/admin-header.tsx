"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AdminSignOut() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  return (
    <Button variant="ghost" size="sm" className="text-xs" onClick={handleSignOut}>
      <LogOut className="h-3.5 w-3.5 mr-1.5" />
      Sign Out
    </Button>
  );
}
