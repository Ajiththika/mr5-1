"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

interface CourseAccessGateProps {
  courseId: string;
  children: ReactNode;
}

export function CourseAccessGate({ courseId, children }: CourseAccessGateProps) {
  const { user, loading: authLoading } = useEnhancedUser();
  const router = useRouter();
  const [accessGranted, setAccessGranted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace(`/login?redirect=/course/${courseId}`);
      return;
    }

    if (user.role === "admin") {
      setAccessGranted(true);
      setCheckingAccess(false);
      return;
    }

    const verifyAccess = async () => {
      try {
        const response = await apiClient.get(`/api/enrollments/check/${courseId}`);
        if (response.data.access) {
          setAccessGranted(true);
        } else {
          setError("Enrollment required to access this area.");
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          router.replace("/login");
        } else {
          setError("Unable to verify access. Please try again.");
        }
      } finally {
        setCheckingAccess(false);
      }
    };

    verifyAccess();
  }, [user, authLoading, courseId, router]);

  if (authLoading || checkingAccess) {
    return (
      <div className="min-h-screen bg-[#0b1226] flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="text-blue-200">Verifying enrollment...</p>
      </div>
    );
  }

  if (error || !accessGranted) {
    return (
      <div className="min-h-screen bg-[#0b1226] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center">
          <Lock className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Restricted Area</h1>
          <p className="text-slate-300 mb-6">{error || "Access denied."}</p>
          <Button onClick={() => router.push(`/course/${courseId}`)}>View Course</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
