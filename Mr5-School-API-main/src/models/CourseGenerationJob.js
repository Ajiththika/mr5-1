import mongoose from "mongoose";

const courseGenerationJobSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true },
    intent: {
      topic: String,
      level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
      intentType: { type: String, enum: ["full_course", "lesson", "skill_path"] },
      subtopics: [String],
      durationWeeks: Number,
    },
    status: {
      type: String,
      enum: ["queued", "matching", "assembling", "generating", "completed", "failed"],
      default: "queued",
    },
    recommendation: {
      type: String,
      enum: ["open_existing", "assemble_new", "merge_partial"],
    },
    matchedCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    syllabus: { type: mongoose.Schema.Types.Mixed },
    sources: [{ type: mongoose.Schema.Types.ObjectId, ref: "ContentSource" }],
    reviewStatus: {
      type: String,
      enum: ["pending_review", "approved", "rejected"],
      default: "pending_review",
    },
    error: { type: String },
    auditLog: [
      {
        at: { type: Date, default: Date.now },
        action: String,
        detail: String,
      },
    ],
  },
  { timestamps: true },
);

courseGenerationJobSchema.index({ query: 1, createdAt: -1 });
courseGenerationJobSchema.index({ requestedBy: 1, createdAt: -1 });

export default mongoose.model("CourseGenerationJob", courseGenerationJobSchema);
