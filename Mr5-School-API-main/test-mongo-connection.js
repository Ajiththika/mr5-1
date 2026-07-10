import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing MongoDB connection using MONGO_URI from env...");
const uri = process.env.MONGO_URI;
console.log("URI:", uri ? uri.replace(/:([^@]+)@/, ":****@") : "undefined");

if (!uri) {
  console.error("MONGO_URI is not defined");
  process.exit(1);
}

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("✅ Success! MongoDB is connected.");
  process.exit(0);
})
.catch((err) => {
  console.error("❌ Connection failed:", err);
  process.exit(1);
});
