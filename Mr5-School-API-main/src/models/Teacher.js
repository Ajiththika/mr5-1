import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		displayName: { type: String, trim: true },
		specialization: {
			type: String,
			required: true,
		},
		subjectExpertise: [{ type: String }],
		languageStyle: {
			type: String,
			enum: ["formal", "friendly", "bilingual", "simple"],
			default: "friendly",
		},
		teachingTone: {
			type: String,
			enum: ["encouraging", "strict", "humorous", "calm", "expert"],
			default: "encouraging",
		},
		experienceLevel: {
			type: String,
			enum: ["beginner", "intermediate", "expert", "master"],
			default: "intermediate",
		},
		bio: {
			type: String,
			default: "",
		},
		isAvatarAI: {
			type: Boolean,
			default: false,
		},
		status: {
			type: String,
			enum: ["active", "inactive", "archived"],
			default: "active",
		},
		approvedAt: {
			type: Date,
		},
		approvedBy: {
			type: String,
		},
		courses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
		],
		classrooms: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Classroom",
			},
		],
		rating: {
			type: Number,
			default: 0,
		},
		totalStudents: {
			type: Number,
			default: 0,
		},
		tags: [{ type: String }],
		notes: { type: String, default: "" },
		// 3D Teacher Studio
		studio: {
			avatarType: {
				type: String,
				enum: ["cadet", "professor", "mentor", "custom"],
				default: "cadet",
			},
			model3dRef: { type: String, default: "" },
			voiceProfile: {
				type: String,
				enum: ["warm", "clear", "energetic", "calm"],
				default: "warm",
			},
			speakingSpeed: { type: Number, min: 0.5, max: 2, default: 1 },
			friendliness: { type: Number, min: 0, max: 100, default: 75 },
			expertMode: { type: Boolean, default: false },
			emotionPreset: {
				type: String,
				enum: ["neutral", "happy", "focused", "empathetic"],
				default: "focused",
			},
			backgroundScene: { type: String, default: "classroom-default" },
			classroomBehavior: {
				type: String,
				enum: ["lecture", "interactive", "coach", "facilitator"],
				default: "interactive",
			},
			templateName: { type: String },
		},
	},
	{
		timestamps: true,
	},
);

teacherSchema.index({ status: 1 });
teacherSchema.index({ specialization: "text", displayName: "text" });

export default mongoose.model("Teacher", teacherSchema);
