import User from "../models/User.js";
import nodemailer from "nodemailer";

class SupportService {
    constructor() {
        // Initialize nodemailer transporter
        // In production, you would use environment variables for these credentials
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.ethereal.email",
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || "your@email.com",
                pass: process.env.SMTP_PASS || "your_password"
            }
        });
    }

    // Create support ticket
    async createTicket(userId, subject, description, priority = "medium") {
        // Validate priority
        const validPriorities = ["low", "medium", "high", "urgent"];
        if (!validPriorities.includes(priority)) {
            throw new Error(`Invalid priority. Valid priorities are: ${validPriorities.join(", ")}`);
        }

        // In a real implementation, you would save this to a database
        const ticket = {
            id: this.generateTicketId(),
            userId,
            subject,
            description,
            priority,
            status: "open",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log(`Creating support ticket:`, ticket);

        // In a real implementation, you would save to database
        // await SupportTicket.create(ticket);

        return {
            status: "ok",
            status_code: 200,
            short_message: "Ticket created successfully",
            ticket_id: ticket.id
        };
    }

    // Send support email
    async sendEmail(to, subject, body, attachments = []) {
        try {
            // Validate email
            if (!this.isValidEmail(to)) {
                throw new Error("Invalid email address");
            }

            // Send email
            const info = await this.transporter.sendMail({
                from: process.env.SUPPORT_EMAIL || '"MR5 Support" <support@mr5school.com>',
                to,
                subject,
                text: body,
                attachments
            });

            console.log("Email sent:", info.messageId);

            return {
                status: "ok",
                status_code: 200,
                short_message: "Email sent successfully",
                messageId: info.messageId
            };
        } catch (error) {
            console.error("Error sending email:", error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    // Manage user (block/unblock/reset password)
    async manageUser(userId, action) {
        const validActions = ["block", "unblock", "reset_password"];
        if (!validActions.includes(action)) {
            throw new Error(`Invalid action. Valid actions are: ${validActions.join(", ")}`);
        }

        try {
            let result;
            
            switch (action) {
                case "block":
                    result = await User.findByIdAndUpdate(userId, { 
                        status: "blocked" 
                    }, { new: true });
                    break;
                case "unblock":
                    result = await User.findByIdAndUpdate(userId, { 
                        status: "approved" 
                    }, { new: true });
                    break;
                case "reset_password":
                    // In a real implementation, you would generate a password reset token
                    // and send an email to the user
                    console.log(`Password reset requested for user ${userId}`);
                    result = { message: "Password reset email sent" };
                    break;
            }

            if (!result) {
                throw new Error("User not found");
            }

            return {
                status: "ok",
                status_code: 200,
                short_message: `User ${action}ed successfully`
            };
        } catch (error) {
            console.error(`Error managing user:`, error);
            throw new Error(`Failed to ${action} user: ${error.message}`);
        }
    }

    // Generate ticket ID
    generateTicketId() {
        return "TKT-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Validate email format
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

export default new SupportService();