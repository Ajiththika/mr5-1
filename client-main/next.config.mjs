/** @type {import('next').NextConfig} */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const monorepoRoot = path.join(__dirname, "..");
const isMonorepoCheckout =
	fs.existsSync(path.join(monorepoRoot, "package.json")) &&
	fs.existsSync(path.join(monorepoRoot, "client-main", "package.json"));
// Nested standalone output breaks Docker unless entrypoint handles client-main/server.js.
// Skip monorepo tracing in container and Vercel builds for a flat, predictable bundle.
const useMonorepoTracing =
	isMonorepoCheckout && !process.env.DOCKER_BUILD && !process.env.VERCEL;

const nextConfig = {
	...(useMonorepoTracing ? { outputFileTracingRoot: monorepoRoot } : {}),
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
	...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),
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