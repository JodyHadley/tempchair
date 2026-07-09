"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WorkerProfileEdit } from "./worker-profile-edit";
import { ReviewForm, PrivateBadge } from "./review-form";
import { ReviewEditForm } from "./review-edit-form";
import { CredentialVault } from "./credential-vault";
import { MessageThread } from "./message-thread";
import { ChangePassword } from "./change-password";
import { EmptyState } from "./empty-state";
import { OnboardingChecklist } from "./onboarding-checklist";
import { cn } from "@/lib/utils";
import {
  Star,
  MapPin,
  CalendarDays,
  Clock,
  Building2,
  Briefcase,
  Pencil,
  MessageSquarePlus,
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
  const { worker, applications, reviews, reviewsGiven, credentials } = data;
  const [editing, setEditing] = useState(false);
  const [reviewingShift, setReviewingShift] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reviewView, setReviewView] = useState<"received" | "given">("received");
  if (!worker) return null;

  const upcomingShifts = applications.filter(
    (a) => a.status === "accepted" && (a.job.status === "filled" || a.job.status === "open"),
  );

  const completedShifts = applications.filter(
    (a) => a.status === "accepted" && a.job.status === "completed",
  );

  const pendingApps = applications.filter((a) => a.status === "pending").length;
  const profileComplete =
    Boolean(worker.bio?.trim()) &&
    worker.bio.length > 20 &&
    Boolean(worker.location?.trim()) &&
    Boolean(worker.hourlyRate?.trim()) &&
    Boolean(worker.experience?.trim());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {worker.firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your applications, shifts, and schedule.
        </p>
      </div>

      <OnboardingChecklist
        profileId={worker.id}
        role="worker"
        onTabChange={setActiveTab}
        steps={[
          {
            id: "profile",
            label: "Complete your profile",
            done: profileComplete,
            action: { type: "tab", value: "overview" },
            actionLabel: "Edit profile",
          },
          {
            id: "credential",
            label: "Add a credential",
            done: credentials.length > 0,
            action: { type: "tab", value: "credentials" },
            actionLabel: "Add credential",
          },
          {
            id: "apply",
            label: "Apply to a position",
            done: applications.length > 0,
            action: { type: "href", href: "/jobs" },
            actionLabel: "Browse jobs",
          },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length + reviewsGiven.length})</TabsTrigger>
          <TabsTrigger value="credentials">Credentials ({credentials.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                <HelpTooltip text="Shifts you've worked and completed. Click to see your shift history and leave reviews.">
                  <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setActiveTab("shifts")}>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{completedShifts.length}</p>
                      <p className="text-xs text-muted-foreground">Completed Shifts</p>
                    </CardContent>
                  </Card>
                </HelpTooltip>
                <HelpTooltip text="Confirmed shifts you have coming up. Click to see dates, locations, and clinic details.">
                  <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setActiveTab("shifts")}>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{upcomingShifts.length}</p>
                      <p className="text-xs text-muted-foreground">Upcoming Shifts</p>
                    </CardContent>
                  </Card>
                </HelpTooltip>
                <HelpTooltip text="Applications waiting for a clinic's response. Click to view their status.">
                  <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setActiveTab("applications")}>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{pendingApps}</p>
                      <p className="text-xs text-muted-foreground">Awaiting reply</p>
                    </CardContent>
                  </Card>
                </HelpTooltip>
                <HelpTooltip text="Your average rating from clinics you've worked with. Higher ratings help you stand out to new clinics.">
                  <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setActiveTab("reviews")}>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{worker.rating}</p>
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
                    </CardContent>
                  </Card>
                </HelpTooltip>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Upcoming shifts</CardTitle></CardHeader>
                <CardContent>
                  {upcomingShifts.length === 0 ? (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">No upcoming shifts yet.</p>
                      <Link href="/jobs" className={cn(buttonVariants({ size: "sm" }), "mt-3")}>
                        Browse open positions
                      </Link>
                      <p className="mt-2 text-xs text-muted-foreground">Profiles with credentials stand out to clinics.</p>
                    </div>
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
              <EmptyState
                icon={Briefcase}
                title="You haven't applied to any positions yet"
                description="Browse open shifts at clinics near you and apply in minutes."
                actionLabel="Browse open positions"
                href="/jobs"
                tip="Profiles with credentials get more attention from clinics."
              />
            ) : (
              applications.map((app) => {
                const config = statusConfig[app.status as StatusKey];
                const StatusIcon = config.icon;
                const unread =
                  app.messages?.filter((m: { senderRole: string; readAt: Date | null }) => m.senderRole === "clinic" && !m.readAt).length || 0;
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
                            {unread > 0 && (
                              <Badge variant="default" className="text-[10px]">{unread} new message{unread !== 1 ? "s" : ""}</Badge>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{app.job.clinic.name}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{app.job.dates}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{app.job.hours}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground italic">&ldquo;{app.coverNote}&rdquo;</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-bold text-primary">{app.job.rate}</span>
                          <p className="text-xs text-muted-foreground">Applied {app.appliedDate}</p>
                          {app.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const { withdrawApplication } = await import("@/lib/db/actions");
                                await withdrawApplication(app.id, worker.id);
                                onRefresh?.();
                              }}
                            >
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                      {(app.status === "pending" || app.status === "accepted") && (
                        <MessageThread
                          applicationId={app.id}
                          currentRole="worker"
                          currentName={`${worker.firstName} ${worker.lastName}`}
                          currentId={worker.id}
                          otherName={app.job.clinic.name}
                          unreadCount={unread}
                          defaultOpen={unread > 0}
                        />
                      )}
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
                    <div key={a.id}>
                      {reviewingShift === a.id ? (
                        <ReviewForm
                          fromWorkerId={worker.id}
                          fromRole="worker"
                          fromName={`${worker.firstName} ${worker.lastName}`}
                          toClinicId={a.job.clinicId}
                          toRole="clinic"
                          toName={a.job.clinic.name}
                          jobId={a.job.id}
                          jobTitle={a.job.title}
                          canWritePrivate={true}
                          onClose={() => setReviewingShift(null)}
                          onSubmitted={() => {
                            setReviewingShift(null);
                            onRefresh?.();
                          }}
                        />
                      ) : (
                        <Card className="opacity-80">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">{a.job.title}</h3>
                                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{a.job.clinic.name}</span>
                                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{a.job.dates}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setReviewingShift(a.id)}
                                >
                                  <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
                                  Review
                                </Button>
                                <Badge variant="secondary">Completed</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {upcomingShifts.length === 0 && completedShifts.length === 0 && (
              <EmptyState
                icon={CalendarDays}
                title="No shifts yet"
                description="Apply to open positions to get your first confirmed shift."
                actionLabel="Browse open positions"
                href="/jobs"
              />
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab (received + given) */}
        <TabsContent value="reviews">
          <div className="mb-4 flex gap-2">
            <Button
              size="sm"
              variant={reviewView === "received" ? "default" : "outline"}
              onClick={() => setReviewView("received")}
            >
              Received ({reviews.length})
            </Button>
            <Button
              size="sm"
              variant={reviewView === "given" ? "default" : "outline"}
              onClick={() => setReviewView("given")}
            >
              Given ({reviewsGiven.length})
            </Button>
          </div>
          <div className="space-y-4">
            {reviewView === "received" ? (
              reviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No reviews yet"
                  description="Complete shifts to start building your reputation with clinics."
                  actionLabel="Browse open positions"
                  href="/jobs"
                />
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{review.fromName}</span>
                            {review.isPrivate && <PrivateBadge />}
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
              )
            ) : reviewsGiven.length === 0 ? (
              <EmptyState
                icon={Star}
                title="You haven't written any reviews yet"
                description="After a completed shift, you can review the clinic."
              />
            ) : (
              reviewsGiven.map((review) => (
                <div key={review.id}>
                  {editingReview === review.id ? (
                    <ReviewEditForm
                      reviewId={review.id}
                      currentRating={review.rating}
                      currentComment={review.comment}
                      currentIsPrivate={review.isPrivate}
                      canTogglePrivate={true}
                      targetName={review.toRole === "clinic" ? "clinic" : "worker"}
                      fromRole="worker"
                      onClose={() => setEditingReview(null)}
                      onSaved={() => {
                        setEditingReview(null);
                        onRefresh?.();
                      }}
                    />
                  ) : (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Your review of</span>
                              <span className="font-semibold">{review.toRole === "clinic" ? review.fromName : review.fromName}</span>
                              {review.isPrivate && <PrivateBadge />}
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
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingReview(review.id)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <CredentialVault
            credentials={credentials}
            workerId={worker.id}
            specialty={worker.specialty}
            onRefresh={onRefresh}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="max-w-lg">
            <ChangePassword />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
