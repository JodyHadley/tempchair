import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * TempChair logo: dental chair mark + site Geist wordmark.
 * In the header, the mark can fill the full bar height (no extra vertical padding).
 */
export function Logo({
  className,
  markClassName,
  wordmark = true,
  size = "md",
  /** When true, chair fills available line height (use with h-full parent) */
  fillHeight = false,
}: {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  size?: "sm" | "md" | "lg";
  fillHeight?: boolean;
}) {
  // Fallback fixed sizes when not fillHeight
  const markPx = size === "sm" ? 40 : size === "lg" ? 64 : 48;
  const textSize =
    size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 sm:gap-3",
        fillHeight && "h-full",
        className,
      )}
    >
      <Image
        src="/brand/logo-chair-mark-512.png"
        alt=""
        width={fillHeight ? 256 : markPx}
        height={fillHeight ? 256 : markPx}
        className={cn(
          "shrink-0 object-contain object-left",
          fillHeight
            ? "!h-[80%] !w-auto max-h-[80%]"
            : undefined,
          markClassName,
        )}
        style={fillHeight ? { height: "80%", width: "auto" } : undefined}
        priority
      />
      {wordmark && (
        <span
          className={cn(
            "font-sans font-bold tracking-tight text-foreground leading-none",
            textSize,
          )}
        >
          Temp<span className="text-primary">Chair</span>
        </span>
      )}
    </span>
  );
}

/** Icon-only (e.g. compact UI) */
export function LogoMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/logo-chair-mark-512.png"
      alt="TempChair"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
