"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Building2, Briefcase, FileText, MessageSquare, Star,
  DollarSign, Crown, ShieldCheck, ChevronDown, ChevronUp, X,
} from "lucide-react";
import {
  getSignupDetails,
  getJobDetails,
  getApplicationDetails,
  getRevenueDetails,
  getEngagementDetails,
} from "@/lib/db/admin-kpi-actions";

type Panel = "signups" | "jobs" | "applications" | "revenue" | "engagement" | null;

export function KpiDetailPanels({ metrics }: { metrics: any }) {
  const [activePanel, setActivePanel] = useState<Panel>(null);

  function toggle(panel: Panel) {
    setActivePanel(activePanel === panel ? null : panel);
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon={Users} value={metrics.totalWorkers} label="Workers" sub={metrics.recentWorkers > 0 ? `+${metrics.recentWorkers} this week` : undefined} active={activePanel === "signups"} onClick={() => toggle("signups")} />
        <KpiCard icon={Building2} value={metrics.claimedClinics} label="Active Clinics" sub={metrics.recentClinics > 0 ? `+${metrics.recentClinics} this week` : undefined} active={activePanel === "signups"} onClick={() => toggle("signups")} />
        <KpiCard icon={Briefcase} value={metrics.openJobs} label="Open Jobs" sub={`${metrics.totalJobs} total`} active={activePanel === "jobs"} onClick={() => toggle("jobs")} />
        <KpiCard icon={FileText} value={metrics.pendingApplications} label="Pending Apps" sub={`${metrics.totalApplications} total`} active={activePanel === "applications"} onClick={() => toggle("applications")} />
        <KpiCard icon={DollarSign} value={`$${(metrics.revenueTotal / 100).toFixed(0)}`} label="Total Revenue" sub={`$${(metrics.revenue30d / 100).toFixed(0)} last 30d`} active={activePanel === "revenue"} onClick={() => toggle("revenue")} />
        <KpiCard icon={Crown} value={metrics.premiumSubscribers} label="Premium Subs" active={activePanel === "revenue"} onClick={() => toggle("revenue")} />
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniKpi icon={MessageSquare} value={metrics.totalMessages} label="Messages" active={activePanel === "engagement"} onClick={() => toggle("engagement")} />
        <MiniKpi icon={Star} value={metrics.totalReviews} label="Reviews" active={activePanel === "engagement"} onClick={() => toggle("engagement")} />
        <MiniKpi icon={ShieldCheck} value={metrics.totalCredentials} label="Credentials" active={activePanel === "engagement"} onClick={() => toggle("engagement")} />
        <MiniKpi icon={Building2} value={metrics.totalClinics - metrics.claimedClinics} label="Unclaimed" active={activePanel === "signups"} onClick={() => toggle("signups")} />
      </div>

      {/* Detail Panel */}
      {activePanel && (
        <DetailPanel panel={activePanel} onClose={() => setActivePanel(null)} />
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, value, label, sub, active, onClick }: {
  icon: any; value: string | number; label: string; sub?: string; active: boolean; onClick: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${active ? "ring-2 ring-primary border-primary" : "hover:border-primary/40"}`}
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <Icon className="mx-auto h-5 w-5 text-primary mb-1" />
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
        <ChevronDown className={`mx-auto h-3 w-3 mt-1 text-muted-foreground transition-transform ${active ? "rotate-180" : ""}`} />
      </CardContent>
    </Card>
  );
}

function MiniKpi({ icon: Icon, value, label, active, onClick }: {
  icon: any; value: number; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-sm ${active ? "ring-2 ring-primary border-primary" : "hover:border-primary/40"}`}
      onClick={onClick}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-lg font-bold">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailPanel({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    const fetch = async () => {
      switch (panel) {
        case "signups": setData(await getSignupDetails()); break;
        case "jobs": setData(await getJobDetails()); break;
        case "applications": setData(await getApplicationDetails()); break;
        case "revenue": setData(await getRevenueDetails()); break;
        case "engagement": setData(await getEngagementDetails()); break;
      }
      setLoading(false);
    };
    fetch();
  }, [panel]);

  const titles: Record<string, string> = {
    signups: "Users & Signups",
    jobs: "Job Postings",
    applications: "Applications",
    revenue: "Revenue",
    engagement: "Platform Engagement",
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">{titles[panel!]}</CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        ) : panel === "signups" ? (
          <SignupDetail data={data} />
        ) : panel === "jobs" ? (
          <JobDetail data={data} />
        ) : panel === "applications" ? (
          <ApplicationDetail data={data} />
        ) : panel === "revenue" ? (
          <RevenueDetail data={data} />
        ) : panel === "engagement" ? (
          <EngagementDetail data={data} />
        ) : null}
      </CardContent>
    </Card>
  );
}

function SignupDetail({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* 30-day sparkline */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Daily Signups (Last 30 Days)</p>
        <div className="flex items-end gap-0.5 h-16">
          {data.dailySignups.map((day: any, i: number) => {
            const total = day.workers + day.clinics;
            const maxVal = Math.max(...data.dailySignups.map((d: any) => d.workers + d.clinics), 1);
            const height = total > 0 ? Math.max((total / maxVal) * 100, 10) : 2;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${day.date}: ${total} signups`}>
                <div className="w-full bg-primary/70 rounded-t-sm" style={{ height: `${height}%` }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
          <span>{data.dailySignups[0]?.date}</span>
          <span>{data.dailySignups[data.dailySignups.length - 1]?.date}</span>
        </div>
      </div>

      {/* Recent workers */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Workers ({data.totalWorkers})</p>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {data.workers.slice(0, 20).map((w: any) => (
            <div key={w.id} className="flex items-center justify-between text-xs border-b pb-1">
              <span>{w.firstName} {w.lastName} <span className="text-muted-foreground">— {w.specialty}</span></span>
              <span className="text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent clinics */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Clinics ({data.totalClinics})</p>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {data.clinics.slice(0, 20).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between text-xs border-b pb-1">
              <span>{c.name} {c.premiumTier && <Badge variant="default" className="text-[8px] ml-1">Premium</Badge>}</span>
              <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobDetail({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Status breakdown */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(data.byStatus).map(([status, count]) => (
          <div key={status} className="rounded-lg bg-muted p-3 text-center">
            <p className="text-lg font-bold">{count as number}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{status}</p>
          </div>
        ))}
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(data.byType).map(([type, count]) => (
          <div key={type} className="rounded-lg border p-3 text-center">
            <p className="text-lg font-bold">{count as number}</p>
            <p className="text-[10px] text-muted-foreground">{type}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Avg applicants per job: <strong>{data.avgApplicants}</strong></p>

      {/* Job list */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {data.jobs.slice(0, 30).map((j: any) => (
          <div key={j.id} className="flex items-center justify-between text-xs border-b pb-1">
            <div>
              <span className="font-medium">{j.title}</span>
              <span className="text-muted-foreground"> — {j.clinic.name}</span>
              <Badge variant={j.status === "open" ? "default" : "secondary"} className="text-[8px] ml-1">{j.status}</Badge>
            </div>
            <div className="text-right text-muted-foreground">
              <span>{j._count.applications} apps</span> · <span>{j.rate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationDetail({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-center">
          <p className="text-lg font-bold text-amber-700">{data.byStatus.pending}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
          <p className="text-lg font-bold text-green-700">{data.byStatus.accepted}</p>
          <p className="text-[10px] text-muted-foreground">Accepted</p>
        </div>
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-center">
          <p className="text-lg font-bold text-red-700">{data.byStatus.rejected}</p>
          <p className="text-[10px] text-muted-foreground">Rejected</p>
        </div>
        <div className="rounded-lg bg-muted p-3 text-center">
          <p className="text-lg font-bold">{data.byStatus.withdrawn}</p>
          <p className="text-[10px] text-muted-foreground">Withdrawn</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Accept rate: <strong>{data.acceptRate}%</strong> ({data.byStatus.accepted} of {data.total})</p>

      {/* Application list */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {data.applications.slice(0, 30).map((a: any) => (
          <div key={a.id} className="flex items-center justify-between text-xs border-b pb-1">
            <div>
              <span className="font-medium">{a.worker.firstName} {a.worker.lastName}</span>
              <span className="text-muted-foreground"> → {a.job.title} at {a.job.clinic.name}</span>
            </div>
            <Badge variant={a.status === "accepted" ? "default" : a.status === "pending" ? "outline" : "secondary"} className="text-[8px]">{a.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueDetail({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Revenue breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
          <p className="text-lg font-bold text-primary">${(data.totalRevenue / 100).toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">Total Revenue</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold">${(data.postingRevenue / 100).toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">From Postings</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold">${(data.premiumRevenue / 100).toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">From Premium</p>
        </div>
      </div>

      {/* Monthly */}
      {data.monthlyRevenue.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Monthly Revenue</p>
          {data.monthlyRevenue.map((m: any) => (
            <div key={m.month} className="flex items-center justify-between text-xs border-b pb-1 mb-1">
              <span>{m.month}</span>
              <span className="font-bold">${(m.amount / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Transaction list */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">All Transactions</p>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {data.payments.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between text-xs border-b pb-1">
              <div>
                <span>{p.description}</span>
                {p.email && <span className="text-muted-foreground"> — {p.email}</span>}
              </div>
              <div className="text-right">
                <span className="font-bold">${(p.amount / 100).toFixed(2)}</span>
                <span className="text-muted-foreground ml-2">{p.date}</span>
              </div>
            </div>
          ))}
          {data.payments.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No transactions yet.</p>}
        </div>
      </div>
    </div>
  );
}

function EngagementDetail({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold">{data.totalMessages}</p>
          <p className="text-[10px] text-muted-foreground">Messages</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold">{data.totalReviews}</p>
          <p className="text-[10px] text-muted-foreground">Reviews</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold">{data.totalCredentials}</p>
          <p className="text-[10px] text-muted-foreground">Credentials</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-lg font-bold">{data.verifiedCredentials}</p>
          <p className="text-[10px] text-muted-foreground">Verified</p>
        </div>
      </div>

      {/* Recent messages */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Messages</p>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {data.messages.slice(0, 15).map((m: any) => (
            <div key={m.id} className="flex items-center justify-between text-xs border-b pb-1">
              <div className="truncate flex-1 mr-2">
                <span className="font-medium">{m.senderName}</span>
                <span className="text-muted-foreground">: {m.content.slice(0, 60)}{m.content.length > 60 ? "..." : ""}</span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {data.messages.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No messages yet.</p>}
        </div>
      </div>

      {/* Recent reviews */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Reviews</p>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {data.reviews.slice(0, 15).map((r: any) => (
            <div key={r.id} className="flex items-center justify-between text-xs border-b pb-1">
              <div className="truncate flex-1 mr-2">
                <span className="font-medium">{r.fromName}</span>
                <span className="text-muted-foreground"> ({r.rating}★{r.isPrivate ? " 🔒" : ""}): {r.comment.slice(0, 50)}{r.comment.length > 50 ? "..." : ""}</span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{r.date}</span>
            </div>
          ))}
          {data.reviews.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No reviews yet.</p>}
        </div>
      </div>
    </div>
  );
}
