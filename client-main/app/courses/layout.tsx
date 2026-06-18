import { generateMetadata } from "@/lib/seo";
import { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = generateMetadata({
	title: "Online Courses - 3D Classroom & AI Tutoring",
	description:
		"Browse MR5 School courses with immersive 3D classrooms, AI teachers, and personalized learning paths. Food science, programming, web development, and more.",
	keywords: [
		"online courses",
		"3D virtual classroom courses",
		"AI tutor courses",
		"food science education",
		"nutrition courses",
		"programming courses",
		"web development",
		"immersive learning",
		"LMS courses",
	],
	url: "/courses",
	type: "website",
});

export default function CoursesLayout({
	children,
}: {
	children: ReactNode;
}) {
	return <>{children}</>;
}

