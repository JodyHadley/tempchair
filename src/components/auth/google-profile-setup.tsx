"use client";

import { useState } from "react";
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
import { useAuth } from "@/lib/auth-context";
import { createProfileForGoogleUser } from "@/lib/db/auth-actions";
import type { User } from "@supabase/supabase-js";

export function GoogleProfileSetup({ authUser }: { authUser: User }) {
  const [role, setRole] = useState<"worker" | "clinic" | null>(null);
  const [firstName, setFirstName] = useState(authUser.user_metadata?.full_name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(authUser.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "");
  const [specialty, setSpecialty] = useState("Hygienist");
  const [clinicName, setClinicName] = useState("");
  const [contactName, setContactName] = useState(authUser.user_metadata?.full_name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { setProfileComplete } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError("");

    const result = await createProfileForGoogleUser({
      authUserId: authUser.id,
      email: authUser.email || "",
      role,
      firstName: role === "worker" ? firstName : undefined,
      lastName: role === "worker" ? lastName : undefined,
      specialty: role === "worker" ? specialty as "Hygienist" | "Assistant" | "Dentist" : undefined,
      clinicName: role === "clinic" ? clinicName : undefined,
      contactName: role === "clinic" ? contactName : undefined,
    });

    if (!result.success) {
      setError(result.error || "Failed to create profile.");
      setLoading(false);
      return;
    }

    setProfileComplete({
      id: result.profileId!,
      role: result.role!,
      email: authUser.email || "",
      name: result.name!,
      initials: result.initials!,
      authUserId: authUser.id,
    });

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-lg flex-col items-center justify-center px-4 py-16">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-xl font-bold">Welcome to TempChair!</h2>
            <p className="mt-2 text-muted-foreground">Your profile is set up. Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-lg flex-col items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome! Just a few details to get you started on TempChair.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!role ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-muted-foreground">I am a...</p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-6 hover:border-primary"
                  onClick={() => setRole("worker")}
                >
                  <Users className="h-8 w-8 text-primary" />
                  <span className="font-semibold">Dental Professional</span>
                  <span className="text-xs text-muted-foreground">Hygienist, Assistant, Dentist</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-6 hover:border-primary"
                  onClick={() => setRole("clinic")}
                >
                  <Building2 className="h-8 w-8 text-primary" />
                  <span className="font-semibold">Dental Clinic</span>
                  <span className="text-xs text-muted-foreground">Hiring temp staff</span>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                {role === "worker" ? <Users className="h-4 w-4 text-primary" /> : <Building2 className="h-4 w-4 text-primary" />}
                <span>Setting up as a <strong>{role === "worker" ? "Dental Professional" : "Dental Clinic"}</strong></span>
                <button type="button" className="ml-auto text-xs text-primary hover:underline" onClick={() => { setRole(null); setError(""); }}>Change</button>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}

              {role === "worker" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <Select value={specialty} onValueChange={(v) => v && setSpecialty(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Input id="clinicName" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Boise Family Dental" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Your Name</Label>
                    <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Dr. Jane Smith" required />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
