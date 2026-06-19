import { z } from "zod";

export const registerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	role: z.enum(["student", "AI-TEACHER", "customer"]).optional(),
	phone: z.string().optional(),
	acceptLegal: z.boolean().optional(),
	documentVersionIds: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
	if (process.env.NODE_ENV === "production" && data.acceptLegal !== true) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "You must accept the legal agreements to register",
			path: ["acceptLegal"],
		});
	}
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});
