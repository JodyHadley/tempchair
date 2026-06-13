"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";

const testAccounts = [
  { label: "Hygienist", email: "sarah@test.com" },
  { label: "Assistant", email: "michael@test.com" },
  { label: "Dentist", email: "emily@test.com" },
  { label: "Boise Family Dentistry", email: "boise@test.com" },
  { label: "Eagle Road Dental", email: "eagle@test.com" },
  { label: "Meridian Smiles", email: "meridian@test.com" },
];

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = signIn(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Invalid credentials");
    }
  }

  function fillAccount(accountEmail: string) {
    setEmail(accountEmail);
    setPassword("password");
    setError("");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your TempChair account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Test accounts helper */}
      <Card className="mt-4 w-full border-dashed">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Demo Accounts — click to fill
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Workers</p>
            <div className="flex flex-wrap gap-2">
              {testAccounts.slice(0, 3).map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillAccount(a.email)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted hover:border-primary/40"
                >
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {a.label}
                  </Badge>
                  <span className="text-muted-foreground">{a.email}</span>
                </button>
              ))}
            </div>

            <Separator className="my-2" />

            <p className="text-xs font-medium text-muted-foreground">Clinics</p>
            <div className="flex flex-wrap gap-2">
              {testAccounts.slice(3).map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillAccount(a.email)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted hover:border-primary/40"
                >
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {a.label}
                  </Badge>
                  <span className="text-muted-foreground">{a.email}</span>
                </button>
              ))}
            </div>

            <p className="mt-2 text-[10px] text-muted-foreground">
              Password for all accounts: <code className="font-mono font-semibold">password</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
