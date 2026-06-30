"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Search,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { enrollmentService } from "@/services/enrollment.service";
import { assignmentService, Assignment } from "@/services/assignment.service";

interface CourseProgress {
  id: string;
  title: string;
  progress: number;
  thumbnail?: string;
  instructor: string;
  category?: string;
}

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
      </div>
    </motion.div>
  );
}

export default function StudentPortal() {
  const { user } = useEnhancedUser();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState({
    active: "0",
    completed: "0",
    avgProgress: "0%",
    dueSoon: "0",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const enrollmentRes = await enrollmentService.getMyEnrollments({ limit: 12 });
        const enrollments = enrollmentRes.data || [];

        const mapped: CourseProgress[] = enrollments.map((enrollment) => ({
          id: enrollment.course._id,
          title: enrollment.course.title,
          progress: enrollment.progress,
          thumbnail: enrollment.course.thumbnail,
          instructor: enrollment.course.teacher.name,
          category: enrollment.course.level,
        }));
        setCourses(mapped);

        const active = enrollments.filter((e) => e.status === "active").length;
        const completed = enrollments.filter((e) => e.status === "completed").length;
        const avg =
          mapped.length > 0
            ? Math.round(
                mapped.reduce((sum, course) => sum + course.progress, 0) / mapped.length,
              )
            : 0;

        const courseIds = enrollments.map((e) => e.course._id);
        let dueSoon = 0;
        if (courseIds.length) {
          const assignmentLists = await Promise.all(
            courseIds.map((courseId) =>
              assignmentService.getAssignments({ course: courseId, limit: 20 }),
            ),
          );
          const allAssignments = assignmentLists.flatMap((r) => r.data || []);
          const now = Date.now();
          const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
          dueSoon = allAssignments.filter((assignment) => {
            const due = new Date(assignment.dueDate).getTime();
            return due >= now && due <= weekAhead;
          }).length;
          setUpcomingAssignments(
            allAssignments
              .sort(
                (a, b) =>
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
              )
              .slice(0, 4),
          );
        }

        setStats({
          active: String(active),
          completed: String(completed),
          avgProgress: `${avg}%`,
          dueSoon: String(dueSoon),
        });
      } catch (error) {
        console.error("Failed to load student portal", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) load();
  }, [user]);

  const firstName = user?.name?.split(" ")[0] || "Student";

  return (
    <>
      <StudentPageHeader
        title={`Welcome back, ${firstName}`}
        description="Pick up where you left off — your courses, deadlines, and progress are ready."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/courses">
                <Search className="mr-2 h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/ai-assistant">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Tutor
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Active Courses"
          value={stats.active}
          icon={<BookOpen className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Avg. Progress"
          value={stats.avgProgress}
          icon={<Trophy className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Due This Week"
          value={stats.dueSoon}
          icon={<Clock className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Continue Learning
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/courses">
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-44 rounded-xl" />
                  <Skeleton className="h-44 rounded-xl" />
                </div>
              ) : courses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {courses.slice(0, 4).map((course) => (
                    <div
                      key={course.id}
                      className="overflow-hidden rounded-xl border border-border bg-card/50"
                    >
                      <div className="relative h-28 bg-gradient-to-br from-primary/20 to-violet-500/10">
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-8 w-8 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="truncate font-semibold text-white">{course.title}</p>
                          <p className="truncate text-xs text-white/75">{course.instructor}</p>
                        </div>
                      </div>
                      <div className="space-y-3 p-4">
                        {course.category && (
                          <Badge variant="secondary" className="text-[10px]">
                            {course.category}
                          </Badge>
                        )}
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-primary">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-1.5" />
                        <Button className="w-full" size="sm" asChild>
                          <Link href={`/course/${course.id}`}>Continue</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border py-12 text-center">
                  <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">No courses yet</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Enroll in a course to start your learning journey.
                  </p>
                  <Button asChild>
                    <Link href="/courses">Explore Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-amber-500" />
                Upcoming
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/schedule">Schedule</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </>
              ) : upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="rounded-lg border border-border p-3 hover:bg-accent/40"
                  >
                    <p className="text-sm font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.course?.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upcoming deadlines. You&apos;re all caught up.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { href: "/student/courses", label: "My Courses", icon: BookOpen },
                { href: "/student/assignments", label: "Assignments", icon: Target },
                { href: "/student/grades", label: "Grades", icon: Trophy },
                { href: "/avatar-shop", label: "Own Store", icon: Sparkles },
              ].map((action) => (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
