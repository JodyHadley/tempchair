export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  MessageSquare,
  Star,
  DollarSign,
  Crown,
  TrendingUp,
  ShieldCheck,
  Clock,
  CalendarDays,
} from "lucide-react";
import { getAdminDashboardData, getPendingCredentials } from "@/lib/db/admin-actions";
import { AdminClinicList } from "@/components/admin/clinic-list";
import { AdminCredentialList } from "@/components/admin/credential-list";

export default async function AdminPage() {
  const [data, pendingCreds] = await Promise.all([
    getAdminDashboardData(),
    getPendingCredentials(),
  ]);

  const { metrics, workers, clinics, jobs } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Dashboard Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="text-2xl font-bold">{metrics.totalWorkers}</p>
            <p className="text-[10px] text-muted-foreground">Workers</p>
            {metrics.recentWorkers > 0 && (
              <Badge variant="secondary" className="mt-1 text-[9px]">+{metrics.recentWorkers} this week</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="text-2xl font-bold">{metrics.claimedClinics}</p>
            <p className="text-[10px] text-muted-foreground">Active Clinics</p>
            {metrics.recentClinics > 0 && (
              <Badge variant="secondary" className="mt-1 text-[9px]">+{metrics.recentClinics} this week</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Briefcase className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="text-2xl font-bold">{metrics.openJobs}</p>
            <p className="text-[10px] text-muted-foreground">Open Jobs</p>
            <p className="text-[9px] text-muted-foreground">{metrics.totalJobs} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="text-2xl font-bold">{metrics.pendingApplications}</p>
            <p className="text-[10px] text-muted-foreground">Pending Apps</p>
            <p className="text-[9px] text-muted-foreground">{metrics.totalApplications} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="text-2xl font-bold">${(metrics.revenueTotal / 100).toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Total Revenue</p>
            <p className="text-[9px] text-muted-foreground">${(metrics.revenue30d / 100).toFixed(0)} last 30d</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="text-2xl font-bold">{metrics.premiumSubscribers}</p>
            <p className="text-[10px] text-muted-foreground">Premium Subs</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{metrics.totalMessages}</p>
              <p className="text-[10px] text-muted-foreground">Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Star className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{metrics.totalReviews}</p>
              <p className="text-[10px] text-muted-foreground">Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{metrics.totalCredentials}</p>
              <p className="text-[10px] text-muted-foreground">Credentials</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{metrics.totalClinics - metrics.claimedClinics}</p>
              <p className="text-[10px] text-muted-foreground">Unclaimed Clinics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
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
      </div>
    </div>
  );
}
