import ShopItem from "../models/ShopItem.js";
import UserInventory from "../models/UserInventory.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getShopItems = asyncHandler(async (req, res) => {
	const items = await ShopItem.find({ isActive: true }).sort("priceCents");
	res.status(200).json({ success: true, data: items });
});

export const getMyInventory = asyncHandler(async (req, res) => {
	const inventory = await UserInventory.find({ user: req.user.id }).populate(
		"item",
	);
	res.status(200).json({ success: true, data: inventory });
});

export const purchaseItem = asyncHandler(async (req, res) => {
	const { itemId } = req.body;
	const item = await ShopItem.findById(itemId);

	if (!item || !item.isActive) {
		return res.status(404).json({ success: false, error: "Item not found" });
	}

	const existing = await UserInventory.findOne({
		user: req.user.id,
		item: itemId,
	});

	if (existing) {
		return res.status(400).json({ success: false, error: "Item already owned" });
	}

	// Demo purchase — integrate Stripe one-time checkout in production
	const inventory = await UserInventory.create({
		user: req.user.id,
		item: itemId,
	});

	const populated = await UserInventory.findById(inventory._id).populate("item");

	res.status(201).json({
		success: true,
		data: populated,
		message: "Item purchased successfully",
	});
});

export const equipItem = asyncHandler(async (req, res) => {
	const { inventoryId } = req.params;
	const entry = await UserInventory.findOne({
		_id: inventoryId,
		user: req.user.id,
	}).populate("item");

	if (!entry) {
		return res.status(404).json({ success: false, error: "Inventory item not found" });
	}

	await UserInventory.updateMany(
		{ user: req.user.id, equipped: true },
		{ equipped: false },
	);

	entry.equipped = true;
	await entry.save();

	res.status(200).json({ success: true, data: entry });
});
