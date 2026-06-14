"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CheckCircle2, X, Plus } from "lucide-react";
import { updateWorkerProfile } from "@/lib/db/actions";

interface WorkerData {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  location: string;
  bio: string;
  experience: string;
  hourlyRate: string;
  availability: string;
  certifications: string[];
}

export function WorkerProfileEdit({
  worker,
  onClose,
  onSaved,
}: {
  worker: WorkerData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [firstName, setFirstName] = useState(worker.firstName);
  const [lastName, setLastName] = useState(worker.lastName);
  const [specialty, setSpecialty] = useState(worker.specialty);
  const [location, setLocation] = useState(worker.location);
  const [bio, setBio] = useState(worker.bio);
  const [experience, setExperience] = useState(worker.experience);
  const [hourlyRate, setHourlyRate] = useState(worker.hourlyRate);
  const [availability, setAvailability] = useState(worker.availability);
  const [certifications, setCertifications] = useState<string[]>(worker.certifications);
  const [newCert, setNewCert] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function addCert() {
    const trimmed = newCert.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications([...certifications, trimmed]);
      setNewCert("");
    }
  }

  function removeCert(cert: string) {
    setCertifications(certifications.filter((c) => c !== cert));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const result = await updateWorkerProfile(worker.id, {
        firstName,
        lastName,
        specialty: specialty as "Hygienist" | "Assistant" | "Dentist",
        location,
        bio,
        experience,
        hourlyRate,
        availability,
        certifications,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => {
          onSaved();
        }, 1500);
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Profile Updated!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your changes have been saved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Edit Profile</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Boise, ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="5 years"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <Input
                id="hourlyRate"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="$45–55/hr"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Available next week"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell clinics about your experience and skills..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {certifications.map((cert) => (
                <Badge key={cert} variant="secondary" className="text-xs gap-1">
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCert(cert)}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="Add a certification..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCert();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addCert}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
