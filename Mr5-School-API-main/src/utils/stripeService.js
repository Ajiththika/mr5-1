import envConfig from "../config/env.js";

let stripeInstance = null;

export async function getStripe() {
	if (stripeInstance) return stripeInstance;

	if (!envConfig.STRIPE_SECRET_KEY) {
		console.warn("STRIPE_SECRET_KEY not set. Stripe features will be disabled.");
		return null;
	}

	try {
		const StripeModule = await import("stripe");
		const Stripe = StripeModule.default || StripeModule;
		stripeInstance = new Stripe(envConfig.STRIPE_SECRET_KEY, {
			apiVersion: "2024-12-18.acacia",
		});
		return stripeInstance;
	} catch (error) {
		console.warn("Stripe initialization failed:", error?.message || error);
		return null;
	}
}

export default null;

