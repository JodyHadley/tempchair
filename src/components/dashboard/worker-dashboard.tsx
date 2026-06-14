"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WorkerProfileEdit } from "./worker-profile-edit";
import {
  Star,
  MapPin,
  CalendarDays,
  Clock,
  Building2,
  Briefcase,
  Pencil,
  CheckCircle2,
  XCircle,
  ClockIcon,
} from "lucide-react";
import type { getWorkerDashboardData } from "@/lib/db/actions";

type DashboardData = Awaited<ReturnType<typeof getWorkerDashboardData>>;

type StatusKey = "pending" | "accepted" | "rejected" | "withdrawn";

const statusConfig: Record<StatusKey, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending", variant: "outline", icon: ClockIcon },
  accepted: { label: "Accepted", variant: "default", icon: CheckCircle2 },
  rejected: { label: "Declined", variant: "destructive", icon: XCircle },
  withdrawn: { label: "Withdrawn", variant: "secondary", icon: XCircle },
};

export function WorkerDashboard({ data, onRefresh }: { data: DashboardData; onRefresh?: () => void }) {
  const { worker, applications, reviews } = data;
  const [editing, setEditing] = useState(false);
  if (!worker) return null;

  const upcomingShifts = applications.filter(
    (a) => a.status === "accepted" && (a.job.status === "filled" || a.job.status === "open"),
  );

  const completedShifts = applications.filter(
    (a) => a.status === "accepted" && a.job.status === "completed",
  );

  const pendingApps = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {worker.firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your TempChair profile.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">
            My Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="shifts">My Shifts</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {editing ? (
              <div className="lg:col-span-1">
                <WorkerProfileEdit
                  worker={worker}
                  onClose={() => setEditing(false)}
                  onSaved={() => {
                    setEditing(false);
                    onRefresh?.();
                  }}
                />
              </div>
            ) : (
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {worker.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-lg font-semibold">
                    {worker.firstName} {worker.lastName}
                  </h2>
                  <p className="text-sm text-primary font-medium">{worker.specialty}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {worker.location}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="font-medium">{worker.rating}</span>
                    <span className="text-muted-foreground">({worker.reviewCount} reviews)</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="w-full text-left space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Experience</p>
                    <p className="text-sm">{worker.experience}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3">Rate</p>
                    <p className="text-sm font-medium text-primary">{worker.hourlyRate}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3">Certifications</p>
                    <div className="flex flex-wrap gap-1.5">
                      {worker.certifications.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{completedShifts.length}</p><p className="text-xs text-muted-foreground">Completed Shifts</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{upcomingShifts.length}</p><p className="text-xs text-muted-foreground">Upcoming Shifts</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{pendingApps}</p><p className="text-xs text-muted-foreground">Pending Apps</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{worker.rating}</p><p className="text-xs text-muted-foreground">Avg Rating</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Upcoming Shifts</CardTitle></CardHeader>
                <CardContent>
                  {upcomingShifts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming shifts. Browse open positions to apply!</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingShifts.map((a) => (
                        <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{a.job.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{a.job.clinic.name}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{a.job.dates}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.job.hours}</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary">{a.job.rate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {reviews.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Latest Reviews</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reviews.slice(0, 2).map((review) => (
                        <div key={review.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{review.fromName}</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">You haven&apos;t applied to any positions yet.</CardContent></Card>
            ) : (
              applications.map((app) => {
                const config = statusConfig[app.status as StatusKey];
                const StatusIcon = config.icon;
                return (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{app.job.title}</h3>
                            <Badge variant={config.variant} className="text-xs">
                              <StatusIcon className="mr-1 h-3 w-3" />{config.label}
                            </Badge>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{app.job.clinic.name}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{app.job.dates}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{app.job.hours}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground italic">&ldquo;{app.coverNote}&rdquo;</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-primary">{app.job.rate}</span>
                          <p className="text-xs text-muted-foreground mt-1">Applied {app.appliedDate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Shifts Tab */}
        <TabsContent value="shifts">
          <div className="space-y-6">
            {upcomingShifts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming</h3>
                <div className="space-y-3">
                  {upcomingShifts.map((a) => (
                    <Card key={a.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{a.job.title}</h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{a.job.clinic.name}</span>
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.job.clinic.location}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{a.job.dates}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.job.hours}</span>
                            </div>
                          </div>
                          <Badge variant="default">Confirmed</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {completedShifts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Completed</h3>
                <div className="space-y-3">
                  {completedShifts.map((a) => (
                    <Card key={a.id} className="opacity-80">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{a.job.title}</h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{a.job.clinic.name}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{a.job.dates}</span>
                            </div>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {upcomingShifts.length === 0 && completedShifts.length === 0 && (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No shifts yet. Apply to open positions to get started!</CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No reviews yet. Complete shifts to start building your reputation!</CardContent></Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.fromName}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                        {review.job && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            <Briefcase className="inline h-3 w-3 mr-1" />{review.job.title} &middot; {review.job.dates}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
