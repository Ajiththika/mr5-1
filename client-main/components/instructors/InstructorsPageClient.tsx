"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  GraduationCap,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { courseService, type Course } from "@/services/course.service";

interface InstructorCard {
  id: string;
  name: string;
  email: string;
  courseCount: number;
  courses: string[];
}

const FEATURED = [
  {
    name: "MR5 AI Teacher",
    role: "Lead Virtual Instructor",
    bio: "Voice-enabled AI tutor for immersive 3D lessons, adaptive pacing, and real-time student support.",
    emoji: "🤖",
  },
  {
    name: "Campus Guide",
    role: "Onboarding Specialist",
    bio: "Helps new students navigate the virtual campus, enroll in courses, and set learning goals.",
    emoji: "🎓",
  },
  {
    name: "Lab Mentor",
    role: "Practical Room Coach",
    bio: "Guides hands-on modules in the practical room with live environment and weather-aware scenes.",
    emoji: "🔬",
  },
];

export default function InstructorsPageClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService
      .getAllCourses({ limit: 50 })
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const instructors = useMemo(() => {
    const map = new Map<string, InstructorCard>();
    for (const course of courses) {
      const teacher = course.teacher;
      if (!teacher?._id) continue;
      const existing = map.get(teacher._id);
      if (existing) {
        existing.courseCount += 1;
        if (existing.courses.length < 3) existing.courses.push(course.title);
      } else {
        map.set(teacher._id, {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          courseCount: 1,
          courses: [course.title],
        });
      }
    }
    return Array.from(map.values());
  }, [courses]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-r from-primary/15 via-purple-600/10 to-cyan-600/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4">Instructors</Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Learn from AI-Powered Educators
            </h1>
            <p className="text-lg text-muted-foreground">
              MR5 School combines human expertise with intelligent AI teachers
              to deliver personalized, immersive lessons inside our 3D campus.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explore Courses
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-white/10 bg-white/5">
                <Link href="/register">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Become an Instructor
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 pb-20">
        <BentoGrid className="mb-12">
          <BentoItem colSpan={4} title="Active Instructors" icon={<Users className="h-5 w-5" />}>
            <p className="mt-2 text-4xl font-bold">
              {loading ? "—" : Math.max(instructors.length, FEATURED.length)}
            </p>
          </BentoItem>
          <BentoItem colSpan={4} title="Live Courses" icon={<BookOpen className="h-5 w-5" />}>
            <p className="mt-2 text-4xl font-bold">{loading ? "—" : courses.length}</p>
          </BentoItem>
          <BentoItem colSpan={4} title="AI-Enhanced" icon={<Bot className="h-5 w-5" />}>
            <p className="mt-2 text-sm text-muted-foreground">
              Voice, memory, and adaptive tutoring built into every lesson.
            </p>
          </BentoItem>
        </BentoGrid>

        <h2 className="mb-6 text-2xl font-bold">Featured AI Instructors</h2>
        <div className="mb-14 grid gap-6 md:grid-cols-3">
          {FEATURED.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                {item.emoji}
              </div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-primary">{item.role}</p>
              <p className="mt-3 text-sm text-muted-foreground">{item.bio}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="mb-6 text-2xl font-bold">Course Instructors</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : instructors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="rounded-2xl border border-white/10 bg-card p-6 transition hover:border-primary/30"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{instructor.name}</h3>
                    <p className="text-xs text-muted-foreground">{instructor.email}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {instructor.courseCount} course
                  {instructor.courseCount === 1 ? "" : "s"}
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  {instructor.courses.map((title) => (
                    <li key={title} className="truncate text-foreground/80">
                      • {title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
            <p className="text-muted-foreground">
              Instructor profiles will appear as courses are published.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/courses">View Courses</Link>
            </Button>
          </div>
        )}

        <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-primary/10 to-purple-500/10 p-8 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/mr5-logo-neon.png"
                  alt="MR5 School"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Teach on MR5 School</h3>
                <p className="text-sm text-muted-foreground">
                  Join as an AI-TEACHER and build immersive courses for students worldwide.
                </p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href="/register">Apply to Teach</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
