"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Users, Building2, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createWorkerAccount, createClinicAccount } from "@/lib/db/auth-actions";

function SignUpForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "clinic" ? "clinic" : searchParams.get("role") === "worker" ? "worker" : null;
  const [role, setRole] = useState<"worker" | "clinic" | null>(initialRole);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, signIn } = useAuth();

  // Worker fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialty, setSpecialty] = useState("Hygienist");

  // Clinic fields
  const [clinicName, setClinicName] = useState("");
  const [contactName, setContactName] = useState("");

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    router.replace("/dashboard");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (role === "worker") {
        const result = await createWorkerAccount({
          email,
          password,
          firstName,
          lastName,
          specialty: specialty as "Hygienist" | "Assistant" | "Dentist",
        });
        if (!result.success) {
          setError(result.error || "Failed to create account.");
          setLoading(false);
          return;
        }
      } else {
        const result = await createClinicAccount({
          email,
          password,
          clinicName,
          contactName,
        });
        if (!result.success) {
          setError(result.error || "Failed to create account.");
          setLoading(false);
          return;
        }
      }

      // Auto sign in after account creation
      const signInResult = await signIn(email, password);
      if (signInResult.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        // Account created but auto-login failed — send to sign-in
        setSuccess(true);
        setTimeout(() => router.push("/sign-in"), 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-lg flex-col items-center justify-center px-4 py-16">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-xl font-bold">Welcome to TempChair!</h2>
            <p className="mt-2 text-muted-foreground">
              Your account has been created. Redirecting to your dashboard...
            </p>
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
                  onClick={() => { setRole(null); setError(""); }}
                >
                  Change
                </button>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {role === "worker" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select value={specialty} onValueChange={(v) => v && setSpecialty(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hygienist">Dental Hygienist</SelectItem>
                        <SelectItem value="Assistant">Dental Assistant</SelectItem>
                        <SelectItem value="Dentist">Dentist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    <Input
                      id="clinicName"
                      placeholder="Boise Family Dental"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      placeholder="Dr. John Smith"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={role === "worker" ? "jane@example.com" : "office@clinic.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (6+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
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
