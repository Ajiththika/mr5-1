import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { paginate } from "../utils/pagination.js";
import { getStripe } from "../utils/stripeService.js";
import envConfig from "../config/env.js";

// @desc    Get all payments with pagination
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = asyncHandler(async (req, res) => {
	const { page, limit, user, course, status, method, search } = req.query;

	// Build query
	const query = {};
	if (user) query.user = user;
	if (course) query.course = course;
	if (status) query.status = status;
	if (method) query.method = method;
	if (search) {
		query.$or = [{ transactionId: { $regex: search, $options: "i" } }];
	}

	const result = await paginate(Payment, query, {
		page,
		limit,
		sort: "-createdAt",
		populate: [
			{
				path: "user",
				select: "name email profileImage",
			},
			{
				path: "course",
				select: "title description thumbnail price",
				populate: {
					path: "teacher",
					select: "name email",
				},
			},
		],
	});

	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res) => {
	const payment = await Payment.findById(req.params.id)
		.populate("user", "name email profileImage")
		.populate({
			path: "course",
			select: "title description thumbnail price teacher",
			populate: {
				path: "teacher",
				select: "name email",
			},
		});

	if (!payment) {
		return res.status(404).json({
			success: false,
			error: "Payment not found",
		});
	}

	res.json({
		success: true,
		data: payment,
	});
});

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
	const newpayment = new Payment(req.body);
	const savedpayment = await newpayment.save();

	const populatedPayment = await Payment.findById(savedpayment._id)
		.populate("user", "name email profileImage")
		.populate({
			path: "course",
			select: "title description thumbnail price",
			populate: {
				path: "teacher",
				select: "name email",
			},
		});

	res.status(201).json({
		success: true,
		data: populatedPayment,
	});
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private/Admin
const updatePayment = asyncHandler(async (req, res) => {
	const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	})
		.populate("user", "name email profileImage")
		.populate({
			path: "course",
			select: "title description thumbnail price",
			populate: {
				path: "teacher",
				select: "name email",
			},
		});

	if (!payment) {
		return res.status(404).json({
			success: false,
			error: "Payment not found",
		});
	}

	res.json({
		success: true,
		data: payment,
	});
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private/Admin
const deletePayment = asyncHandler(async (req, res) => {
	const payment = await Payment.findByIdAndDelete(req.params.id);

	if (!payment) {
		return res.status(404).json({
			success: false,
			error: "Payment not found",
		});
	}

	res.json({
		success: true,
		message: "Payment deleted successfully",
	});
});

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = asyncHandler(async (req, res) => {
	const { courseId } = req.body;
	const userId = req.user._id;

	if (!courseId) {
		return res.status(400).json({
			success: false,
			error: "Course ID is required",
		});
	}

	// Get course details
	const course = await Course.findById(courseId);
	if (!course) {
		return res.status(404).json({
			success: false,
			error: "Course not found",
		});
	}

	// Check if already enrolled
	const existingEnrollment = await Enrollment.findOne({
		student: userId,
		course: courseId,
	});

	if (existingEnrollment) {
		return res.status(400).json({
			success: false,
			error: "You are already enrolled in this course",
		});
	}

	// Create Stripe checkout session
	// Initialize Stripe
	const stripe = await getStripe();

	if (!stripe) {
		console.log("⚠️ Stripe not configured. Using Demo/Mock Enrollment Flow.");

		// Create a completed payment record automatically
		const payment = new Payment({
			user: userId,
			course: courseId,
			amount: course.price,
			method: "Demo/Mock",
			status: "completed",
			transactionId: `mock_${Date.now()}`,
			paymentDate: new Date()
		});
		await payment.save();

		// Create enrollment automatically
		const enrollment = new Enrollment({
			student: userId,
			course: courseId,
			status: "active",
		});
		await enrollment.save();

		return res.json({
			success: true,
			sessionId: "mock_session",
			url: `${envConfig.CLIENT_URL}/payment/success?session_id=mock_session`,
			isDemo: true
		});
	}

	// Create Stripe checkout session
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: course.title,
						description: course.description || "Course enrollment",
					},
					unit_amount: Math.round(course.price * 100), // Convert to cents
				},
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${envConfig.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${envConfig.CLIENT_URL}/courses`,
		metadata: {
			userId: userId.toString(),
			courseId: courseId.toString(),
		},
		customer_email: req.user.email,
	});

	// Create pending payment record
	const payment = new Payment({
		user: userId,
		course: courseId,
		amount: course.price,
		method: "Stripe",
		status: "pending",
		transactionId: session.id,
	});

	await payment.save();

	res.json({
		success: true,
		sessionId: session.id,
		url: session.url,
	});
});

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
const handleStripeWebhook = asyncHandler(async (req, res) => {
	const sig = req.headers["stripe-signature"];
	let event;

	try {
		const stripe = await getStripe();
		if (!stripe) {
			return res.status(503).json({ success: false, error: "Stripe is not configured" });
		}

		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			envConfig.STRIPE_WEBHOOK_SECRET,
		);
	} catch (err) {
		console.error("Webhook signature verification failed:", err.message);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	// Handle the event
	if (event.type === "checkout.session.completed") {
		const session = event.data.object;

		// Find the payment record
		const payment = await Payment.findOne({
			transactionId: session.id,
		});

		if (payment && payment.status === "pending") {
			// Update payment status
			payment.status = "completed";
			payment.paymentDate = new Date();
			await payment.save();

			// Create enrollment
			try {
				const enrollment = new Enrollment({
					student: payment.user,
					course: payment.course,
					status: "active",
				});
				await enrollment.save();
			} catch (enrollmentError) {
				// Enrollment might already exist, which is fine
				console.error("Enrollment creation error:", enrollmentError);
			}
		}
	} else if (event.type === "checkout.session.async_payment_failed") {
		const session = event.data.object;

		// Update payment status to failed
		const payment = await Payment.findOne({
			transactionId: session.id,
		});

		if (payment) {
			payment.status = "failed";
			await payment.save();
		}
	}

	res.json({ received: true });
});

// @desc    Verify payment and create enrollment
// @route   GET /api/payments/verify/:sessionId
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
	const { sessionId } = req.params;
	const userId = req.user._id;

	// Retrieve the session from Stripe
	const stripe = await getStripe();

	if (!stripe || sessionId === "mock_session") {
		// For mock/demo, just find the latest completed payment for this user
		const payment = await Payment.findOne({
			user: userId,
			status: "completed"
		}).sort("-createdAt");

		if (!payment) {
			return res.status(404).json({ success: false, error: "Mock payment record not found" });
		}

		// Ensure enrollment exists
		let enrollment = await Enrollment.findOne({
			student: userId,
			course: payment.course
		});

		if (!enrollment) {
			enrollment = new Enrollment({
				student: userId,
				course: payment.course,
				status: "active"
			});
			await enrollment.save();
		}

		const populatedEnrollment = await Enrollment.findById(enrollment._id)
			.populate("student", "name email profileImage")
			.populate({
				path: "course",
				select: "title description thumbnail price level teacher",
				populate: { path: "teacher", select: "name email" },
			});

		return res.json({
			success: true,
			data: {
				payment,
				enrollment: populatedEnrollment,
			},
		});
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId);

	if (session.payment_status !== "paid") {
		return res.status(400).json({
			success: false,
			error: "Payment not completed",
		});
	}

	// Find payment record
	const payment = await Payment.findOne({
		transactionId: sessionId,
		user: userId,
	});

	if (!payment) {
		return res.status(404).json({
			success: false,
			error: "Payment not found",
		});
	}

	// Update payment if still pending
	if (payment.status === "pending") {
		payment.status = "completed";
		payment.paymentDate = new Date();
		await payment.save();
	}

	// Check if enrollment exists, create if not
	let enrollment = await Enrollment.findOne({
		student: userId,
		course: payment.course,
	});

	if (!enrollment) {
		enrollment = new Enrollment({
			student: userId,
			course: payment.course,
			status: "active",
		});
		await enrollment.save();
	}

	const populatedEnrollment = await Enrollment.findById(enrollment._id)
		.populate("student", "name email profileImage")
		.populate({
			path: "course",
			select: "title description thumbnail price level teacher",
			populate: { path: "teacher", select: "name email" },
		});

	res.json({
		success: true,
		data: {
			payment,
			enrollment: populatedEnrollment,
		},
	});
});

export {
	getAllPayments,
	getPaymentById,
	createPayment,
	updatePayment,
	deletePayment,
	createCheckoutSession,
	handleStripeWebhook,
	verifyPayment,
};
