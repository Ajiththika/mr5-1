import { generateMetadata } from "@/lib/seo";
import InstructorsPageClient from "@/components/instructors/InstructorsPageClient";

export const metadata = generateMetadata({
  title: "AI Instructors",
  description:
    "Meet MR5 School AI instructors and expert educators powering immersive 3D courses and personalized lessons.",
  url: "/instructors",
  keywords: [
    "AI teachers",
    "online instructors",
    "MR5 School educators",
    "virtual classroom teachers",
  ],
});

export default function InstructorsPage() {
  return <InstructorsPageClient />;
}
