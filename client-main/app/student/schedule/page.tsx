"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentSchedule() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">Your upcoming classes and deadlines</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">
              No scheduled events yet. Check your assignments and course lessons for deadlines.
            </p>
            <Button asChild variant="outline">
              <Link href="/student/assignments">View assignments</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
