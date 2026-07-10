/**
 * pdfGenerator.js
 * MR5 Academy Certification Standard — Server-Side PDF Certificate Generation
 *
 * Renders a high-end, premium vector certificate layout with a dark theme,
 * metallic borders, course/student details, embedded QR verification code,
 * and security signatures.
 */
import PDFDocument from "pdfkit";

/**
 * Generate PDF buffer for an issued certificate.
 *
 * @param {object} cert        - Certificate database model content
 * @param {Buffer} qrCodeBuffer - QR code PNG image buffer
 * @returns {Promise<Buffer>}   - Generated PDF file buffer
 */
export function generateCertificatePdf(cert, qrCodeBuffer) {
	return new Promise((resolve, reject) => {
		try {
			// A4 dimensions in landscape: 841.89 x 595.28 points
			const doc = new PDFDocument({
				size: "A4",
				layout: "landscape",
				margin: 0,
			});

			const chunks = [];
			doc.on("data", (chunk) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", (err) => reject(err));

			// ─── 1. Luxury Dark Theme Background ────────────────────────────────
			// Deep dark indigo/navy background
			doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0a0a16");

			// Decorative background glow / subtle geometric lines (optional/drawn vectors)
			doc.circle(0, 0, 200).fill("#0e0e22");
			doc.circle(doc.page.width, doc.page.height, 200).fill("#0e0e22");

			// Re-enable dark navy fill color just in case
			doc.fillColor("#0a0a16");

			// ─── 2. Premium Borders ─────────────────────────────────────────────
			// Outer Gold Border
			doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
				.lineWidth(3)
				.stroke("#c5a880");

			// Inner Thin Bronze Border
			doc.rect(32, 32, doc.page.width - 64, doc.page.height - 64)
				.lineWidth(0.75)
				.stroke("#8a7355");

			// Corner decorations (Gold squares)
			const borderCorners = [
				{ x: 23, y: 23 },
				{ x: doc.page.width - 29, y: 23 },
				{ x: 23, y: doc.page.height - 29 },
				{ x: doc.page.width - 29, y: doc.page.height - 29 },
			];
			borderCorners.forEach((corner) => {
				doc.rect(corner.x, corner.y, 6, 6).fill("#c5a880");
			});

			// ─── 3. Header & Brand ──────────────────────────────────────────────
			// Top gold crown/tab element
			doc.rect(doc.page.width / 2 - 50, 25, 100, 10).fill("#c5a880");

			// Brand Title
			doc.fillColor("#c5a880")
				.fontSize(22)
				.font("Helvetica-Bold")
				.text("MR5 ACADEMY", 0, 75, { align: "center", characterSpacing: 3 });

			// Sub-header
			doc.fillColor("#ffffff")
				.fontSize(12)
				.font("Helvetica")
				.text("GLOBAL EDUCATION & AI RESEARCH LABS", 0, 105, {
					align: "center",
					characterSpacing: 2,
				});

			// ─── 4. Certificate Core Text ────────────────────────────────────────
			doc.fillColor("#8e92bc")
				.fontSize(11)
				.font("Helvetica-Oblique")
				.text("This is officially presented to", 0, 155, { align: "center" });

			// Student Name (Highlight)
			doc.fillColor("#ffffff")
				.fontSize(34)
				.font("Helvetica-Bold")
				.text(cert.studentName, 0, 180, { align: "center" });

			// Gold divider under name
			doc.moveTo(doc.page.width / 2 - 150, 228)
				.lineTo(doc.page.width / 2 + 150, 228)
				.lineWidth(1)
				.stroke("#c5a880");

			// Description
			doc.fillColor("#8e92bc")
				.fontSize(11)
				.font("Helvetica-Oblique")
				.text("for successfully fulfilling all academic requirements of the course", 0, 245, {
					align: "center",
				});

			// Course Title
			doc.fillColor("#c5a880")
				.fontSize(22)
				.font("Helvetica-Bold")
				.text(cert.courseName, 0, 270, { align: "center" });

			// Date and Grade Info
			const dateStr = new Date(cert.completionDate).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
			const scoreDetails =
				cert.finalScore !== undefined && cert.finalScore !== null
					? `   |   Score: ${cert.finalScore}%   |   Grade: ${cert.grade}`
					: `   |   Grade: ${cert.grade}`;

			doc.fillColor("#ffffff")
				.fontSize(10)
				.font("Helvetica")
				.text(`Completed: ${dateStr}${scoreDetails}`, 0, 310, { align: "center" });

			// ─── 5. Security & Verification Section ─────────────────────────────
			// QR Code (Left)
			if (qrCodeBuffer) {
				doc.image(qrCodeBuffer, 85, doc.page.height - 185, { width: 95 });
			}

			// QR Verification text under QR Code
			doc.fillColor("#8e92bc")
				.fontSize(7)
				.font("Helvetica")
				.text("Scan QR to verify authenticity", 85, doc.page.height - 82, {
					width: 95,
					align: "center",
				});

			// Certificate Details (Center-Left)
			const metadataX = 210;
			const startMetadataY = doc.page.height - 165;

			doc.fillColor("#8e92bc").fontSize(8).font("Helvetica");
			doc.text(`Certification ID: ${cert.certificationId}`, metadataX, startMetadataY);
			doc.text(`Certificate ID: ${cert.certificateId}`, metadataX, startMetadataY + 16);
			doc.text(`Verification Hash: ${cert.verificationHash}`, metadataX, startMetadataY + 32);
			doc.text(`Recipient Region: ${cert.country || "Global"}`, metadataX, startMetadataY + 48);

			doc.fillColor("#c5a880");
			const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "mr5school.com";
			doc.text(`Verify URL: ${siteUrl}/verify/${cert.certificateId}`, metadataX, startMetadataY + 68);

			// ─── 6. Signatures (Right) ──────────────────────────────────────────
			const sigLineX = doc.page.width - 265;
			const sigLineY = doc.page.height - 110;
			const sigWidth = 180;

			// Signature Line
			doc.moveTo(sigLineX, sigLineY).lineTo(sigLineX + sigWidth, sigLineY).lineWidth(1).stroke("#8a7355");

			// Instructor Sign Name
			doc.fillColor("#ffffff")
				.fontSize(10)
				.font("Helvetica-Bold")
				.text(cert.instructorName || "MR5 Academy Board", sigLineX, sigLineY + 10, {
					width: sigWidth,
					align: "center",
				});

			// Signature Label
			doc.fillColor("#8e92bc")
				.fontSize(8)
				.font("Helvetica")
				.text("Authorized Instructor / Director", sigLineX, sigLineY + 24, {
					width: sigWidth,
					align: "center",
				});

			// Add a gold seal vector graphic
			doc.circle(doc.page.width - 175, doc.page.height - 160, 20).lineWidth(1.5).stroke("#c5a880");
			doc.circle(doc.page.width - 175, doc.page.height - 160, 16).lineWidth(0.5).stroke("#8a7355");
			doc.fillColor("#c5a880")
				.fontSize(7)
				.font("Helvetica-Bold")
				.text("MR5", doc.page.width - 195, doc.page.height - 164, { width: 40, align: "center" });

			// ─── 7. Finalize & Save ─────────────────────────────────────────────
			doc.end();
		} catch (error) {
			reject(error);
		}
	});
}
