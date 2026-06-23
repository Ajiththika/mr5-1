import mongoose from "mongoose";

const PANELS = [
	"chat",
	"notes",
	"quiz",
	"timer",
	"timeline",
	"resources",
];

const MODES = [
	"normal",
	"demo",
	"discussion",
	"quiz",
	"exam",
	"revision",
	"live_interaction",
];

const classroomSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		slug: { type: String, trim: true },
		description: { type: String, default: "" },
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
		teacher: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Teacher",
		},
		teacherUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		theme: {
			type: String,
			enum: ["classic", "modern", "nature", "space", "minimal"],
			default: "modern",
		},
		background: { type: String, default: "default-classroom" },
		layout: {
			blackboard: { type: Boolean, default: true },
			smartboard: { type: Boolean, default: false },
			studentArea: { type: Boolean, default: true },
			teacherArea: { type: Boolean, default: true },
		},
		panels: {
			type: [{ type: String, enum: PANELS }],
			default: ["chat", "notes", "quiz", "timeline", "resources"],
		},
		mode: {
			type: String,
			enum: MODES,
			default: "normal",
		},
		status: {
			type: String,
			enum: ["draft", "active", "archived"],
			default: "draft",
		},
		maxStudents: { type: Number, default: 30 },
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		tags: [{ type: String }],
	},
	{ timestamps: true },
);

classroomSchema.index({ course: 1 });
classroomSchema.index({ teacher: 1 });
classroomSchema.index({ status: 1 });
classroomSchema.index({ name: "text", description: "text" });

export default mongoose.model("Classroom", classroomSchema);
