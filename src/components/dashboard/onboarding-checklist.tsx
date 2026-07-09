"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { CheckCircle2, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type OnboardingStep = {
  id: string;
  label: string;
  done: boolean;
  /** Tab value to switch to, or external href */
  action?: { type: "tab"; value: string } | { type: "href"; href: string };
  actionLabel?: string;
};

export function OnboardingChecklist({
  profileId,
  role,
  steps,
  onTabChange,
}: {
  profileId: string;
  role: "worker" | "clinic";
  steps: OnboardingStep[];
  onTabChange?: (tab: string) => void;
}) {
  const storageKey = `onboarding-dismissed-${profileId}`;
  const [dismissed, setDismissed] = useState(true); // hide until hydrated
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, [storageKey]);

  const completed = steps.filter((s) => s.done).length;
  const allDone = completed === steps.length;

  if (!ready || dismissed || allDone) return null;

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">
            {role === "worker" ? "Get started on TempChair" : "Set up your clinic"}
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {completed} of {steps.length} complete
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Dismiss checklist">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>
        <ul className="space-y-2">
          {steps.map((step) => (
            <li
              key={step.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background/80 px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm">
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={step.done ? "text-muted-foreground line-through" : "font-medium"}>
                  {step.label}
                </span>
              </div>
              {!step.done && step.action && (
                step.action.type === "href" ? (
                  <Link
                    href={step.action.href}
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-xs")}
                  >
                    {step.actionLabel ?? "Go"}
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      if (step.action?.type === "tab") onTabChange?.(step.action.value);
                    }}
                  >
                    {step.actionLabel ?? "Go"}
                  </Button>
                )
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
