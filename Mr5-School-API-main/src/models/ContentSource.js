import mongoose from "mongoose";

const contentSourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    sourceType: {
      type: String,
      enum: ["lms_internal", "official_docs", "open_education", "api", "teacher_upload", "ai_generated"],
      default: "lms_internal",
    },
    licenseType: {
      type: String,
      enum: ["proprietary", "cc-by", "cc-by-sa", "mit", "apache-2.0", "public_domain", "internal"],
      default: "internal",
    },
    attribution: { type: String, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    notes: { type: String },
  },
  { timestamps: true },
);

contentSourceSchema.index({ course: 1 });
contentSourceSchema.index({ lesson: 1 });

export default mongoose.model("ContentSource", contentSourceSchema);
