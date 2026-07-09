"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  href,
  tip,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  tip?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center p-8 text-center">
        {Icon && (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
        {actionLabel && href && (
          <Link
            href={href}
            className={cn(buttonVariants({ size: "sm" }), "mt-4")}
          >
            {actionLabel}
          </Link>
        )}
        {actionLabel && onAction && !href && (
          <Button size="sm" className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {tip && (
          <p className="mt-3 max-w-xs text-xs text-muted-foreground">{tip}</p>
        )}
      </CardContent>
    </Card>
  );
}
