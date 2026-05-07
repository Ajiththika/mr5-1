import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

console.log("Starting debug imports...");

try {
    console.log("Importing db...");
    await import("./src/config/db.js");
    console.log("Importing errorHandler...");
    await import("./src/middleware/errorHandler.js");
    console.log("Importing authRoutes...");
    await import("./src/routes/authRoutes.js");
    console.log("Importing userRoutes...");
    await import("./src/routes/userRoutes.js");
    console.log("Importing submissionRoutes...");
    await import("./src/routes/submissionRoutes.js");
    console.log("Importing paymentRoutes...");
    await import("./src/routes/paymentRoutes.js");
    console.log("Importing lessonRoutes...");
    await import("./src/routes/lessonRoutes.js");
    console.log("Importing enrollmentRoutes...");
    await import("./src/routes/enrollmentRoutes.js");
    console.log("Importing courseRoutes...");
    await import("./src/routes/courseRoutes.js");
    console.log("Importing assignmentRoutes...");
    await import("./src/routes/assignmentRoutes.js");
    console.log("Importing ai_Assistant_InteractionRoutes...");
    await import("./src/routes/ai_Assistant_InteractionRoutes.js");
    console.log("Importing adminRoutes...");
    await import("./src/routes/adminRoutes.js");
    console.log("Importing avatarRoutes...");
    await import("./src/routes/avatarRoutes.js");
    console.log("Importing livekitRoutes...");
    await import("./src/routes/livekitRoutes.js");
    console.log("Importing ttsRoutes...");
    await import("./src/routes/ttsRoutes.js");

    console.log("All imports successful!");
} catch (error) {
    console.error("Import failed:", error);
}
