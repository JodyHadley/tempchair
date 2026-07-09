import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createMetadata } from "@/lib/seo";
import {
  Search,
  CalendarCheck,
  Star,
  ShieldCheck,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = createMetadata({
  title: "TempChair — Dental Temp Staffing in Boise & Treasure Valley",
  description:
    "Fill dental shifts fast or find temp work in Boise. Connect clinics with hygienists, assistants, and dentists — no agency markup. Free for professionals.",
  path: "/",
});

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              Now serving Boise, Idaho
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Dental Staffing,{" "}
              <span className="text-primary">Simplified</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              Connect with qualified dental hygienists, assistants, and dentists
              for temporary positions. Fill shifts fast, find great work — all in
              one trusted platform.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:flex-wrap">
              <Link
                href="/sign-up?role=worker"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto text-base px-8")}
              >
                I&apos;m looking for work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/sign-up?role=clinic"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto text-base px-8")}
              >
                I need staff
              </Link>
              <Link
                href="/#how-it-works"
                className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "w-full sm:w-auto text-base px-6 text-muted-foreground")}
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar — honest local proof */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {[
              { value: "Boise", label: "Treasure Valley focus" },
              { value: "100+", label: "Clinics pre-listed" },
              { value: "Free", label: "For professionals" },
              { value: "$0", label: "Agency markup" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="relative overflow-hidden border-2 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">For Dental Professionals</h2>
              <p className="mt-3 text-muted-foreground">
                Create your profile, set your availability, and browse open
                shifts at clinics near you. Take control of your schedule and
                earn on your terms.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Browse open positions and shifts",
                  "Set your own availability",
                  "Build your reputation with ratings",
                  "Get matched with top clinics",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up?role=worker"
                className={cn(buttonVariants(), "mt-8 w-full")}
              >
                Join as a Professional
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">For Dental Clinics</h2>
              <p className="mt-3 text-muted-foreground">
                Post your staffing needs and get matched with qualified,
                vetted dental professionals. Fill shifts in hours, not weeks.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Post positions with specific requirements",
                  "Browse qualified professional profiles",
                  "Review ratings and work history",
                  "AI-powered matching (coming soon)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up?role=clinic"
                className={cn(buttonVariants(), "mt-8 w-full")}
              >
                Join as a Clinic
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/30 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get started in minutes — whether you&apos;re hiring or looking for work.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description:
                  "Sign up, tell us who you are — a clinic looking for staff or a professional looking for shifts. It takes less than 5 minutes.",
              },
              {
                step: "2",
                title: "Post or Browse",
                description:
                  "Clinics post their staffing needs with dates and requirements. Professionals browse open shifts and apply to the ones that fit.",
              },
              {
                step: "3",
                title: "Work & Review",
                description:
                  "Complete the assignment, then rate each other. Build your reputation and find the best matches over time.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why TempChair?
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Trusted Ratings",
              description:
                "Two-way rating system means both clinics and workers build verified reputations you can count on.",
            },
            {
              icon: CalendarCheck,
              title: "Flexible Scheduling",
              description:
                "Post a single shift or a full week. Workers set their own availability — find the perfect fit every time.",
            },
            {
              icon: Search,
              title: "Smart Matching",
              description:
                "Our platform helps surface the best candidates for your specific needs based on skills, availability, and ratings.",
            },
            {
              icon: Users,
              title: "All Dental Roles",
              description:
                "Hygienists, dental assistants, and dentists — find or become a temp for any dental position.",
            },
            {
              icon: Building2,
              title: "Local First",
              description:
                "Built for Boise and expanding. We focus on quality connections in your local market.",
            },
            {
              icon: Star,
              title: "Professional Community",
              description:
                "Join a network of dental professionals who value quality work and reliable partnerships.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Built for Boise-area clinics and dental professionals — claim a
              clinic, post a shift, or find your next temp day.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/sign-up?role=worker"
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full sm:w-auto text-base px-8")}
              >
                Join as a professional
              </Link>
              <Link
                href="/sign-up?role=clinic"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  // On primary band: transparent fill + light border/text (not white-on-white)
                  "w-full sm:w-auto text-base px-8 border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground",
                )}
              >
                Join as a clinic
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
