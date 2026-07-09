import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createMetadata } from "@/lib/seo";
import {
  Clock,
  Star,
  ShieldCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  DollarSign,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = createMetadata({
  title: "Your Clinic Is Already Listed",
  description:
    "Stop scrambling for temp dental staff. Claim your Boise-area clinic on TempChair free, post shifts, and connect with qualified hygienists, assistants, and dentists.",
  path: "/welcome",
  keywords: [
    "claim dental clinic Boise",
    "temp dental staffing Boise",
    "fill hygienist shift Idaho",
    "TempChair clinic",
  ],
});

export default function WelcomePage() {
  return (
    <>
      {/* Hero — targeted at clinic owners */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              Your clinic is already listed
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Stop Scrambling for{" "}
              <span className="text-primary">Temp Staff</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              When your hygienist calls in sick or you need extra coverage,
              TempChair connects you with qualified dental professionals in the
              Boise area — in hours, not days.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/claim"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto text-base px-8")}
              >
                Claim Your Clinic
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/#how-it-works"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto text-base px-8")}
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Sound Familiar?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Clock,
                  text: "Spending hours calling around to find a temp hygienist for tomorrow",
                },
                {
                  icon: Users,
                  text: "Relying on word-of-mouth and hoping someone is available",
                },
                {
                  icon: CalendarDays,
                  text: "Canceling patients because you can't fill a chair",
                },
              ].map((item) => (
                <div key={item.text} className="text-center">
                  <item.icon className="mx-auto h-8 w-8 text-destructive/60" />
                  <p className="mt-3 text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How TempChair solves it */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Fill Your Chair in 3 Steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            TempChair makes finding qualified temp staff as easy as posting a shift.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Claim Your Clinic",
              description:
                "Your practice is already in our directory. Claim it in 2 minutes — verify your info and you're ready to go.",
            },
            {
              step: "2",
              title: "Post Your Need",
              description:
                "Need a hygienist next Tuesday? Post the shift with dates, hours, and requirements. It takes 60 seconds.",
            },
            {
              step: "3",
              title: "Review & Book",
              description:
                "Qualified professionals apply. Review their profiles, ratings, and experience — then book the best fit.",
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
      </section>

      {/* Why clinics choose TempChair */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Boise Clinics Choose TempChair
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Professionals",
                description:
                  "Every worker has a detailed profile with credentials, experience, and ratings from other clinics.",
              },
              {
                icon: Star,
                title: "Two-Way Ratings",
                description:
                  "See honest reviews from other clinics before you book. No more guessing about quality.",
              },
              {
                icon: Clock,
                title: "Fill Shifts Fast",
                description:
                  "Post a shift and get applicants in hours, not days. No more frantic phone calls.",
              },
              {
                icon: DollarSign,
                title: "No Staffing Agency Fees",
                description:
                  "Pay workers directly at fair market rates. No middleman markup eating into your budget.",
              },
              {
                icon: Users,
                title: "All Dental Roles",
                description:
                  "Hygienists, dental assistants, and even dentists — find the right professional for any position.",
              },
              {
                icon: Sparkles,
                title: "Built for Boise",
                description:
                  "We're local and focused on the Treasure Valley. Quality connections in your community.",
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
        </div>
      </section>

      {/* Social proof / early adopter */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardContent className="p-8 sm:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">Early Access</Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Be One of the First Clinics on TempChair
              </h2>
              <p className="mt-4 text-muted-foreground">
                We&apos;re launching in Boise and offering early clinics priority access.
                Claim your profile now and be ready when you need coverage.
              </p>
              <ul className="mt-6 space-y-3 text-left max-w-md mx-auto">
                {[
                  "Your clinic info is already loaded — just verify and go",
                  "Free to claim and set up your profile",
                  "Post your first position in under 2 minutes",
                  "Access a growing pool of local dental professionals",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/claim"
                className={cn(buttonVariants({ size: "lg" }), "mt-8 text-base px-8")}
              >
                Claim Your Clinic Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-center sm:text-3xl">
            Common Questions
          </h2>
          <div className="mt-10 space-y-8">
            {[
              {
                q: "How much does it cost?",
                a: "Claiming your clinic profile is free. We charge a small posting fee when you list a position — no subscription, no hidden costs.",
              },
              {
                q: "How is this different from a staffing agency?",
                a: "Staffing agencies take a large markup. With TempChair, you connect directly with professionals and pay them fair market rates. You see their ratings, reviews, and credentials before you book.",
              },
              {
                q: "How do I know the workers are qualified?",
                a: "Every professional has a detailed profile with their credentials, certifications, and experience. Plus, you can see ratings and reviews from other clinics who have worked with them.",
              },
              {
                q: "What if I need someone tomorrow?",
                a: "Post your shift and available professionals in the area get notified immediately. Many of our workers are available on short notice.",
              },
              {
                q: "Is my clinic already listed?",
                a: "If you're a dental practice in the Boise/Meridian/Eagle/Nampa area, there's a good chance we've already added your basic info. Visit the Claim page to find and claim your clinic.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to Fill Your Chair?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Claim your clinic profile in 2 minutes. It&apos;s free to get started.
            </p>
            <Link
              href="/claim"
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-8 text-base px-8")}
            >
              Claim Your Clinic
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
