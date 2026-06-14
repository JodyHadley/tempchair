"use client";

import { useState } from "react";
import { useHelp } from "@/lib/help-context";
import { HelpCircle } from "lucide-react";

interface HelpTooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export function HelpTooltip({ text, children, className }: HelpTooltipProps) {
  const { helpMode } = useHelp();
  const [showTip, setShowTip] = useState(false);

  if (!helpMode) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${className || ""}`}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {/* Help mode ring indicator */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-primary/30 ring-offset-2 pointer-events-none z-10" />

      {/* Small help icon */}
      <div className="absolute -top-1.5 -right-1.5 z-20 pointer-events-none">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <HelpCircle className="h-3 w-3" />
        </div>
      </div>

      {children}

      {/* Tooltip */}
      {showTip && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 pointer-events-none">
          <div className="rounded-lg bg-foreground text-background px-3 py-2 text-xs leading-relaxed shadow-lg">
            {text}
            <div className="absolute left-1/2 -translate-x-1/2 top-full">
              <div className="border-4 border-transparent border-t-foreground" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
