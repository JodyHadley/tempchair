"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  Sparkles,
} from "lucide-react";
import { getAllClinics, type ClinicProfile } from "@/lib/sample-data";

export default function ClaimPage() {
  const [search, setSearch] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<ClinicProfile | null>(null);
  const [claimed, setClaimed] = useState(false);
  const router = useRouter();

  const allClinics = getAllClinics();
  const unclaimed = allClinics.filter((c) => !c.claimed);

  const filtered = search.trim().length > 0
    ? unclaimed.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.address.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase()),
      )
    : unclaimed;

  if (claimed && selectedClinic) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-lg flex-col items-center justify-center px-4 py-16">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Claim Submitted!</h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;ve received your claim for <strong>{selectedClinic.name}</strong>.
              We&apos;ll verify your information and activate your profile shortly.
            </p>
            <div className="mt-6 rounded-lg bg-muted p-4 text-left">
              <p className="text-sm font-medium">What happens next:</p>
              <ul className="mt-2 space-y-2">
                {[
                  "We'll verify your ownership (usually within 24 hours)",
                  "You'll receive an email with your login credentials",
                  "You can start posting positions immediately",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/" className={cn(buttonVariants(), "w-full")}>
                Back to Home
              </Link>
              <Link href="/clinics" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Browse Clinic Directory
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedClinic) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
        <button
          onClick={() => setSelectedClinic(null)}
          className="mb-6 text-sm text-primary hover:underline"
        >
          &larr; Back to search
        </button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Claim {selectedClinic.name}</CardTitle>
            <CardDescription>
              Verify your information to activate your clinic profile on TempChair.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Current info */}
            <div className="rounded-lg bg-muted p-4 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Current listing
              </p>
              <p className="font-medium">{selectedClinic.name}</p>
              {selectedClinic.address && (
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedClinic.address}
                </p>
              )}
              {selectedClinic.phone && (
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {selectedClinic.phone}
                </p>
              )}
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setClaimed(true);
              }}
            >
              <div className="space-y-2">
                <label htmlFor="contactName" className="text-sm font-medium">
                  Your Name
                </label>
                <Input id="contactName" placeholder="Dr. Jane Smith" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Your Role
                </label>
                <Input id="role" placeholder="Owner, Office Manager, etc." required />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Work Email
                </label>
                <Input id="email" type="email" placeholder="you@yourclinic.com" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input id="phone" type="tel" placeholder="(208) 555-0000" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Anything else we should know? <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input id="message" placeholder="e.g., we need a hygienist ASAP!" />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Submit Claim
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                We&apos;ll verify your ownership and activate your profile within 24 hours.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Claim Your Clinic
        </h1>
        <p className="mt-3 text-muted-foreground">
          Search for your dental practice below. If it&apos;s listed, you can claim it
          in minutes and start posting positions right away.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mt-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by clinic name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((clinic) => (
          <Card
            key={clinic.id}
            className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
            onClick={() => setSelectedClinic(clinic)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
                    {clinic.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{clinic.name}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {clinic.location}
                  </p>
                </div>
              </div>
              {clinic.address && clinic.address !== clinic.location && (
                <p className="mt-3 text-xs text-muted-foreground">{clinic.address}</p>
              )}
              {clinic.phone && (
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {clinic.phone}
                </p>
              )}
              <p className="mt-3 text-xs text-primary font-medium flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Click to claim this clinic
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && search.trim().length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            No clinics found matching &ldquo;{search}&rdquo;.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Don&apos;t see your clinic?{" "}
            <Link href="/sign-up?role=clinic" className="text-primary hover:underline font-medium">
              Sign up and add it manually
            </Link>
          </p>
        </div>
      )}

      {/* Not listed CTA */}
      <div className="mt-12 text-center border-t pt-8">
        <p className="text-sm text-muted-foreground">
          Don&apos;t see your clinic listed?
        </p>
        <Link
          href="/sign-up?role=clinic"
          className={cn(buttonVariants({ variant: "outline" }), "mt-3")}
        >
          Add Your Clinic Manually
        </Link>
      </div>
    </div>
  );
}
