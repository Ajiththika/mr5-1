import { generateMetadata } from "@/lib/seo";
import ProfilePageClient from "@/components/profile/ProfilePageClient";

export const metadata = generateMetadata({
  title: "My Profile",
  description:
    "Manage your MR5 School profile, learning progress, achievements, and browser permissions.",
  url: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfilePageClient />;
}
