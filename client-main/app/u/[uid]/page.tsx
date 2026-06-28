import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PublicProfileView } from "@/components/identity/PublicProfileView";
import { fetchPublicProfileServer } from "@/services/identity.service";
import { normalizeMr5Uid } from "@/lib/identity/uid";

type PageProps = {
	params: Promise<{ uid: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { uid } = await params;
	const normalized = normalizeMr5Uid(uid);
	if (!normalized) {
		return { title: "Profile | MR5" };
	}

	try {
		const profile = await fetchPublicProfileServer(normalized);
		return {
			title: `${profile.name} | MR5 Profile`,
			description: `Public MR5 academic profile for ${profile.uid}.`,
		};
	} catch {
		return { title: "Profile | MR5" };
	}
}

export default async function PublicProfilePage({ params }: PageProps) {
	const { uid } = await params;
	const normalized = normalizeMr5Uid(uid);
	if (!normalized) notFound();

	try {
		const profile = await fetchPublicProfileServer(normalized);
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<main id="main-content">
					<PublicProfileView profile={profile} />
				</main>
				<Footer />
			</div>
		);
	} catch {
		notFound();
	}
}
