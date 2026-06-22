/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
	outputFileTracingRoot: path.join(__dirname, "../"),
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.pexels.com",
				port: "",
				pathname: "/**",
			}
		],

		formats: ["image/avif", "image/webp"],
	},
	compress: true,
	poweredByHeader: false,
	generateEtags: true,
	reactStrictMode: true,
	output: "standalone",
	serverExternalPackages: ["@splinetool/runtime", "@splinetool/react-spline"],
	experimental: {
		optimizeCss: true,
	},
	// Increase chunk loading timeout to prevent ChunkLoadError
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=*, microphone=*, geolocation=*",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
				],
			},
			{
				source: "/sw.js",
				headers: [
					{
						key: "Cache-Control",
						value: "no-cache, no-store, must-revalidate",
					},
					{
						key: "Content-Type",
						value: "application/javascript; charset=utf-8",
					},
				],
			},
		];
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` : 'http://127.0.0.1:5001/api/:path*',
			},
		];
	},
	async redirects() {
		return [
			{ source: "/avatar/list", destination: "/apps/avatar-creator", permanent: false },
			{ source: "/avatar/register", destination: "/register", permanent: false },
			{ source: "/apps/course-generator", destination: "/courses", permanent: false },
			{ source: "/ai-assistant/avatar-support", destination: "/ai-assistant", permanent: false },
			{ source: "/course/:id/school", destination: "/course/:id", permanent: false },
		];
	},
};

export default nextConfig;