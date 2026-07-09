"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MapPin, Star, Clock, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export type WorkerListItem = {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  specialty: string;
  location: string;
  bio: string;
  experience: string;
  rating: number;
  reviewCount: number;
  certifications: string[];
  availability: string;
  hourlyRate: string;
};

export function WorkersDirectory({ workers }: { workers: WorkerListItem[] }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<WorkerListItem | null>(null);

  return (
    <>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workers.map((worker) => (
          <Card key={worker.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {worker.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">
                    {worker.firstName} {worker.lastName}
                  </h2>
                  <p className="text-sm font-medium text-primary">{worker.specialty}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {worker.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {worker.rating} ({worker.reviewCount})
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{worker.bio}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {worker.certifications.slice(0, 3).map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {worker.availability}
                </span>
                <Button size="sm" variant="outline" onClick={() => setSelected(worker)}>
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-3 pr-8">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                      {selected.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>
                      {selected.firstName} {selected.lastName}
                    </SheetTitle>
                    <SheetDescription className="text-primary font-medium">
                      {selected.specialty}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-5 p-4">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selected.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {selected.rating} ({selected.reviewCount} reviews)
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    About
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{selected.bio || "No bio yet."}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="mt-0.5 font-semibold text-primary">{selected.hourlyRate}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="mt-0.5 text-sm font-medium">{selected.experience}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Availability
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {selected.availability}
                  </p>
                </div>

                {selected.certifications.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Certifications
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.certifications.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-dashed bg-muted/40 p-4">
                  {user?.role === "clinic" ? (
                    <>
                      <p className="text-sm font-medium">Want to work with them?</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Post a position that matches their specialty. They can apply and message you on the application.
                      </p>
                      <Link
                        href="/dashboard?post=1"
                        className={cn(buttonVariants({ size: "sm" }), "mt-3")}
                      >
                        <Briefcase className="mr-1 h-3.5 w-3.5" />
                        Post a position
                      </Link>
                    </>
                  ) : user?.role === "worker" ? (
                    <p className="text-xs text-muted-foreground">
                      This is how clinics see professional profiles on TempChair.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Clinic looking for temps?</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Sign in to post positions and connect with professionals.
                      </p>
                      <Link
                        href="/sign-up?role=clinic"
                        className={cn(buttonVariants({ size: "sm" }), "mt-3")}
                      >
                        Join as a clinic
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
