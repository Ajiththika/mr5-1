import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true, // Allow users without googleId (e.g. email/password users)
		},
		coursesEnrolled: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course'
		}],
		email: {
			type: String,
			unique: true,
			required: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
			select: false,
		},
		role: {
			type: String,
			enum: ["student", "AI-TEACHER", "admin"],
			default: "student",
		},
		adminRole: {
			type: String,
			enum: [
				"super_admin",
				"power_leader",
				"content_admin",
				"teacher_manager",
				"course_creator",
				"reviewer",
				"analytics_viewer",
			],
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "approved", // Students auto-approved by default, AI-TEACHERs pending
		},
		profileImage: String,
		avatarUrl: {
			type: String,
			default: "",
		},
		avatarPreset: {
			type: String,
			default: "",
		},
		onboardingCompleted: {
			type: Boolean,
			default: false,
		},
		welcomeChatCompleted: {
			type: Boolean,
			default: false,
		},
		age: {
			type: Number,
			min: 5,
			max: 120,
		},
		educationLevel: {
			type: String,
			enum: [
				"High School",
				"Higher Secondary",
				"Diploma",
				"Bachelor's Degree",
				"Master's Degree",
				"Doctorate",
				"Professional Certification",
				"Other",
			],
		},
		// References to profile tables
		studentProfile: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "StudentProfile",
		},
		teacherProfile: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Teacher",
		},
		language: {
			type: String,
			default: "English",
		},
		timezone: {
			type: String,
			default: "UTC",
		},
		gradingSystem: {
			type: String,
			default: "Standard (A-F)",
		},
		regionalPreferences: {
			schoolHours: String,
			academicCalendar: String,
			holidays: String,
			additionalInfo: String
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		trialUsed: {
			type: Boolean,
			default: false,
		},
		trialStartedAt: Date,
		trialExpiresAt: Date,
	},
	{ timestamps: true },
);

// Add indexes for common query fields
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Password hash middleware
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

export default mongoose.model("User", userSchema);