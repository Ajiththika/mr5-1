"use client";

export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold">Accessibility</h1>
        <p className="text-muted-foreground text-lg">
          Mr5 School is committed to providing an inclusive learning experience for all students.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Keyboard navigation</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>All primary flows — login, course browse, lesson player — support keyboard focus and activation.</p>
            <p>Use Tab to move between controls and Enter or Space to activate buttons and links.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display preferences</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>Adjust theme, font size, and reduced motion from your profile settings.</p>
            <p>High-contrast and compact layout options are available in the UI preferences panel.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3D experiences</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>Virtual campus and classroom views are optional. Core lessons remain fully accessible without WebGL.</p>
            <p>If 3D content fails to load, use the lesson player link from your enrolled courses.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Report accessibility barriers at{" "}
              <a href="mailto:accessibility@mr5school.com" className="text-primary underline">
                accessibility@mr5school.com
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
