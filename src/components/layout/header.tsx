"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Sparkles, LogOut, LayoutDashboard, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHelp } from "@/lib/help-context";
import { useAuth } from "@/lib/auth-context";

const publicNav = [
  { name: "Find Workers", href: "/workers" },
  { name: "Find Jobs", href: "/jobs" },
  { name: "Clinics", href: "/clinics" },
  { name: "Pricing", href: "/pricing" },
];

const workerNav = [
  { name: "Find Jobs", href: "/jobs" },
  { name: "Dashboard", href: "/dashboard" },
];

const clinicNav = [
  { name: "Find Workers", href: "/workers" },
  { name: "Dashboard", href: "/dashboard" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showHelpTip, setShowHelpTip] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const { helpMode, toggleHelp } = useHelp();
  const router = useRouter();

  const navigation = !user ? publicNav : user.role === "worker" ? workerNav : clinicNav;

  useEffect(() => {
    if (!user) {
      setShowHelpTip(false);
      return;
    }
    try {
      setShowHelpTip(localStorage.getItem("help-tip-dismissed") !== "1");
    } catch {
      setShowHelpTip(true);
    }
  }, [user]);

  function dismissHelpTip() {
    try {
      localStorage.setItem("help-tip-dismissed", "1");
    } catch {
      /* ignore */
    }
    setShowHelpTip(false);
  }

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">
            Temp<span className="text-primary">Chair</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <div className="h-8 w-20" />
          ) : user ? (
            <>
            <Button
              variant={helpMode ? "default" : "ghost"}
              size="sm"
              onClick={toggleHelp}
              title={helpMode ? "Exit help mode" : "Turn on guided help"}
              className="relative gap-1.5"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm">Help</span>
              {helpMode && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus:outline-none" />
                }
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost" }))}>
                Sign In
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants())}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" />}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-80">
            <div className="flex flex-col gap-6 px-5 pt-8 pb-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <Sparkles className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold tracking-tight">
                  Temp<span className="text-primary">Chair</span>
                </span>
              </Link>

              {user && (
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-3 pt-4 border-t">
                {user ? (
                  <>
                  <Button
                    variant={helpMode ? "default" : "outline"}
                    onClick={() => {
                      toggleHelp();
                      setMobileOpen(false);
                    }}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    {helpMode ? "Exit Help Mode" : "Help Mode"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className={cn(buttonVariants({ variant: "outline" }))}
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className={cn(buttonVariants())}
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
    {user && showHelpTip && !helpMode && (
      <div className="border-b bg-primary/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">New here?</span>{" "}
            Turn on <strong>Help</strong> for guided tooltips on your dashboard.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                toggleHelp();
                dismissHelpTip();
              }}
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              Try Help
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={dismissHelpTip} aria-label="Dismiss tip">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
