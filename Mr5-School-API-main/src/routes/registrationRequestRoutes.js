import express from "express";
import { createRegistrationRequest } from "../controllers/registrationRequestController.js";

const router = express.Router();

router.post("/", createRegistrationRequest);

export default router;
