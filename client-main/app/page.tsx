import { generateMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import HomePageClient from "@/components/home/HomePageClient";
import { MR5_LOGO_PATH } from "@/lib/brand/logo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mr5school.com";

export const metadata = generateMetadata({
  title: "3D Virtual Classroom with AI Teachers",
  description:
    "Enter MR5 School's immersive 3D virtual classroom. Drag to look around 360°, chat with your AI teacher, and learn with personalized lessons that remember your level and goals.",
  keywords: [
    "3D virtual classroom",
    "AI teacher online",
    "immersive learning platform",
    "MR5 School",
    "virtual school",
    "360 classroom view",
    "personalized AI tutor",
    "online education",
    "interactive lessons",
    "student learning app",
    "voice enabled learning",
    "digital classroom",
  ],
  url: "/",
  type: "website",
});

const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "MR5 School - 3D Virtual Classroom with AI Teachers",
  description:
    "Homepage for MR5 School: immersive 3D classrooms, AI teachers, and personalized online learning for students worldwide.",
  url: siteUrl,
  inLanguage: "en",
  isPartOf: {
    "@type": "WebSite",
    name: "MR5 School",
    url: siteUrl,
  },
  about: {
    "@type": "EducationalOrganization",
    name: "MR5 School",
    url: siteUrl,
  },
  primaryImageOfPage: `${siteUrl}${MR5_LOGO_PATH}`,
  potentialAction: {
    "@type": "ReadAction",
    target: siteUrl,
  },
};

export default function HomePage() {
  return (
    <>
      <StructuredData data={homePageSchema} />
      <HomePageClient />
    </>
  );
}
