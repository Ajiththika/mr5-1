import ShopItem from "../src/models/ShopItem.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const DEFAULT_ITEMS = [
	{ name: "Classic Cap", description: "Campus starter hat", type: "hat", priceCents: 299, imageUrl: "" },
	{ name: "School Hoodie", description: "Mr5 branded hoodie", type: "shirt", priceCents: 499, imageUrl: "" },
	{ name: "Cool Shades", description: "Stylish sunglasses", type: "accessory", priceCents: 199, imageUrl: "" },
	{ name: "Textbook Bundle", description: "Virtual study books", type: "book", priceCents: 149, imageUrl: "" },
];

async function seed() {
	await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mr5");
	const count = await ShopItem.countDocuments();
	if (count === 0) {
		await ShopItem.insertMany(DEFAULT_ITEMS);
		console.log(`Seeded ${DEFAULT_ITEMS.length} shop items`);
	} else {
		console.log(`Shop already has ${count} items, skipping seed`);
	}
	await mongoose.disconnect();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
