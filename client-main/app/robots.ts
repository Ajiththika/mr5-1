import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mr5school.com";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",
					"/admin/",
					"/student/",
					"/profile/",
					"/payment/",
					"/login",
					"/register",
					"/_next/",
					"/auth/",
				],
			},
			{
				userAgent: "Googlebot",
				allow: "/",
				disallow: [
					"/api/",
					"/admin/",
					"/student/",
					"/profile/",
					"/payment/",
					"/login",
					"/register",
					"/auth/",
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}

