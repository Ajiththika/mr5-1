import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generate course description using Gemini API
 * @param {string} courseTitle - The title of the course
 * @returns {Promise<Object>} - Object containing description, category, and level
 */
export async function generateCourseDetails(courseTitle) {
	try {
		if (!genAI) {
			console.warn("GEMINI_API_KEY not found. Using default descriptions.");
			return getDefaultCourseDetails(courseTitle);
		}

		const model = genAI.getGenerativeModel({ model: "gemini-pro" });

		const prompt = `You are an expert course content creator. For the course titled "${courseTitle}", provide a comprehensive analysis in JSON format with the following structure:

{
  "description": "A detailed, engaging course description (150-250 words) that explains what students will learn, the benefits, and who should take this course. Make it professional and compelling.",
  "category": "One of: Technology, Design, Business, Security, Productivity, Education, Development, Marketing, or Other",
  "level": "One of: Beginner, Intermediate, or Advanced",
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]
}

Focus on:
- What skills and knowledge students will gain
- Real-world applications
- Career benefits
- Prerequisites (if any)
- What makes this course valuable

Return ONLY valid JSON, no markdown formatting, no code blocks.`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		// Clean the response (remove markdown code blocks if present)
		let cleanedText = text.trim();
		if (cleanedText.startsWith("```json")) {
			cleanedText = cleanedText
				.replace(/```json\n?/g, "")
				.replace(/```\n?/g, "");
		} else if (cleanedText.startsWith("```")) {
			cleanedText = cleanedText.replace(/```\n?/g, "");
		}

		const courseDetails = JSON.parse(cleanedText);

		// Validate and set defaults if needed
		return {
			description:
				courseDetails.description || getDefaultDescription(courseTitle),
			category: courseDetails.category || "Other",
			level: courseDetails.level || "Beginner",
			keyTopics: courseDetails.keyTopics || [],
		};
	} catch (error) {
		console.error(
			`Error generating details for "${courseTitle}":`,
			error.message,
		);
		return getDefaultCourseDetails(courseTitle);
	}
}

/**
 * Get default course details when Gemini API is not available
 */
function getDefaultCourseDetails(courseTitle) {
	return {
		description: getDefaultDescription(courseTitle),
		category: categorizeCourse(courseTitle),
		level: determineLevel(courseTitle),
		keyTopics: [],
	};
}

/**
 * Generate a default description based on course title
 */
function getDefaultDescription(title) {
	const lowerTitle = title.toLowerCase();

	if (lowerTitle.includes("full-stack")) {
		return "Master both frontend and backend development to become a complete full-stack developer. Learn modern frameworks, databases, APIs, and deployment strategies. Build real-world applications from scratch and deploy them to production.";
	} else if (
		lowerTitle.includes("cybersecurity") ||
		lowerTitle.includes("security")
	) {
		return "Learn essential cybersecurity principles and practices to protect systems and data. Understand threats, vulnerabilities, and defense mechanisms. Gain hands-on experience with security tools and techniques used by professionals.";
	} else if (lowerTitle.includes("ui/ux") || lowerTitle.includes("design")) {
		return "Create beautiful and user-friendly interfaces that provide exceptional user experiences. Learn design principles, user research, wireframing, prototyping, and usability testing. Build a professional design portfolio.";
	} else if (lowerTitle.includes("office")) {
		return "Master Microsoft Office suite including Word, Excel, PowerPoint, and Outlook. Learn essential productivity skills for professional environments. Create professional documents, analyze data, and deliver impactful presentations.";
	} else if (lowerTitle.includes("network")) {
		return "Understand network security fundamentals, firewall configuration, and network protection strategies. Learn to secure network infrastructure and prevent unauthorized access. Hands-on experience with industry-standard tools.";
	} else if (lowerTitle.includes("chatgpt") || lowerTitle.includes("prompt")) {
		return "Master the art of prompt engineering to get the best results from AI language models. Learn advanced techniques, best practices, and creative strategies for interacting with ChatGPT and similar AI tools.";
	} else if (
		lowerTitle.includes("motion graphics") ||
		lowerTitle.includes("after effects")
	) {
		return "Create stunning motion graphics and visual effects using Adobe After Effects. Learn animation principles, compositing, keyframing, and professional workflows. Bring your creative visions to life.";
	} else if (lowerTitle.includes("logo") || lowerTitle.includes("branding")) {
		return "Learn the fundamentals of logo design and brand identity creation. Understand typography, color theory, and visual communication. Create memorable brand identities that resonate with audiences.";
	} else if (
		lowerTitle.includes("resume") ||
		lowerTitle.includes("interview")
	) {
		return "Build a winning resume and ace job interviews. Learn how to highlight your skills, write compelling cover letters, and prepare for common interview questions. Boost your career prospects.";
	} else if (lowerTitle.includes("editing")) {
		return "Master video and photo editing techniques using professional software. Learn color correction, transitions, effects, and storytelling through visual media. Create polished, professional content.";
	} else if (lowerTitle.includes("canva")) {
		return "Get started with Canva to create stunning designs without prior design experience. Learn to use templates, graphics, and tools to create social media posts, presentations, and marketing materials.";
	} else if (lowerTitle.includes("3d") || lowerTitle.includes("blender")) {
		return "Explore 3D modeling, animation, and rendering with Blender. Learn to create 3D assets, characters, and scenes. Master the tools and techniques used in game development and animation.";
	} else if (lowerTitle.includes("animation")) {
		return "Learn the fundamentals of animation including timing, spacing, and movement principles. Understand keyframe animation, tweening, and character animation. Create engaging animated content.";
	} else if (
		lowerTitle.includes("typography") ||
		lowerTitle.includes("color")
	) {
		return "Master typography and color theory to create visually appealing designs. Learn how fonts, spacing, and colors affect user perception and communication. Apply these principles to your design work.";
	} else if (lowerTitle.includes("portfolio")) {
		return "Build a professional portfolio that showcases your design work effectively. Learn how to present projects, write case studies, and create an online presence that attracts clients and employers.";
	} else if (lowerTitle.includes("machine learning")) {
		return "Introduction to machine learning concepts, algorithms, and applications. Learn supervised and unsupervised learning, neural networks, and how to build ML models. Hands-on projects included.";
	} else if (
		lowerTitle.includes("artificial intelligence") ||
		lowerTitle.includes("ai")
	) {
		return "Explore the theory and applications of artificial intelligence. Understand AI concepts, history, current trends, and future possibilities. Learn how AI is transforming industries.";
	} else if (lowerTitle.includes("time management")) {
		return "Master time management techniques to boost productivity and achieve your goals. Learn prioritization, planning, and organization strategies. Reduce stress and accomplish more in less time.";
	} else if (lowerTitle.includes("devops") || lowerTitle.includes("cloud")) {
		return "Learn cloud computing and DevOps practices to deploy and manage applications at scale. Master CI/CD, containerization, cloud services, and infrastructure as code. Modern deployment strategies.";
	} else if (
		lowerTitle.includes("no-code") ||
		lowerTitle.includes("app development")
	) {
		return "Build applications without writing code using no-code platforms. Learn to create web and mobile apps using visual builders. Turn your ideas into functional applications quickly.";
	} else if (
		lowerTitle.includes("automation") ||
		lowerTitle.includes("zapier") ||
		lowerTitle.includes("n8n")
	) {
		return "Automate workflows and tasks using n8n and Zapier. Connect different apps and services to create powerful automations. Save time and increase efficiency in your work processes.";
	} else if (lowerTitle.includes("law") || lowerTitle.includes("privacy")) {
		return "Understand cyber law, data privacy regulations, and legal aspects of technology. Learn about GDPR, data protection, intellectual property, and compliance requirements in the digital age.";
	} else if (
		lowerTitle.includes("communication") ||
		lowerTitle.includes("presentation")
	) {
		return "Develop strong communication and presentation skills. Learn to deliver engaging presentations, communicate effectively, and influence others. Essential skills for professional success.";
	} else if (lowerTitle.includes("llm")) {
		return "Deep dive into Large Language Models (LLMs). Understand how LLMs work, their architecture, training methods, and applications. Learn to fine-tune and deploy LLMs for various use cases.";
	} else if (
		lowerTitle.includes("subscription") ||
		lowerTitle.includes("enterprise") ||
		lowerTitle.includes("business")
	) {
		return "Comprehensive business and enterprise solutions. Access premium features, priority support, and advanced tools. Designed for professionals and organizations seeking maximum value.";
	} else if (lowerTitle.includes("kids") || lowerTitle.includes("learning")) {
		return "Fun and engaging educational content designed specifically for children. Interactive lessons, games, and activities that make learning enjoyable. Age-appropriate curriculum for young learners.";
	} else {
		return `Comprehensive course on ${title}. Learn essential skills and knowledge through hands-on projects and expert instruction. Designed to help you achieve your learning goals and advance your career.`;
	}
}

/**
 * Categorize course based on title
 */
function categorizeCourse(title) {
	const lowerTitle = title.toLowerCase();

	if (
		lowerTitle.includes("full-stack") ||
		lowerTitle.includes("devops") ||
		lowerTitle.includes("app development") ||
		lowerTitle.includes("llm")
	) {
		return "Development";
	} else if (
		lowerTitle.includes("cybersecurity") ||
		lowerTitle.includes("security") ||
		lowerTitle.includes("network") ||
		lowerTitle.includes("law") ||
		lowerTitle.includes("privacy")
	) {
		return "Security";
	} else if (
		lowerTitle.includes("ui/ux") ||
		lowerTitle.includes("design") ||
		lowerTitle.includes("logo") ||
		lowerTitle.includes("branding") ||
		lowerTitle.includes("canva") ||
		lowerTitle.includes("3d") ||
		lowerTitle.includes("blender") ||
		lowerTitle.includes("animation") ||
		lowerTitle.includes("typography") ||
		lowerTitle.includes("portfolio") ||
		lowerTitle.includes("motion graphics")
	) {
		return "Design";
	} else if (
		lowerTitle.includes("machine learning") ||
		lowerTitle.includes("artificial intelligence") ||
		lowerTitle.includes("ai")
	) {
		return "Technology";
	} else if (
		lowerTitle.includes("office") ||
		lowerTitle.includes("resume") ||
		lowerTitle.includes("interview") ||
		lowerTitle.includes("time management") ||
		lowerTitle.includes("communication") ||
		lowerTitle.includes("presentation")
	) {
		return "Productivity";
	} else if (
		lowerTitle.includes("chatgpt") ||
		lowerTitle.includes("prompt") ||
		lowerTitle.includes("automation")
	) {
		return "Technology";
	} else if (
		lowerTitle.includes("subscription") ||
		lowerTitle.includes("enterprise") ||
		lowerTitle.includes("business")
	) {
		return "Business";
	} else if (lowerTitle.includes("kids") || lowerTitle.includes("learning")) {
		return "Education";
	} else {
		return "Other";
	}
}

/**
 * Determine course level based on title
 */
function determineLevel(title) {
	const lowerTitle = title.toLowerCase();

	if (
		lowerTitle.includes("fundamentals") ||
		lowerTitle.includes("beginner") ||
		lowerTitle.includes("basics") ||
		lowerTitle.includes("office") ||
		lowerTitle.includes("canva") ||
		lowerTitle.includes("kids")
	) {
		return "Beginner";
	} else if (
		lowerTitle.includes("advanced") ||
		lowerTitle.includes("masterclass") ||
		lowerTitle.includes("enterprise") ||
		lowerTitle.includes("devops")
	) {
		return "Advanced";
	} else {
		return "Intermediate";
	}
}
