"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";
import { courseService } from "@/services/course.service";
import { Course } from "@/services/course.service";
import { useEffect } from "react";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  const { user, loading, refreshUser } = useEnhancedUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/onboarding");
      return;
    }
    if (!loading && user?.onboardingCompleted) {
      router.replace("/dashboard");
    }
    if (user?.name) {
      setDisplayName(user.name);
    }
    if (user?.avatarPreset) {
      setSelectedPreset(user.avatarPreset);
    }
  }, [user, loading, router]);

  useEffect(() => {
    courseService.getAllCourses({ limit: 6 }).then((res) => {
      setCourses(res.data || []);
    }).catch(console.error);
  }, []);

  const finishOnboarding = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({
        name: displayName || user?.name,
        avatarPreset: selectedPreset,
        onboardingCompleted: true,
      });
      await refreshUser?.();
      toast.success("Welcome to Mr5 School!");
      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Could not save onboarding. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {step === 1 && "Welcome — set up your profile"}
            {step === 2 && "Choose your avatar"}
            {step === 3 && "Explore your first course"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Tell us how you'd like to be called in the virtual campus."}
            {step === 2 && "Pick a character preset for your 3D learning identity."}
            {step === 3 && "Browse featured courses and start learning."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-sm font-medium" htmlFor="displayName">
                Display name
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedPreset === preset.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${preset.color}33` }}
                  >
                    {preset.emoji}
                  </div>
                  <p className="text-xs font-medium">{preset.name}</p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {courses.length === 0 ? (
                <p className="text-muted-foreground text-sm">No courses available yet. You can browse later.</p>
              ) : (
                courses.slice(0, 4).map((course) => (
                  <Link
                    key={course._id}
                    href={`/course/${course._id}`}
                    className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors"
                  >
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                  </Link>
                ))
              )}
              <Button variant="outline" asChild className="w-full">
                <Link href="/courses">Browse all courses</Link>
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  (step === 1 && !displayName.trim()) ||
                  (step === 2 && !selectedPreset)
                }
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={finishOnboarding} disabled={saving}>
                {saving ? "Saving..." : "Enter campus"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
