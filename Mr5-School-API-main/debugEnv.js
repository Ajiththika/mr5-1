// This file will be imported by the server to debug environment variables
console.log("Debug: Checking GEMINI_API_KEY in server process");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
console.log("Length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");

export default {};