import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getAllWorkers } from "@/lib/db/queries";

export default async function WorkersPage() {
  const workers = await getAllWorkers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Find Dental Professionals
          </h1>
          <p className="mt-1 text-muted-foreground">
            Browse qualified hygienists, assistants, and dentists available for
            temp work.
          </p>
        </div>
        <Link href="/sign-up?role=worker" className={cn(buttonVariants())}>
          List Your Profile
        </Link>
      </div>

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
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">
                    {worker.firstName} {worker.lastName}
                  </h2>
                  <p className="text-sm text-primary font-medium">
                    {worker.specialty}
                  </p>
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

              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                {worker.bio}
              </p>

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
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
