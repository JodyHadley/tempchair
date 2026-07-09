import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createMetadata } from "@/lib/seo";
import {
  CheckCircle2,
  Users,
  Building2,
  Crown,
  Lock,
  Star,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = createMetadata({
  title: "Pricing",
  description:
    "Simple dental staffing pricing: free for professionals, $35 per clinic posting, or $89/mo Premium with unlimited posts and market insights. 60-day premium trial for new clinics.",
  path: "/pricing",
});

const tiers = [
  {
    name: "Professional",
    audience: "For Dental Workers",
    price: "Free",
    priceSub: "Always free",
    icon: Users,
    badge: null,
    description:
      "Create your profile, browse jobs, and build your reputation — no cost, no catch.",
    cta: "Create Free Profile",
    ctaHref: "/sign-up?role=worker",
    ctaVariant: "outline" as const,
    features: [
      "Create and manage your profile",
      "Browse all open positions",
      "Apply to shifts and jobs",
      "Public ratings and reviews",
      "See private reviews of clinics from other workers",
      "Set your own availability and rate",
    ],
  },
  {
    name: "Clinic Standard",
    audience: "For Dental Clinics",
    price: "$35",
    priceSub: "per position posted",
    icon: Building2,
    badge: null,
    description:
      "Post positions, browse workers, and fill your chair — pay only when you post.",
    cta: "Get Started",
    ctaHref: "/sign-up?role=clinic",
    ctaVariant: "default" as const,
    features: [
      "Claim and manage your clinic profile",
      "Post positions with dates and requirements",
      "Browse qualified professional profiles",
      "Public ratings and reviews",
      "Message applicants",
      "No subscription — pay per posting",
    ],
  },
  {
    name: "Clinic Premium",
    audience: "For Clinics That Want More",
    price: "$89",
    priceSub: "per month",
    icon: Crown,
    badge: "Best Value",
    description:
      "Everything in Standard plus private reviews, market insights, and unlimited postings. New clinics get 60 days free.",
    cta: "Start free trial",
    ctaHref: "/sign-up?role=clinic&tier=premium",
    ctaVariant: "default" as const,
    features: [
      "Everything in Clinic Standard",
      "60-day free Premium trial for new clinics",
      "Unlimited position postings",
      "Write private/blind reviews of professionals",
      "See private reviews from other premium clinics",
      "Local market rate insights",
      "Priority support",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Workers are always free. Clinics pay only when they need staff —
            no long-term contracts, no hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative overflow-hidden",
                tier.badge && "border-2 border-primary shadow-lg",
              )}
            >
              {tier.badge && (
                <div className="absolute top-0 right-0 rounded-bl-lg bg-primary px-3 py-1">
                  <span className="text-xs font-semibold text-primary-foreground">
                    {tier.badge}
                  </span>
                </div>
              )}
              <CardContent className="p-5 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <tier.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{tier.name}</h2>
                    <p className="text-xs text-muted-foreground">{tier.audience}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="ml-1.5 text-sm text-muted-foreground">
                    {tier.priceSub}
                  </span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {tier.description}
                </p>

                <Link
                  href={tier.ctaHref}
                  className={cn(
                    buttonVariants({ variant: tier.ctaVariant, size: "lg" }),
                    "mt-6 w-full text-base",
                  )}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {feature}
                        {feature.includes("private") && (
                          <Lock className="ml-1 inline h-3 w-3 text-muted-foreground" />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How We Compare
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            No agency markups. No middleman. Just direct connections.
          </p>
          <div className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Traditional Agency
                </p>
                <p className="mt-3 text-3xl font-bold text-destructive/70">$80–150+</p>
                <p className="text-sm text-muted-foreground">per placement + hourly markup</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  15–40% markup on worker rates, placement fees, long contracts
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/30">
              <CardContent className="p-6 text-center">
                <Badge variant="default" className="mb-2">TempChair</Badge>
                <p className="mt-1 text-3xl font-bold text-primary">$35</p>
                <p className="text-sm text-muted-foreground">per posting, no markup</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Pay workers directly at fair rates. One flat fee per posting.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Other Platforms
                </p>
                <p className="mt-3 text-3xl font-bold text-muted-foreground">$38–73</p>
                <p className="text-sm text-muted-foreground">per shift + subscriptions</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Completion fees, monthly subscriptions, and payment processing markups
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Pricing Questions
        </h2>
        <div className="mt-10 space-y-8">
          {[
            {
              q: "Is it really free for workers?",
              a: "Yes, 100%. Create your profile, browse jobs, apply to shifts, get rated — all free, always.",
            },
            {
              q: "When do clinics pay?",
              a: "Standard clinics pay $35 each time they post a new position. No subscription, no commitment. Premium clinics pay $89/month for unlimited postings and private reviews.",
            },
            {
              q: "What's included in the private/blind reviews?",
              a: "Premium clinics can write confidential reviews of workers that only other premium clinics can see. Workers can also write private reviews of clinics that only other workers can see (free for workers).",
            },
            {
              q: "Can I switch between Standard and Premium?",
              a: "Yes, upgrade or downgrade anytime. When you upgrade, you get immediate access to premium features.",
            },
            {
              q: "Do you take a cut of the worker's pay?",
              a: "No. Workers set their own rates and clinics pay them directly. We only charge the posting fee.",
            },
            {
              q: "Are there any introductory offers?",
              a: "We're currently offering early-access clinics special rates as we launch in Boise. Sign up to learn more.",
            },
          ].map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
              Ready to Fill Your Chair?
            </h2>
            <p className="mt-3 text-lg text-primary-foreground/80">
              Join TempChair today — workers are free, clinics start at just $35.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/sign-up?role=worker"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "w-full sm:w-auto text-base px-8",
                )}
              >
                Join as a Worker
              </Link>
              <Link
                href="/sign-up?role=clinic"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "w-full sm:w-auto text-base px-8",
                )}
              >
                Join as a Clinic
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
