import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSignOut } from "@/components/admin/admin-header";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.isAdmin) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="border-b bg-foreground/5">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Admin Dashboard</span>
              <span className="text-xs text-muted-foreground">— {user.email}</span>
            </div>
            <AdminSignOut />
          </div>
        </div>
      </div>
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AdminNav />
        </div>
      </div>
      {children}
    </div>
  );
}
