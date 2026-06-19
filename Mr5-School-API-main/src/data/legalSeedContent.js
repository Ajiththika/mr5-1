/**
 * Seed content for legal documents.
 * LEGAL REVIEW REQUIRED before production deployment.
 */

function toMarkdown(sections) {
	return sections
		.map((s) => {
			let md = `## ${s.title}\n\n${s.paragraphs.join("\n\n")}`;
			if (s.bullets?.length) {
				md += `\n\n${s.bullets.map((b) => `- ${b}`).join("\n")}`;
			}
			return md;
		})
		.join("\n\n");
}

const TERMS_SECTIONS = [
	{
		title: "Acceptance of Terms",
		paragraphs: [
			"By creating an account or using MR5 School, you agree to these Terms of Service and our Privacy Policy.",
		],
	},
	{
		title: "Platform Use",
		paragraphs: [
			"MR5 School provides online courses, AI tutoring, and optional 3D immersive classrooms.",
			"You agree not to misuse the platform, scrape assets, or interfere with other learners.",
		],
		bullets: [
			"3D environments may cause discomfort — use 2D lesson fallback when needed",
			"AI outputs are assistive only and may be inaccurate",
		],
	},
	{
		title: "Limitation of Liability",
		paragraphs: [
			"The platform is provided as-is. MR5 School is not liable for indirect damages arising from service interruptions, network latency, or 3D rendering issues.",
		],
	},
];

const PRIVACY_SECTIONS = [
	{
		title: "Overview",
		paragraphs: [
			"MR5 School collects data needed to deliver courses, progress tracking, and optional AI and 3D features.",
		],
	},
	{
		title: "Information We Collect",
		paragraphs: ["Depending on usage we may process:"],
		bullets: [
			"Account and profile information",
			"Learning progress and enrollments",
			"Technical and security logs",
			"AI interactions when AI features are enabled",
			"Optional spatial telemetry only with explicit opt-in",
		],
	},
	{
		title: "Your Rights",
		paragraphs: [
			"You may request access, correction, or deletion of personal data where applicable law provides those rights.",
		],
	},
];

export const LEGAL_SEED_DOCUMENTS = [
	{
		slug: "platform-terms",
		type: "platform_terms",
		title: "Terms of Service",
		description: "Rules for using MR5 School",
		isMandatory: true,
		isPublished: true,
		versionNumber: "1.0.0",
		content: toMarkdown(TERMS_SECTIONS),
		summaryOfChanges: "Initial publication",
	},
	{
		slug: "privacy-policy",
		type: "privacy_policy",
		title: "Privacy Policy",
		description: "How we handle your data",
		isMandatory: true,
		isPublished: true,
		versionNumber: "1.0.0",
		content: toMarkdown(PRIVACY_SECTIONS),
		summaryOfChanges: "Initial publication",
	},
];
