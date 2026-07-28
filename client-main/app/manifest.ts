import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "MR5 School - Learn with AI",
		short_name: "MR5 School",
		description: "Advanced online learning platform with AI-powered avatars and interactive courses",
		start_url: "/",
		display: "standalone",
		background_color: "#18181b",
		theme_color: "#786eff",
		orientation: "portrait-primary",
		display_override: ["window-controls-overlay"],
		icons: [
			{
				src: "/favicon-16x16.png",
				sizes: "16x16",
				type: "image/png",
			},
			{
				src: "/favicon-32x32.png",
				sizes: "32x32",
				type: "image/png",
			},
			{
				src: "/favicon-96x96.png",
				sizes: "96x96",
				type: "image/png",
			},
			{
				src: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
		categories: ["education", "learning", "courses"],
		screenshots: [
			{
				src: "/images/screenshots/dashboard.png",
				sizes: "1280x800",
				type: "image/png"
			},
			{
				src: "/images/screenshots/course.png",
				sizes: "1280x800",
				type: "image/png"
			}
		],
		shortcuts: [
			{
				name: "Dashboard",
				url: "/dashboard",
				icons: [
					{
						src: "/favicon-96x96.png",
						sizes: "96x96",
						type: "image/png"
					}
				]
			},
			{
				name: "Courses",
				url: "/courses",
				icons: [
					{
						src: "/favicon-96x96.png",
						sizes: "96x96",
						type: "image/png"
					}
				]
			}
		]
	};
}


