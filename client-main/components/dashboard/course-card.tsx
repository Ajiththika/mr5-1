"use client";

import Image from "next/image";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

interface CourseCardProps {
  courseId: string;
  title: string;
  progress: number;
  iconPath?: string;
  instructor?: string;
  status?: "active" | "completed";
  className?: string;
}

export function CourseCard({
  courseId,
  title,
  progress,
  iconPath = "/assets/dashboard/course-icon-1.png",
  instructor,
  status = "active",
  className,
}: CourseCardProps) {
  const buttonText = progress > 0 ? "Continue Learning" : "Start Learning";

  return (
    <SpotlightCard
      className={`group/card h-full ${className}`}
      spotlightColor="rgba(var(--primary-channel), 0.15)"
    >
      <div className="relative z-10 flex h-full flex-col bg-surface/50 p-4 transition-colors hover:bg-surface/80">
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border border-white/5">
          <Image
            src={iconPath}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover/card:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {status === "completed" && (
            <Badge className="absolute right-2 top-2 bg-green-600/90 text-white">
              Completed
            </Badge>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h3 className="line-clamp-2 text-lg font-bold leading-tight text-foreground transition-colors group-hover/card:text-primary">
              {title}
            </h3>
            {instructor && (
              <p className="mt-1 text-xs text-muted-foreground">{instructor}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <span>Progress</span>
              <span className={progress === 100 ? "text-green-400" : "text-primary"}>
                {progress}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary-channel),0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            className="w-full border border-primary/20 bg-primary/10 text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
            size="sm"
            asChild
          >
            <Link href={`/course/${courseId}`}>
              <Play className="mr-2 h-4 w-4" />
              {buttonText}
            </Link>
          </Button>
        </div>
      </div>
    </SpotlightCard>
  );
}
