"use client";

// Force dynamic rendering to avoid prerender issues with auth hooks
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { adminNavigation } from "@/data/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

// Define types for our data
interface UserGrowthData {
  month: string;
  users: number;
}

interface CourseEnrollmentData {
  course: string;
  enrollments: number;
}

interface RevenueTrendData {
  month: string;
  revenue: number;
}

interface PopularCourseData {
  title: string;
  students: number;
  rating: number;
}

interface PlatformStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  recentEnrollments: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  engagementRate: number;
}

interface AnalyticsData {
  userGrowth: UserGrowthData[];
  courseEnrollments: CourseEnrollmentData[];
  revenueTrends: RevenueTrendData[];
  popularCourses: PopularCourseData[];
}

export default function AnalyticsDashboard() {
  const { user } = useEnhancedUser();
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    courseEnrollments: [],
    revenueTrends: [],
    popularCourses: [],
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      fetchAnalyticsData();
    }
  }, [user, router]);

  const fetchAnalyticsData = async () => {
    try {
      const statsRes = await apiClient.get("/api/admin/stats");
      const data = statsRes.data.data as PlatformStats;
      setStats(data);

      setAnalyticsData({
        userGrowth: [
          { month: "Total Users", users: data.totalUsers || 0 },
          { month: "Students", users: data.totalStudents || 0 },
          { month: "New Enrollments (30d)", users: data.recentEnrollments || 0 },
        ],
        courseEnrollments: [
          { course: "Published Courses", enrollments: data.totalCourses || 0 },
          { course: "Total Enrollments", enrollments: data.totalEnrollments || 0 },
        ],
        revenueTrends: [
          { month: "All Time", revenue: data.totalRevenue || 0 },
          { month: "Last 30 Days", revenue: data.monthlyRevenue || 0 },
        ],
        popularCourses: [],
      });
    } catch (error: unknown) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <aside className="hidden md:block border-r border-border/40">
        <DashboardSidebar navigation={adminNavigation} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Analytics Dashboard" navigation={adminNavigation} />

        <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
            <p className="text-muted-foreground">
              Detailed insights and metrics for your platform
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all hover:bg-accent/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {stats?.totalUsers ?? "—"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats?.totalStudents ?? 0} approved students
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all hover:bg-accent/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {stats?.totalCourses ?? "—"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats?.totalEnrollments ?? 0} total enrollments
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all hover:bg-accent/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-orange-500/10">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  ${(stats?.totalRevenue ?? 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(stats?.monthlyRevenue ?? 0).toLocaleString()} last 30 days
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all hover:bg-accent/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Engagement Rate
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {stats?.engagementRate ?? 0}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats?.recentEnrollments ?? 0} enrollments in last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  Monthly user registration trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.userGrowth.map((row) => (
                    <div key={row.month} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.month}</span>
                      <span className="font-semibold">{row.users}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.revenueTrends.map((row) => (
                    <div key={row.month} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.month}</span>
                      <span className="font-semibold">${row.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Course Enrollments</CardTitle>
                <CardDescription>
                  Top courses by enrollment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.courseEnrollments.map((row) => (
                    <div key={row.course} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.course}</span>
                      <span className="font-semibold">{row.enrollments}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Popular Courses</CardTitle>
                <CardDescription>
                  Highest rated courses on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.popularCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Course ratings will appear here once reviews are collected.
                    </p>
                  ) : (
                    analyticsData.popularCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.students} students</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">{course.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}