import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
	{
		eventType: {
			type: String,
			enum: [
				"lesson_view",
				"lesson_complete",
				"quiz_submit",
				"course_enroll",
				"classroom_session",
				"teacher_interaction",
				"content_publish",
			],
			required: true,
		},
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
		lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
		classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" },
		value: { type: Number },
		metadata: { type: mongoose.Schema.Types.Mixed },
	},
	{ timestamps: true },
);

analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ courseId: 1 });

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);
