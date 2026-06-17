export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminDashboardData, getPendingCredentials } from "@/lib/db/admin-actions";
import { AdminClinicList } from "@/components/admin/clinic-list";
import { AdminCredentialList } from "@/components/admin/credential-list";
import { AdminPasswordReset } from "@/components/admin/password-reset";
import { KpiDetailPanels } from "@/components/admin/kpi-detail-panels";

export default async function AdminPage() {
  const [data, pendingCreds] = await Promise.all([
    getAdminDashboardData(),
    getPendingCredentials(),
  ]);

  const { metrics, workers, clinics, jobs } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Dashboard Overview</h1>

      {/* Clickable KPI Cards with Detail Panels */}
      <KpiDetailPanels metrics={metrics} />

      <div className="grid gap-8 lg:grid-cols-2 mt-8">
        {/* Recent Workers */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Workers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workers.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <div>
                    <p className="text-sm font-medium">{w.firstName} {w.lastName}</p>
                    <p className="text-xs text-muted-foreground">{w.specialty} — {w.location || "No location"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{w.email}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {workers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No workers yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Clinics */}
        <AdminClinicList clinics={clinics} />

        {/* Recent Jobs */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Job Postings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.map((j) => (
                <div key={j.id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{j.title}</p>
                      <Badge variant={j.status === "open" ? "default" : j.status === "filled" ? "secondary" : "outline"} className="text-[9px]">
                        {j.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{j.clinic.name} — {j.dates}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{j.rate}</p>
                    <p className="text-[10px] text-muted-foreground">{j._count.applications} applicant{j._count.applications !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No jobs yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Pending Credentials */}
        <AdminCredentialList credentials={pendingCreds} />

        {/* Password Reset */}
        <AdminPasswordReset />
      </div>
    </div>
  );
}
