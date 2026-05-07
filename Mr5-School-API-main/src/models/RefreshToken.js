import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        createdByIp: {
            type: String,
        },
        revokedAt: {
            type: Date,
        },
        revokedByIp: {
            type: String,
        },
        replacedByToken: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    { timestamps: true }
);

// Virtual for checking if token is expired
refreshTokenSchema.virtual("isExpired").get(function () {
    return Date.now() >= this.expiresAt;
});

// Virtual for checking if token is active
refreshTokenSchema.virtual("isActive").get(function () {
    return !this.revokedAt && !this.isExpired;
});

// Index for faster lookups and automatic cleanup
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
