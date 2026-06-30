"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Clock,
  Pencil,
  Shield,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { PermissionsManager } from "@/components/permissions-manager";
import { LiquidProgressBar } from "@/components/dashboard/progress-bar";
import { AvatarPresetBadge } from "@/components/avatar/AvatarPresetBadge";
import { ProfileEditModal, type ProfileEditForm } from "@/components/profile/ProfileEditModal";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { enrollmentService, type Enrollment } from "@/services/enrollment.service";
import { IdentityPrivacyPanel } from "@/components/identity/IdentityPrivacyPanel";
import { FriendInbox } from "@/components/identity/FriendInbox";

function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Administrator";
    case "AI-TEACHER":
      return "AI Instructor";
    case "student":
      return "Student";
    default:
      return role;
  }
}

function trackLabel(role: string) {
  switch (role) {
    case "admin":
      return "Platform Admin";
    case "AI-TEACHER":
      return "Teaching Track";
    case "student":
      return "Learning Track";
    default:
      return "Member";
  }
}

export default function ProfilePageClient() {
  const { user, loading: authLoading, refreshUser } = useEnhancedUser();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [level, setLevel] = useState(1);
  const [loginCount, setLoginCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`login_count_${user.id}`);
    const count = saved ? parseInt(saved, 10) : 12;
    setLoginCount(count);
    setLevel(Math.min(100, Math.max(1, Math.floor(count / 5))));
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    enrollmentService
      .getMyEnrollments()
      .then((res) => setEnrollments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const stats = useMemo(() => {
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const avgProgress =
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progress, 0) /
              enrollments.length,
          )
        : 0;
    return {
      streak: Math.max(1, completed * 3 + 5),
      hoursLearned: (enrollments.length * 4.2 + avgProgress * 0.1).toFixed(1),
      modulesCompleted: completed,
      totalModules: enrollments.length,
      weeklyGoal: Math.min(100, avgProgress || enrollments.length * 15),
    };
  }, [enrollments]);

  const subjects = useMemo(
    () =>
      enrollments.slice(0, 4).map((e) => ({
        name:
          e.course.title.length > 14
            ? `${e.course.title.slice(0, 14)}…`
            : e.course.title,
        progress: e.progress,
      })),
    [enrollments],
  );

  const editInitial: ProfileEditForm | null = user
    ? {
        name: user.name || "",
        email: user.email || "",
        language: user.language || "",
        timezone: user.timezone || "",
        avatarUrl: user.avatarUrl,
        avatarPreset: user.avatarPreset,
      }
    : null;

  const levelProgress = ((loginCount % 5) / 5) * 100;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !editInitial) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-purple-500 to-cyan-500 opacity-60 blur-md" />
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 md:h-28 md:w-28">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                ) : user.avatarPreset ? (
                  <AvatarPresetBadge presetId={user.avatarPreset} size="lg" />
                ) : (
                  <span className="text-3xl font-bold text-muted-foreground">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                Lv {level}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Profile</p>
              <h1 className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                {user.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Shield className="h-3 w-3" />
                  {roleLabel(user.role)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                  {trackLabel(user.role)}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5"
            onClick={() => setShowEdit(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </motion.div>

        <BentoGrid>
          <BentoItem
            colSpan={4}
            title="Learning Streak"
            subtitle="Keep your momentum going"
            icon={<Zap className="h-5 w-5" />}
          >
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-bold">{stats.streak}</span>
              <span className="mb-2 text-muted-foreground">days</span>
            </div>
          </BentoItem>

          <BentoItem
            colSpan={4}
            title="Hours Learned"
            icon={<Clock className="h-5 w-5" />}
          >
            <p className="mt-2 text-4xl font-bold">{stats.hoursLearned}</p>
            <p className="text-sm text-muted-foreground">total hours</p>
          </BentoItem>

          <BentoItem
            colSpan={4}
            title="Level Progress"
            subtitle={`${5 - (loginCount % 5)} logins to next level`}
            icon={<Star className="h-5 w-5" />}
          >
            <p className="mt-2 text-3xl font-bold">
              {level}
              <span className="text-lg text-muted-foreground"> / 100</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </BentoItem>

          <BentoItem
            colSpan={8}
            rowSpan={2}
            title="Weekly Goal"
            subtitle="Course progress across your enrollments"
            icon={<Activity className="h-5 w-5" />}
          >
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-bold text-primary">
                {stats.weeklyGoal}%
              </span>
              <span className="text-sm text-muted-foreground">
                {stats.modulesCompleted}/{stats.totalModules} completed
              </span>
            </div>
            <LiquidProgressBar progress={stats.weeklyGoal} className="mt-4 h-6" />
            {subjects.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {subjects.map((subject) => (
                  <div
                    key={subject.name}
                    className="rounded-xl border border-white/5 bg-white/5 p-3 text-center"
                  >
                    <p className="truncate text-xs text-muted-foreground">
                      {subject.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{subject.progress}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Enroll in a course to track subject progress here.
              </p>
            )}
          </BentoItem>

          <BentoItem
            colSpan={4}
            title="Achievements"
            icon={<Trophy className="h-5 w-5" />}
          >
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-xl border border-white/5 bg-white/5"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i <= Math.min(3, stats.modulesCompleted + 1)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </div>
              ))}
            </div>
          </BentoItem>

          <BentoItem
            colSpan={8}
            title="Continue Learning"
            icon={<BookOpen className="h-5 w-5" />}
          >
            <div className="mb-3 flex justify-end">
              <Link
                href="/courses"
                className="text-xs font-medium text-primary hover:underline"
              >
                Browse all courses
              </Link>
            </div>
            {enrollments.length > 0 ? (
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {enrollments.slice(0, 4).map((enrollment) => (
                  <Link
                    key={enrollment._id}
                    href={`/course/${enrollment.course._id}`}
                    className="group rounded-xl border border-white/5 bg-white/5 p-4 transition hover:border-primary/30 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium group-hover:text-primary">
                        {enrollment.course.title}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {enrollment.course.teacher?.name || "MR5 Instructor"}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No enrollments yet. Start your learning journey today.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </BentoItem>

          <BentoItem
            colSpan={12}
            title="Public profile privacy"
            subtitle="Control what appears on your MR5 academic identity page"
          >
            <IdentityPrivacyPanel mr5Uid={user.mr5Uid} />
          </BentoItem>

          <BentoItem colSpan={12} title="Friends" subtitle="Manage friend requests and connections">
            <FriendInbox />
          </BentoItem>

          <BentoItem
            colSpan={12}
            title="Permissions & Settings"
            subtitle="Browser permissions for the best MR5 experience"
            className="[&_.card]:border-0 [&_.card]:bg-transparent [&_.card]:shadow-none"
          >
            <div className="mt-2">
              <PermissionsManager />
            </div>
          </BentoItem>
        </BentoGrid>
      </main>

      <Footer />

      <ProfileEditModal
        open={showEdit}
        initial={editInitial}
        onClose={() => setShowEdit(false)}
        onSaved={refreshUser}
      />
    </div>
  );
}
