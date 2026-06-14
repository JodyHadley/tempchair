"use client";

import { useHelp } from "@/lib/help-context";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";

export function HelpBanner() {
  const { helpMode, toggleHelp } = useHelp();

  if (!helpMode) return null;

  return (
    <div className="sticky top-16 z-40 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm">
          <HelpCircle className="h-4 w-4" />
          <span className="font-medium">Help Mode Active</span>
          <span className="hidden sm:inline text-primary-foreground/80">
            — Hover over any highlighted element to see what it does
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleHelp}
          className="text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Exit Help
        </Button>
      </div>
    </div>
  );
}
