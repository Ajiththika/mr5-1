
import axios from "axios";

async function testRegistration() {
    const api = axios.create({
        baseURL: "http://localhost:5000",
        withCredentials: true,
    });

    const timestamp = Date.now();
    const testEmail = `testuser_${timestamp}@example.com`;
    const testPassword = "Password@123";

    try {
        console.log("1. Registering new user...");
        const regResponse = await api.post("/api/auth/register", {
            name: "Test User",
            email: testEmail,
            password: testPassword,
            role: "student"
        });
        console.log("  Registration successful");
        console.log("Cookies:", regResponse.headers['set-cookie']);

        console.log("\n2. Logging in...");
        const loginResponse = await api.post("/api/auth/login", {
            email: testEmail,
            password: testPassword
        });
        console.log("  Login successful");
        console.log("User Data:", loginResponse.data.data.user);

        console.log("\n3. Testing /me endpoint...");
        // Use the token from login if returned, or cookies
        const token = loginResponse.data.data.accessToken;
        const meResponse = await api.get("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("  /me successful");
        console.log("Me Data:", meResponse.data.data.name);

    } catch (error) {
        console.error("❌ Test failed:", error.response?.data || error.message);
    }
}

testRegistration();
