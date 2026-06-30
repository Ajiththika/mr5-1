import mongoose from "mongoose";

const loginAttemptSchema = new mongoose.Schema(
	{
		identifierHash: { type: String, required: true, index: true },
		failureCount: { type: Number, default: 0 },
		lastFailureAt: { type: Date, default: null },
		lockedUntil: { type: Date, default: null },
	},
	{ timestamps: true },
);

loginAttemptSchema.index({ identifierHash: 1 }, { unique: true });

export default mongoose.model("LoginAttempt", loginAttemptSchema);
