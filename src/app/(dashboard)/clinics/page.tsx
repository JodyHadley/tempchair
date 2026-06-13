import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Phone, Star, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllClinics } from "@/lib/db/queries";

export default async function ClinicsPage() {
  const allClinics = await getAllClinics();
  const claimed = allClinics.filter((c) => c.claimed);
  const unclaimed = allClinics.filter((c) => !c.claimed);

  const locationGroups = unclaimed.reduce<Record<string, typeof unclaimed>>(
    (acc, clinic) => {
      const loc = clinic.location;
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(clinic);
      return acc;
    },
    {},
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dental Clinics Directory</h1>
        <p className="mt-1 text-muted-foreground">
          {allClinics.length} dental clinics in the Treasure Valley. Claim your clinic to start posting positions.
        </p>
      </div>

      {claimed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Active on TempChair
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {claimed.map((clinic) => (
              <Card key={clinic.id} className="border-primary/20 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {clinic.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{clinic.name}</h3>
                        <Badge variant="default" className="text-[10px] shrink-0">
                          <ShieldCheck className="mr-0.5 h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {clinic.location}
                        </span>
                        {clinic.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            {clinic.rating} ({clinic.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{clinic.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {clinic.address}
                    </span>
                    {clinic.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {clinic.phone}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {Object.entries(locationGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([location, locationClinics]) => (
          <div key={location} className="mt-10">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              {location} ({locationClinics.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locationClinics.map((clinic) => (
                <Card key={clinic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                          {clinic.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{clinic.name}</h3>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            Unclaimed
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {clinic.location}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{clinic.description}</p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      {clinic.address && (
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {clinic.address}
                        </p>
                      )}
                      {clinic.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" />
                          {clinic.phone}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/claim"
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3 w-full text-xs")}
                    >
                      Claim This Clinic
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
