import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold tracking-tight">
                Temp<span className="text-primary">Chair</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Connecting dental professionals with clinics that need them. Fast, reliable temp staffing for the dental industry.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">For Workers</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">Browse Jobs</Link></li>
              <li><Link href="/sign-up" className="text-sm text-muted-foreground hover:text-foreground">Create Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">For Clinics</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/workers" className="text-sm text-muted-foreground hover:text-foreground">Find Workers</Link></li>
              <li><Link href="/clinics" className="text-sm text-muted-foreground hover:text-foreground">Clinic Directory</Link></li>
              <li><Link href="/sign-up" className="text-sm text-muted-foreground hover:text-foreground">Post a Position</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TempChair. All rights reserved. Boise, Idaho.
          </p>
        </div>
      </div>
    </footer>
  );
}
