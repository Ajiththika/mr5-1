/**
 * transcriptController.js
 * MR5 Academy Certification Standard — Student Transcript System
 */
import Transcript from "../models/Transcript.js";
import Certificate from "../models/Certificate.js";
import CertificationProfile from "../models/CertificationProfile.js";
import User from "../models/User.js";
import { generateFullHash, generateShareToken } from "../utils/certificateHasher.js";

/**
 * GET /api/transcripts/my
 * Student: Get or generate their transcript.
 */
export const getMyTranscript = async (req, res) => {
	try {
		const student = await User.findById(req.user._id).lean();
		const profile = await CertificationProfile.findOne({ user: req.user._id }).lean();

		if (!profile) {
			return res.status(200).json({
				success: true,
				transcript: null,
				message: "No certification profile yet. Complete a course to receive your first certificate.",
			});
		}

		// Get all issued certificates for this student
		const certificates = await Certificate.find({
			student: req.user._id,
			status: "issued",
		})
			.populate("course", "title category level estimatedWeeks language")
			.populate("instructor", "name")
			.sort({ issuedAt: -1 })
			.lean();

		// Build course entries
		const courseEntries = certificates.map((cert) => ({
			course: cert.course?._id,
			certificate: cert._id,
			certificateId: cert.certificateId,
			courseName: cert.courseName,
			courseCategory: cert.course?.category,
			instructorName: cert.instructorName,
			institution: cert.institution || "MR5 Academy",
			completionDate: cert.completionDate,
			finalScore: cert.finalScore,
			grade: cert.grade,
			durationHours: cert.durationHours || (cert.course?.estimatedWeeks || 1) * 10,
			level: cert.course?.level,
			status: "verified",
		}));

		// Compute GPA
		const gradesWithPoints = { "A+": 4.0, "A": 4.0, "B+": 3.5, "B": 3.0, "C": 2.5, "D": 2.0, "F": 0 };
		const validGrades = courseEntries.filter((e) => gradesWithPoints[e.grade] !== undefined);
		const gpa = validGrades.length > 0
			? validGrades.reduce((sum, e) => sum + (gradesWithPoints[e.grade] || 0), 0) / validGrades.length
			: 0;

		const totalStudyHours = courseEntries.reduce((sum, e) => sum + (e.durationHours || 0), 0);

		// Build verification hash for transcript integrity
		const transcriptHash = generateFullHash({
			certificationId: profile.certificationId,
			studentId: req.user._id.toString(),
			courseCount: courseEntries.length,
			timestamp: new Date().toISOString(),
		});

		// Upsert transcript document
		const transcript = await Transcript.findOneAndUpdate(
			{ student: req.user._id },
			{
				student: req.user._id,
				certificationId: profile.certificationId,
				studentName: student.name,
				studentEmail: student.email,
				country: profile.countryName,
				profileImageUrl: student.profileImage || student.avatarUrl,
				courses: courseEntries,
				totalCertificates: certificates.length,
				totalCoursesCompleted: certificates.length,
				totalStudyHours,
				gpa: Math.round(gpa * 100) / 100,
				verificationHash: transcriptHash,
				lastGeneratedAt: new Date(),
			},
			{ upsert: true, new: true },
		);

		return res.status(200).json({ success: true, transcript });
	} catch (error) {
		console.error("getMyTranscript error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

/**
 * POST /api/transcripts/share
 * Student: Generate a public share token for their transcript.
 */
export const generateShareLink = async (req, res) => {
	try {
		const transcript = await Transcript.findOne({ student: req.user._id });
		if (!transcript) {
			return res.status(404).json({ success: false, error: "Transcript not found. Complete a course first." });
		}

		const token = generateShareToken();
		transcript.publicShareToken = token;
		transcript.isPublic = true;
		await transcript.save();

		return res.status(200).json({
			success: true,
			shareUrl: `${process.env.CLIENT_URL || "https://mr5school.com"}/transcript/shared/${token}`,
			token,
		});
	} catch (error) {
		console.error("generateShareLink error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

/**
 * GET /api/transcripts/shared/:token
 * Public: View transcript via share token (employer/university view).
 */
export const getSharedTranscript = async (req, res) => {
	const { token } = req.params;

	try {
		const transcript = await Transcript.findOne({ publicShareToken: token, isPublic: true }).lean();

		if (!transcript) {
			return res.status(404).json({
				success: false,
				error: "Transcript not found or sharing has been disabled.",
			});
		}

		// Return transcript without email
		const { studentEmail, publicShareToken, ...safeTranscript } = transcript;

		return res.status(200).json({ success: true, transcript: safeTranscript });
	} catch (error) {
		console.error("getSharedTranscript error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};
