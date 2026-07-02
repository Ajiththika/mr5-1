import ShopItem from "../models/ShopItem.js";
import ShopOrder from "../models/ShopOrder.js";
import User from "../models/User.js";
import UserInventory from "../models/UserInventory.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getStripe } from "../utils/stripeService.js";
import envConfig from "../config/env.js";
import { getTeacherSystemPrompt } from "../data/teacherSystemPrompts.js";

const DEFAULT_TEACHER_SLUG = "teacher_default";

async function grantTeacherOwnership(userId, item) {
	const existing = await UserInventory.findOne({ user: userId, item: item._id });
	if (!existing) {
		await UserInventory.create({ user: userId, item: item._id });
	}

	await User.findByIdAndUpdate(userId, {
		$addToSet: { purchasedTeacherAvatars: item.teacherSlug },
	});
}

async function userOwnsTeacherSlug(userId, teacherSlug) {
	const item = await ShopItem.findOne({
		teacherSlug,
		type: "teacher_avatar",
		isActive: true,
	}).select("priceCents isPremium");
	if (item && !item.isPremium && item.priceCents <= 0) return true;

	if (teacherSlug === DEFAULT_TEACHER_SLUG) return true;
	const user = await User.findById(userId).select("purchasedTeacherAvatars");
	if (user?.purchasedTeacherAvatars?.includes(teacherSlug)) return true;

	const owned = await UserInventory.find({ user: userId }).populate("item");
	return owned.some(
		(entry) =>
			entry.item?.type === "teacher_avatar" &&
			entry.item?.teacherSlug === teacherSlug,
	);
}

export const getTeacherAvatars = asyncHandler(async (req, res) => {
	const items = await ShopItem.find({
		isActive: true,
		type: "teacher_avatar",
	}).sort({ priceCents: 1 });

	res.status(200).json({
		success: true,
		data: items.map((item) => ({
			...item.toObject(),
			systemPrompt: getTeacherSystemPrompt(item.teacherSlug),
		})),
	});
});

export const getOwnedTeachers = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const inventory = await UserInventory.find({ user: userId }).populate("item");
	const slugs = new Set([DEFAULT_TEACHER_SLUG]);

	const freeTeachers = await ShopItem.find({
		type: "teacher_avatar",
		isActive: true,
		isPremium: false,
		priceCents: { $lte: 0 },
	}).select("teacherSlug");
	for (const entry of freeTeachers) {
		if (entry.teacherSlug) slugs.add(entry.teacherSlug);
	}

	for (const entry of inventory) {
		if (entry.item?.type === "teacher_avatar" && entry.item.teacherSlug) {
			slugs.add(entry.item.teacherSlug);
		}
	}

	const user = await User.findById(userId).select(
		"purchasedTeacherAvatars activeTeacherAvatar",
	);
	for (const slug of user?.purchasedTeacherAvatars ?? []) {
		slugs.add(slug);
	}

	res.status(200).json({
		success: true,
		data: {
			owned: Array.from(slugs),
			activeTeacherAvatar: user?.activeTeacherAvatar ?? DEFAULT_TEACHER_SLUG,
		},
	});
});

export const setActiveTeacher = asyncHandler(async (req, res) => {
	const { teacherSlug } = req.body;
	if (!teacherSlug) {
		return res.status(400).json({ success: false, error: "teacherSlug is required" });
	}

	const item = await ShopItem.findOne({
		teacherSlug,
		type: "teacher_avatar",
		isActive: true,
	});
	if (!item) {
		return res.status(404).json({ success: false, error: "Teacher avatar not found" });
	}

	const owns = await userOwnsTeacherSlug(req.user.id, teacherSlug);
	if (!owns) {
		return res.status(403).json({ success: false, error: "Teacher avatar not purchased" });
	}

	const user = await User.findByIdAndUpdate(
		req.user.id,
		{ activeTeacherAvatar: teacherSlug },
		{ new: true },
	).select("activeTeacherAvatar purchasedTeacherAvatars");

	res.status(200).json({ success: true, data: user });
});

export const createTeacherCheckout = asyncHandler(async (req, res) => {
	const { teacherSlug } = req.body;
	if (!teacherSlug) {
		return res.status(400).json({ success: false, error: "teacherSlug is required" });
	}

	const item = await ShopItem.findOne({
		teacherSlug,
		type: "teacher_avatar",
		isActive: true,
	});
	if (!item) {
		return res.status(404).json({ success: false, error: "Teacher avatar not found" });
	}
	if (!item.isPremium || item.priceCents <= 0) {
		return res.status(400).json({ success: false, error: "This teacher is free" });
	}

	if (await userOwnsTeacherSlug(req.user.id, teacherSlug)) {
		return res.status(400).json({ success: false, error: "Teacher already owned" });
	}

	const stripe = await getStripe();
	const amount = item.priceCents / 100;

	if (!stripe) {
		const order = await ShopOrder.create({
			user: req.user.id,
			shopItem: item._id,
			amount,
			method: "Demo/Mock",
			status: "completed",
			transactionId: `demo_teacher_${Date.now()}`,
			paymentDate: new Date(),
		});
		await grantTeacherOwnership(req.user.id, item);

		return res.json({
			success: true,
			sessionId: order.transactionId,
			url: `${envConfig.CLIENT_URL}/avatar-shop?purchase=success&teacher=${teacherSlug}`,
			isDemo: true,
		});
	}

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: item.name,
						description: item.description || "Premium teacher avatar",
					},
					unit_amount: item.priceCents,
				},
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${envConfig.CLIENT_URL}/avatar-shop?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${envConfig.CLIENT_URL}/avatar-shop?purchase=cancelled`,
		metadata: {
			userId: req.user.id.toString(),
			shopItemId: item._id.toString(),
			teacherSlug,
			purchaseType: "teacher_avatar",
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

	res.json({
		success: true,
		sessionId: session.id,
		url: session.url,
	});
});

export const verifyTeacherPurchase = asyncHandler(async (req, res) => {
	const { sessionId } = req.params;
	const userId = req.user.id;
	const stripe = await getStripe();

	let order = await ShopOrder.findOne({ transactionId: sessionId, user: userId }).populate(
		"shopItem",
	);

	if (!stripe || sessionId.startsWith("demo_teacher_")) {
		if (!order) {
			order = await ShopOrder.findOne({
				user: userId,
				status: "completed",
			})
				.sort("-createdAt")
				.populate("shopItem");
		}
		if (!order?.shopItem) {
			return res.status(404).json({ success: false, error: "Purchase not found" });
		}
		await grantTeacherOwnership(userId, order.shopItem);
		return res.json({ success: true, data: { teacherSlug: order.shopItem.teacherSlug } });
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

	await grantTeacherOwnership(userId, order.shopItem);

	res.json({
		success: true,
		data: { teacherSlug: order.shopItem.teacherSlug },
	});
});
