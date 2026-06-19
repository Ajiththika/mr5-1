import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "../src/config/db.js";
import Course from "../src/models/Course.js";
import Lesson from "../src/models/Lesson.js";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

const courseData = {
    title: "Meshy.ai 3D Generation Masterclass",
    description: "An industry-leading course on automating 3D asset creation. Learn to harness the Meshy.ai API to transform text and images into high-fidelity 3D models. This course covers authentication, task management, polling strategies, and engine-ready exports.",
    category: "AI & 3D Design",
    level: "Intermediate",
    price: 0, // Making it accessible for this demo
    language: "English",
    isApproved: true,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
};

const lessonsData = [
    {
        title: "01. Introduction to Generative 3D",
        content: `
# The Future of 3D Content Creation

Welcome to the **Meshy.ai Masterclass**. In this lesson, we break down how Generative AI is disrupting traditional 3D pipelines.

## Why Meshy.ai?
Traditional 3D modeling takes hours or days. With Meshy.ai's API, you can generate base meshes in seconds.
- **Speed**: Reduced drafting time by 90%.
- **Scalability**: Generate thousand of variations programmatically.
- **Quality**: Meshy-6 (the latest model) provides professional-grade topology.

## Course Objectives
1.  Master API Authentication.
2.  Convert Text Prompts to 3D.
3.  Turn 2D Photos into 3D objects.
4.  Implement robust Polling and Error Handling.
5.  Export to Unity, Unreal, and Web (GLB).
        `,
        order: 1,
        duration: 10
    },
    {
        title: "02. Secure Authentication & Environments",
        content: `
# Setting Up Your Environment

To interact with Meshy.ai, you need a valid API Key. 

## The API Core
All requests are sent to: \`https://api.meshy.ai/v1\`

## Authentication Code Sample (Node.js)
Place your key in an environment variable \`MESHY_API_KEY\`.

\`\`\`javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.meshy.ai/v1',
  headers: {
    'Authorization': \`Bearer \${process.env.MESHY_API_KEY}\`,
    'Content-Type': 'application/json'
  }
});
\`\`\`

> **Note**: Store your API key in \`MESHY_API_KEY\` — never expose it in client-side code!
        `,
        order: 2,
        duration: 15
    },
    {
        title: "03. Text-to-3D: Prompt Engineering",
        content: `
# Crafting the Perfect Model

Text-to-3D is sensitive to your prompt. Better prompts = better topology.

## The Two-Step Process
1.  **Preview**: Fast, creates the basic shape (geometry).
2.  **Refine**: Detailed, adds PBR textures (Physical Based Rendering).

### Request Payload
\`\`\`javascript
const response = await client.post('/text-to-3d', {
  mode: 'preview',
  prompt: 'A medieval knight helmet with gold engravings, high fantasy style',
  art_style: 'realistic',
  negative_prompt: 'low quality, blurry, distorted'
});

const taskId = response.data.result;
console.log('Task Created:', taskId);
\`\`\`

### Best Practices
- Use descriptive adjectives (e.g., "worn leather", "polished steel").
- Specify the art style (realistic, voxel, low-poly).
        `,
        order: 3,
        duration: 20
    },
    {
        title: "04. Image-to-3D: From Concept to Reality",
        content: `
# Converting 2D Imagery

This is perhaps the most powerful feature. Give Meshy a concept art, and it builds the rest.

### Preparing the Image
- Use high-contrast backgrounds.
- Ensure the object is centered.
- PNG or JPG formats are preferred.

### API Implementation
\`\`\`javascript
const response = await client.post('/image-to-3d', {
  image_url: 'https://your-server.com/sketch.png',
  enable_pbr: true
});
\`\`\`

The AI will automatically generate the "hallucinated" back and side views of the object.
        `,
        order: 4,
        duration: 25
    },
    {
        title: "05. Polling & Task Management",
        content: `
# Handling Asynchronous Generation

3D generation is not instant. It takes 30-120 seconds. You must "poll" the API or use webhooks.

### Polling Logic
\`\`\`javascript
async function checkStatus(taskId) {
  const check = await client.get(\`/text-to-3d/\${taskId}\`);
  const status = check.data.status;
  
  if (status === 'SUCCEEDED') {
    return check.data.model_urls;
  } else if (status === 'FAILED') {
    throw new Error('Generation failed: ' + check.data.error.message);
  } else {
    console.log('Progress:', check.data.progress + '%');
    await new Promise(r => setTimeout(r, 5000)); // Wait 5s
    return checkStatus(taskId);
  }
}
\`\`\`

### Error Handling
Common errors include:
- **401 Unauthorized**: Key is wrong.
- **429 Too Many Requests**: You hit the rate limit.
- **402 Payment Required**: Out of credits.
        `,
        order: 5,
        duration: 30
    },
    {
        title: "06. Exporting & Integration",
        content: `
# Getting Your Models Into Production

Meshy provides multiple file formats in a single ZIP.

## Format Guide
1.  **.glb**: Best for Three.js, React Three Fiber, and Mobile.
2.  **.fbx**: Industry standard for Maya, Blender, and Unity.
3.  **.usdz**: Specifically for iOS AR (Apple Quick Look).

## Post-Processing Tips
Generated models often have more triangles than needed. We recommend a pass through:
- **Blender Decimate Modifier**: To reduce poly count.
- **Instant Meshes**: For better retopology.

### Final Code Sample: Downloading the Model
\`\`\`javascript
const fs = require('fs');
const download = await axios.get(modelUrls.glb, { responseType: 'stream' });
download.data.pipe(fs.createWriteStream('my_model.glb'));
\`\`\`
        `,
        order: 6,
        duration: 20
    }
];

async function seedMeshyCourse() {
    try {
        console.log("Connecting to database...");
        await connectDB();

        // Get AI Teacher
        let aiTeacher = await User.findOne({ role: { $in: ["AI-TEACHER", "admin"] } });
        if (!aiTeacher) {
            const seedPassword = process.env.SEED_USER_PASSWORD;
            if (!seedPassword) {
                throw new Error("SEED_USER_PASSWORD env var is required to create the seed instructor.");
            }
            aiTeacher = await User.create({
                name: "AI Instructor (Meshy)",
                email: "instructor@meshy-academy.ai",
                password: seedPassword,
                role: "admin",
                isActive: true,
            });
        }

        // Create or Update Course
        let course = await Course.findOne({ title: courseData.title });
        if (course) {
            console.log("Updating existing course with UPGRADED content...");
            Object.assign(course, { ...courseData, teacher: aiTeacher._id });
            await course.save();
        } else {
            console.log("Creating new upgraded course...");
            course = await Course.create({ ...courseData, teacher: aiTeacher._id });
        }

        // Add Lessons
        console.log("Re-syncing lessons...");
        // Clear old lessons for this course to ensure fresh state
        await Lesson.deleteMany({ course: course._id });

        for (const lessonData of lessonsData) {
            await Lesson.create({
                ...lessonData,
                course: course._id,
            });
            console.log(`- Synced: ${lessonData.title}`);
        }

        console.log("\n" + "=".repeat(40));
        console.log("MESHY MASTERCLASS UPGRADE COMPLETE!");
        console.log("=".repeat(40));
        console.log(`Course ID: ${course._id}`);
        console.log(`Total Lessons: ${lessonsData.length}`);
        process.exit(0);
    } catch (error) {
        console.error("Error upgrading course:", error);
        process.exit(1);
    }
}

seedMeshyCourse();
