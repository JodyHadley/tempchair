"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClinicProfileEdit } from "./clinic-profile-edit";
import { ReviewForm, PrivateBadge } from "./review-form";
import { ReviewEditForm } from "./review-edit-form";
import { PostPositionForm } from "./post-position-form";
import { EditPositionForm } from "./edit-position-form";
import {
  Star,
  MapPin,
  CalendarDays,
  Clock,
  Briefcase,
  Users,
  Phone,
  Pencil,
  MessageSquarePlus,
  Plus,
  CheckCircle2,
  XCircle,
  ClockIcon,
} from "lucide-react";
import type { getClinicDashboardData } from "@/lib/db/actions";

type DashboardData = Awaited<ReturnType<typeof getClinicDashboardData>>;

type StatusKey = "pending" | "accepted" | "rejected" | "withdrawn";
type JobStatusKey = "open" | "filled" | "completed" | "cancelled";

const jobStatusConfig: Record<JobStatusKey, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "default" },
  filled: { label: "Filled", variant: "secondary" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const appStatusConfig: Record<StatusKey, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  accepted: { label: "Accepted", variant: "default" },
  rejected: { label: "Declined", variant: "destructive" },
  withdrawn: { label: "Withdrawn", variant: "secondary" },
};

export function ClinicDashboard({ data, onRefresh }: { data: DashboardData; onRefresh?: () => void }) {
  const { clinic, jobs, reviews, reviewsGiven } = data;
  const [editing, setEditing] = useState(false);
  const [reviewingApp, setReviewingApp] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  if (!clinic) return null;

  const allApplications = jobs.flatMap((job) =>
    job.applications.map((app) => ({ ...app, job })),
  );

  const openJobs = jobs.filter((j) => j.status === "open").length;
  const pendingApps = allApplications.filter((a) => a.status === "pending").length;
  const acceptedWorkers = allApplications.filter((a) => a.status === "accepted").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{clinic.name}</h1>
        <p className="mt-1 text-muted-foreground">Manage your positions, applications, and team from your dashboard.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">My Positions ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({allApplications.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="my-reviews">My Reviews ({reviewsGiven.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {editing ? (
              <div className="lg:col-span-1">
                <ClinicProfileEdit
                  clinic={clinic}
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
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{clinic.initials}</AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-lg font-semibold">{clinic.name}</h2>
                  <p className="text-sm text-muted-foreground">{clinic.contactName}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />{clinic.location}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="font-medium">{clinic.rating}</span>
                    <span className="text-muted-foreground">({clinic.reviewCount} reviews)</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="w-full text-left space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</p>
                    <p className="text-sm">{clinic.address}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3">Phone</p>
                    <p className="text-sm flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{clinic.phone}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3">About</p>
                    <p className="text-sm text-muted-foreground">{clinic.description}</p>
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
                <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setActiveTab("positions")}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{openJobs}</p>
                    <p className="text-xs text-muted-foreground">Open Positions</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setActiveTab("applications")}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{pendingApps}</p>
                    <p className="text-xs text-muted-foreground">Pending Apps</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setActiveTab("applications")}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{acceptedWorkers}</p>
                    <p className="text-xs text-muted-foreground">Workers Booked</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setActiveTab("reviews")}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{clinic.rating}</p>
                    <p className="text-xs text-muted-foreground">Clinic Rating</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Pending Applications</CardTitle></CardHeader>
                <CardContent>
                  {pendingApps === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending applications right now.</p>
                  ) : (
                    <div className="space-y-3">
                      {allApplications.filter((a) => a.status === "pending").map((app) => (
                        <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{app.worker.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{app.worker.firstName} {app.worker.lastName}</p>
                              <p className="text-xs text-muted-foreground">{app.worker.specialty} &middot; {app.job.title} &middot; {app.job.dates}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span className="text-xs font-medium">{app.worker.rating}</span>
                          </div>
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

        {/* Positions Tab */}
        <TabsContent value="positions">
          <div className="space-y-4">
            {showPostForm ? (
              <PostPositionForm
                clinicId={clinic.id}
                onClose={() => setShowPostForm(false)}
                onPosted={() => {
                  setShowPostForm(false);
                  onRefresh?.();
                }}
              />
            ) : (
              <Card className="border-2 border-dashed border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => setShowPostForm(true)}>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Post a New Position</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Need a hygienist, assistant, or dentist? Post your shift and get applicants fast.
                  </p>
                  <Button className="mt-4" size="lg">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Post a Position
                  </Button>
                </CardContent>
              </Card>
            )}
            {jobs.map((job) => {
              const config = jobStatusConfig[job.status as JobStatusKey];
              if (editingJob === job.id) {
                return (
                  <EditPositionForm
                    key={job.id}
                    job={job}
                    onClose={() => setEditingJob(null)}
                    onSaved={() => {
                      setEditingJob(null);
                      onRefresh?.();
                    }}
                  />
                );
              }
              return (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
                          <Badge variant="outline" className="text-xs">
                            <Users className="mr-1 h-3 w-3" />{job.applications.length} applicant{job.applications.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{job.dates}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.hours}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        {job.applications.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Applicants</p>
                            {job.applications.map((app) => {
                              const aConfig = appStatusConfig[app.status as StatusKey];
                              return (
                                <div key={app.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">{app.worker.initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-xs font-medium">{app.worker.firstName} {app.worker.lastName}</p>
                                      <p className="text-[10px] text-muted-foreground">{app.worker.specialty} &middot; {app.worker.rating} stars</p>
                                    </div>
                                  </div>
                                  <Badge variant={aConfig.variant} className="text-[10px]">{aConfig.label}</Badge>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-bold text-primary">{job.rate}</span>
                        <p className="text-xs text-muted-foreground">{job.posted}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingJob(job.id)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <div className="space-y-4">
            {allApplications.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No applications received yet.</CardContent></Card>
            ) : (
              allApplications.map((app) => {
                const aConfig = appStatusConfig[app.status as StatusKey];
                if (reviewingApp === app.id) {
                  return (
                    <div key={app.id}>
                      <ReviewForm
                        fromClinicId={clinic.id}
                        fromRole="clinic"
                        fromName={clinic.name}
                        toWorkerId={app.worker.id}
                        toRole="worker"
                        toName={`${app.worker.firstName} ${app.worker.lastName}`}
                        jobId={app.job.id}
                        jobTitle={app.job.title}
                        canWritePrivate={clinic.premiumTier}
                        onClose={() => setReviewingApp(null)}
                        onSubmitted={() => {
                          setReviewingApp(null);
                          onRefresh?.();
                        }}
                      />
                    </div>
                  );
                }
                return (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-11 w-11">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{app.worker.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">{app.worker.firstName} {app.worker.lastName}</h3>
                              <Badge variant={aConfig.variant} className="text-xs">{aConfig.label}</Badge>
                            </div>
                            <p className="text-xs text-primary font-medium">{app.worker.specialty}</p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{app.worker.location}</span>
                              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-primary text-primary" />{app.worker.rating} ({app.worker.reviewCount} reviews)</span>
                              <span>{app.worker.experience} exp</span>
                            </div>
                            <div className="mt-2 rounded-md bg-muted/50 px-3 py-2">
                              <p className="text-xs text-muted-foreground"><span className="font-medium">For:</span> {app.job.title} &middot; {app.job.dates}</p>
                              <p className="mt-1 text-xs text-muted-foreground italic">&ldquo;{app.coverNote}&rdquo;</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-muted-foreground">Applied {app.appliedDate}</span>
                          {app.status === "pending" && (
                            <div className="flex gap-2 mt-1">
                              <Button size="sm" variant="outline"><XCircle className="h-3.5 w-3.5 mr-1" />Decline</Button>
                              <Button size="sm"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Accept</Button>
                            </div>
                          )}
                          {app.status === "accepted" && app.job.status === "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-1"
                              onClick={() => setReviewingApp(app.id)}
                            >
                              <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
                              Review Worker
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No reviews yet.</CardContent></Card>
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
            )}
          </div>
        </TabsContent>

        {/* My Reviews Tab (reviews I've written) */}
        <TabsContent value="my-reviews">
          <div className="space-y-4">
            {reviewsGiven.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">You haven&apos;t written any reviews yet.</CardContent></Card>
            ) : (
              reviewsGiven.map((review) => (
                <div key={review.id}>
                  {editingReview === review.id ? (
                    <ReviewEditForm
                      reviewId={review.id}
                      currentRating={review.rating}
                      currentComment={review.comment}
                      currentIsPrivate={review.isPrivate}
                      canTogglePrivate={clinic.premiumTier}
                      targetName={review.fromName}
                      fromRole="clinic"
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
      </Tabs>
    </div>
  );
}
