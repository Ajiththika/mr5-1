import ShopItem from "../models/ShopItem.js";
import ShopOrder from "../models/ShopOrder.js";
import User from "../models/User.js";
import UserInventory from "../models/UserInventory.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getStripe } from "../utils/stripeService.js";
import envConfig from "../config/env.js";
import { getTeacherSystemPrompt } from "../data/teacherSystemPrompts.js";

const DEFAULT_TEACHER = "teacher_default";

function itemSlugOf(item) {
	return item.teacherSlug || item.itemSlug || "";
}

async function userOwnsSlug(userId, slug) {
	if (!slug) return false;
	if (slug === DEFAULT_TEACHER) return true;

	const catalogItem = await ShopItem.findOne({
		$or: [{ teacherSlug: slug }, { itemSlug: slug }],
		isActive: true,
	}).select("type priceCents isPremium teacherSlug itemSlug");
	if (
		catalogItem?.type === "teacher_avatar" &&
		!catalogItem.isPremium &&
		catalogItem.priceCents <= 0
	) {
		return true;
	}
	if (
		catalogItem?.type === "classroom_item" &&
		!catalogItem.isPremium &&
		catalogItem.priceCents <= 0
	) {
		return true;
	}
	if (
		catalogItem?.type === "transport" &&
		!catalogItem.isPremium &&
		catalogItem.priceCents <= 0
	) {
		return true;
	}

	const user = await User.findById(userId).select(
		"purchasedTeacherAvatars ownedClassroomItems ownedAudioPacks ownedExercisePacks ownedTransportItems",
	);
	if (!user) return false;

	const allOwned = [
		...(user.purchasedTeacherAvatars ?? []),
		...(user.ownedClassroomItems ?? []),
		...(user.ownedAudioPacks ?? []),
		...(user.ownedExercisePacks ?? []),
		...(user.ownedTransportItems ?? []),
	];
	if (allOwned.includes(slug)) return true;

	const inventory = await UserInventory.find({ user: userId }).populate("item");
	return inventory.some((entry) => itemSlugOf(entry.item) === slug);
}

async function grantOwnership(userId, item) {
	const slug = itemSlugOf(item);
	if (!slug) return;

	const existing = await UserInventory.findOne({ user: userId, item: item._id });
	if (!existing) {
		await UserInventory.create({ user: userId, item: item._id });
	}

	const update = {};
	if (item.type === "teacher_avatar") {
		update.$addToSet = { purchasedTeacherAvatars: slug };
	} else if (item.type === "classroom_item") {
		update.$addToSet = { ownedClassroomItems: slug };
	} else if (item.type === "audio_pack") {
		update.$addToSet = { ownedAudioPacks: slug };
	} else if (item.type === "activity_pack") {
		update.$addToSet = { ownedExercisePacks: slug };
	} else if (item.type === "transport") {
		update.$addToSet = { ownedTransportItems: slug };
	}
	if (update.$addToSet) {
		await User.findByIdAndUpdate(userId, update);
	}
}

function groupInventoryItems(items, inventory, user) {
	const ownedSlugs = new Set([DEFAULT_TEACHER]);
	for (const entry of inventory) {
		const slug = itemSlugOf(entry.item);
		if (slug) ownedSlugs.add(slug);
	}
	for (const slug of user.purchasedTeacherAvatars ?? []) ownedSlugs.add(slug);
	for (const slug of user.ownedClassroomItems ?? []) ownedSlugs.add(slug);
	for (const slug of user.ownedAudioPacks ?? []) ownedSlugs.add(slug);
	for (const slug of user.ownedExercisePacks ?? []) ownedSlugs.add(slug);
	for (const slug of user.ownedTransportItems ?? []) ownedSlugs.add(slug);

	const mapItem = (item) => {
		const base = {
			...item.toObject(),
			slug: itemSlugOf(item),
			owned: ownedSlugs.has(itemSlugOf(item)),
			equipped: isEquipped(item, user),
		};
		if (item.type === "teacher_avatar") {
			base.systemPrompt = getTeacherSystemPrompt(itemSlugOf(item));
		}
		return base;
	};

	return {
		teachers: items.filter((i) => i.type === "teacher_avatar").map(mapItem),
		items: items.filter((i) => i.type === "classroom_item").map(mapItem),
		audio: items.filter((i) => i.type === "audio_pack").map(mapItem),
		activities: items.filter((i) => i.type === "activity_pack").map(mapItem),
		transport: items.filter((i) => i.type === "transport").map(mapItem),
		equipped: {
			teacher: user.activeTeacherAvatar ?? DEFAULT_TEACHER,
			clock: user.equippedClock ?? "",
			deskFan: user.equippedDeskFan ?? "",
			bell: user.equippedBell ?? "",
			backgroundMusic: user.equippedBackgroundMusic ?? "",
			transport: user.equippedTransport ?? "",
			activityPack: user.equippedActivityPack ?? "",
			classroomPack: user.equippedClassroomPack ?? "",
		},
		welcomeMessage: user.welcomeMessage ?? "Welcome to MR5 School.",
	};
}

function isEquipped(item, user) {
	const slug = itemSlugOf(item);
	if (item.type === "teacher_avatar") return user.activeTeacherAvatar === slug;
	if (item.type === "classroom_item" && item.metadata?.assetKind === "clock") {
		return user.equippedClock === slug;
	}
	if (item.type === "classroom_item" && item.metadata?.assetKind === "desk_fan") {
		return user.equippedDeskFan === slug;
	}
	if (item.type === "classroom_item" && item.metadata?.assetKind === "classroom_pack") {
		return user.equippedClassroomPack === slug;
	}
	if (item.type === "classroom_item") return false;
	if (item.type === "audio_pack" && item.metadata?.audioKind === "bell") {
		return user.equippedBell === slug;
	}
	if (item.type === "audio_pack" && item.metadata?.audioKind === "music") {
		return user.equippedBackgroundMusic === slug;
	}
	if (item.type === "transport") return user.equippedTransport === slug;
	if (item.type === "activity_pack") return user.equippedActivityPack === slug;
	return false;
}

export const getOwnStoreCatalog = asyncHandler(async (req, res) => {
	const { category } = req.query;
	const query = { isActive: true };
	if (category && category !== "inventory") {
		if (category === "teachers") query.type = "teacher_avatar";
		else if (category === "classroom") query.type = "classroom_item";
		else if (category === "audio") query.type = "audio_pack";
		else if (category === "activities") query.type = "activity_pack";
		else if (category === "transport") query.type = "transport";
		else query.category = category;
	}

	const items = await ShopItem.find(query).sort({ priceCents: 1 });
	const comingSoon = await ShopItem.find({ comingSoon: true }).sort({ name: 1 });

	res.status(200).json({
		success: true,
		data: items,
		comingSoon,
	});
});

export const getUserInventory = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const [user, inventory, items] = await Promise.all([
		User.findById(userId),
		UserInventory.find({ user: userId }).populate("item"),
		ShopItem.find({
			$or: [
				{ type: { $in: ["teacher_avatar", "classroom_item", "audio_pack", "activity_pack", "transport"] } },
				{ isActive: true },
			],
		}),
	]);

	if (!user) {
		return res.status(404).json({ success: false, error: "User not found" });
	}

	res.status(200).json({
		success: true,
		data: groupInventoryItems(items, inventory, user),
	});
});

export const equipOwnStoreItem = asyncHandler(async (req, res) => {
	const { itemSlug, unequip } = req.body;
	const userId = req.user.id;

	if (!itemSlug && !unequip) {
		return res.status(400).json({ success: false, error: "itemSlug is required" });
	}

	const item = itemSlug
		? await ShopItem.findOne({
				$or: [{ itemSlug }, { teacherSlug: itemSlug }],
				isActive: true,
			})
		: null;

	if (itemSlug && !item) {
		return res.status(404).json({ success: false, error: "Item not found" });
	}

	if (itemSlug && !unequip) {
		const owns = await userOwnsSlug(userId, itemSlug);
		if (!owns) {
			return res.status(403).json({ success: false, error: "Item not owned" });
		}
	}

	const update = {};
	if (unequip && item) {
		if (item.type === "teacher_avatar") update.activeTeacherAvatar = DEFAULT_TEACHER;
		else if (item.type === "classroom_item" && item.metadata?.assetKind === "clock") {
			update.equippedClock = "";
		} else if (item.type === "classroom_item" && item.metadata?.assetKind === "desk_fan") {
			update.equippedDeskFan = "";
		} else if (item.type === "classroom_item" && item.metadata?.assetKind === "classroom_pack") {
			update.equippedClassroomPack = "";
		} else if (item.type === "audio_pack" && item.metadata?.audioKind === "bell") {
			update.equippedBell = "";
		} else if (item.type === "audio_pack" && item.metadata?.audioKind === "music") {
			update.equippedBackgroundMusic = "";
		} else if (item.type === "transport") update.equippedTransport = "";
		else if (item.type === "activity_pack") update.equippedActivityPack = "";
	} else if (item) {
		if (item.type === "teacher_avatar") update.activeTeacherAvatar = itemSlug;
		else if (item.type === "classroom_item" && item.metadata?.assetKind === "clock") {
			update.equippedClock = itemSlug;
		} else if (item.type === "classroom_item" && item.metadata?.assetKind === "desk_fan") {
			update.equippedDeskFan = itemSlug;
		} else if (item.type === "classroom_item" && item.metadata?.assetKind === "classroom_pack") {
			update.equippedClassroomPack = itemSlug;
		} else if (item.type === "audio_pack" && item.metadata?.audioKind === "bell") {
			update.equippedBell = itemSlug;
		} else if (item.type === "audio_pack" && item.metadata?.audioKind === "music") {
			update.equippedBackgroundMusic = itemSlug;
		} else if (item.type === "transport") update.equippedTransport = itemSlug;
		else if (item.type === "activity_pack") update.equippedActivityPack = itemSlug;
	}

	const user = await User.findByIdAndUpdate(userId, update, { new: true }).select(
		"activeTeacherAvatar equippedClock equippedDeskFan equippedBell equippedBackgroundMusic equippedTransport equippedActivityPack equippedClassroomPack welcomeMessage purchasedTeacherAvatars ownedClassroomItems ownedAudioPacks ownedExercisePacks ownedTransportItems",
	);

	res.status(200).json({ success: true, data: user });
});

export const updateClassroomSettings = asyncHandler(async (req, res) => {
	const { welcomeMessage } = req.body;
	const update = {};
	if (welcomeMessage !== undefined) {
		const trimmed = String(welcomeMessage).trim().slice(0, 80);
		update.welcomeMessage = trimmed || "Welcome to MR5 School.";
	}

	const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select(
		"welcomeMessage activeTeacherAvatar equippedClock equippedDeskFan equippedBell equippedBackgroundMusic equippedTransport equippedActivityPack equippedClassroomPack",
	);

	res.status(200).json({ success: true, data: user });
});

export const createOwnStoreCheckout = asyncHandler(async (req, res) => {
	const { itemSlug } = req.body;
	if (!itemSlug) {
		return res.status(400).json({ success: false, error: "itemSlug is required" });
	}

	const item = await ShopItem.findOne({
		$or: [{ itemSlug }, { teacherSlug: itemSlug }],
		isActive: true,
		comingSoon: { $ne: true },
	});

	if (!item) {
		return res.status(404).json({ success: false, error: "Item not found" });
	}
	if (!item.isPremium || item.priceCents <= 0) {
		return res.status(400).json({ success: false, error: "Item is free or not purchasable" });
	}
	if (await userOwnsSlug(req.user.id, itemSlug)) {
		return res.status(400).json({ success: false, error: "Already owned" });
	}

	const stripe = await getStripe();
	const amount = item.priceCents / 100;
	const slug = itemSlugOf(item);

	if (!stripe) {
		await ShopOrder.create({
			user: req.user.id,
			shopItem: item._id,
			amount,
			method: "Demo/Mock",
			status: "completed",
			transactionId: `demo_store_${Date.now()}`,
			paymentDate: new Date(),
		});
		await grantOwnership(req.user.id, item);

		return res.json({
			success: true,
			sessionId: `demo_store_${Date.now()}`,
			url: `${envConfig.CLIENT_URL}/avatar-shop?purchase=success&item=${slug}&tab=inventory`,
			isDemo: true,
		});
	}

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: { name: item.name, description: item.description || "MR5 Own Store" },
					unit_amount: item.priceCents,
				},
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${envConfig.CLIENT_URL}/avatar-shop?purchase=success&session_id={CHECKOUT_SESSION_ID}&tab=inventory`,
		cancel_url: `${envConfig.CLIENT_URL}/avatar-shop?purchase=cancelled`,
		metadata: {
			userId: req.user.id.toString(),
			shopItemId: item._id.toString(),
			itemSlug: slug,
			purchaseType: "own_store",
		},
		customer_email: req.user.email,
	});

	await ShopOrder.create({
		user: req.user.id,
		shopItem: item._id,
		amount,
		method: "Stripe",
		status: "pending",
		transactionId: session.id,
	});

	res.json({ success: true, sessionId: session.id, url: session.url });
});

export const verifyOwnStorePurchase = asyncHandler(async (req, res) => {
	const { sessionId } = req.params;
	const userId = req.user.id;
	const stripe = await getStripe();

	let order = await ShopOrder.findOne({ transactionId: sessionId, user: userId }).populate(
		"shopItem",
	);

	if (!stripe || sessionId.startsWith("demo_store_")) {
		if (!order) {
			order = await ShopOrder.findOne({ user: userId, status: "completed" })
				.sort("-createdAt")
				.populate("shopItem");
		}
		if (!order?.shopItem) {
			return res.status(404).json({ success: false, error: "Purchase not found" });
		}
		await grantOwnership(userId, order.shopItem);
		return res.json({ success: true, data: { itemSlug: itemSlugOf(order.shopItem) } });
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId);
	if (session.payment_status !== "paid") {
		return res.status(400).json({ success: false, error: "Payment not completed" });
	}

	order = await ShopOrder.findOne({ transactionId: sessionId, user: userId }).populate(
		"shopItem",
	);
	if (!order) {
		return res.status(404).json({ success: false, error: "Order not found" });
	}

	if (order.status === "pending") {
		order.status = "completed";
		order.paymentDate = new Date();
		await order.save();
	}

	await grantOwnership(userId, order.shopItem);
	res.json({ success: true, data: { itemSlug: itemSlugOf(order.shopItem) } });
});

export { grantOwnership, userOwnsSlug, itemSlugOf };
