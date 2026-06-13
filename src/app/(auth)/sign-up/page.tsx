"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Building2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/lib/auth-context";

function SignUpForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "clinic" ? "clinic" : searchParams.get("role") === "worker" ? "worker" : null;
  const [role, setRole] = useState<"worker" | "clinic" | null>(initialRole);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.replace("/dashboard");
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-lg flex-col items-center justify-center px-4 py-16">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {role === "worker" ? (
                <Users className="h-6 w-6 text-primary" />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold">Welcome to TempChair!</h2>
            <p className="mt-2 text-muted-foreground">
              In this demo, please use one of the test accounts to explore the platform.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => router.push("/sign-in")}
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-lg flex-col items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Join TempChair and start connecting today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!role ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-muted-foreground">
                I am a...
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-6 hover:border-primary"
                  onClick={() => setRole("worker")}
                >
                  <Users className="h-8 w-8 text-primary" />
                  <span className="font-semibold">Dental Professional</span>
                  <span className="text-xs text-muted-foreground">
                    Hygienist, Assistant, Dentist
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-6 hover:border-primary"
                  onClick={() => setRole("clinic")}
                >
                  <Building2 className="h-8 w-8 text-primary" />
                  <span className="font-semibold">Dental Clinic</span>
                  <span className="text-xs text-muted-foreground">
                    Hiring temp staff
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                {role === "worker" ? (
                  <Users className="h-4 w-4 text-primary" />
                ) : (
                  <Building2 className="h-4 w-4 text-primary" />
                )}
                <span>
                  Signing up as a{" "}
                  <strong>
                    {role === "worker" ? "Dental Professional" : "Dental Clinic"}
                  </strong>
                </span>
                <button
                  type="button"
                  className="ml-auto text-xs text-primary hover:underline"
                  onClick={() => setRole(null)}
                >
                  Change
                </button>
              </div>

              {role === "worker" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Jane" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Smith" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Create a password" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    <Input id="clinicName" placeholder="Boise Family Dental" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input id="contactName" placeholder="Dr. John Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="office@clinic.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Create a password" />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
