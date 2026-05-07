import { asyncHandler } from "../middleware/errorHandler.js";
import { v4 as uuidv4 } from "uuid";
import avatarService from "../services/avatarService.js";
import supportService from "../services/supportService.js";

// LiveKit tool functions
const liveKitTool = {
    start_session: async (params) => {
        console.log("LIVEKIT_TOOL.start_session called with:", params);
        // In a real implementation, this would connect to LiveKit API
        return { 
            status: "ok", 
            status_code: 200, 
            short_message: "Session started successfully",
            session_id: uuidv4()
        };
    },
    join_session: async (params) => {
        console.log("LIVEKIT_TOOL.join_session called with:", params);
        return { 
            status: "ok", 
            status_code: 200, 
            short_message: "Joined session successfully"
        };
    },
    leave_session: async (params) => {
        console.log("LIVEKIT_TOOL.leave_session called with:", params);
        return { 
            status: "ok", 
            status_code: 200, 
            short_message: "Left session successfully"
        };
    }
};

// Avatar tool functions using avatarService
const avatarTool = {
    set_pose: async (params) => {
        try {
            const result = await avatarService.setPose(params.participant_id || "default", params.pose);
            return result;
        } catch (error) {
            return { 
                status: "error", 
                status_code: 500, 
                short_message: error.message 
            };
        }
    },
    lip_sync: async (params) => {
        try {
            const result = await avatarService.lipSync(params.participant_id || "default", params.text);
            return result;
        } catch (error) {
            return { 
                status: "error", 
                status_code: 500, 
                short_message: error.message 
            };
        }
    },
    show_notification: async (params) => {
        try {
            const result = await avatarService.showNotification(
                params.participant_id || "default", 
                params.text, 
                params.duration_ms
            );
            return result;
        } catch (error) {
            return { 
                status: "error", 
                status_code: 500, 
                short_message: error.message 
            };
        }
    }
};

// Support tool functions using supportService
const supportTool = {
    create_ticket: async (params) => {
        try {
            const result = await supportService.createTicket(
                params.user_id, 
                params.subject, 
                params.description, 
                params.priority
            );
            return result;
        } catch (error) {
            return { 
                status: "error", 
                status_code: 500, 
                short_message: error.message 
            };
        }
    },
    send_email: async (params) => {
        try {
            const result = await supportService.sendEmail(
                params.to, 
                params.subject, 
                params.body, 
                params.attachments
            );
            return result;
        } catch (error) {
            return { 
                status: "error", 
                status_code: 500, 
                short_message: error.message 
            };
        }
    },
    manage_user: async (params) => {
        try {
            const result = await supportService.manageUser(params.user_id, params.action);
            return result;
        } catch (error) {
            return { 
                status: "error", 
                status_code: 500, 
                short_message: error.message 
            };
        }
    }
};

// @desc    Handle avatar support agent actions
// @route   POST /api/avatar-support-agent/action
// @access  Private
export const handleAvatarAction = asyncHandler(async (req, res) => {
    const { user_intent, tool_calls } = req.body;
    
    // Generate action ID and timestamp
    const action_id = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Process tool calls
    const results = [];
    let spoken_reply = "";
    let visual_reply = "";
    
    // For demo purposes, we'll set default replies
    spoken_reply = "Starting screen-share session and creating ticket...";
    visual_reply = "Processing your request...";
    
    if (tool_calls && Array.isArray(tool_calls)) {
        for (const call of tool_calls) {
            let result;
            
            try {
                switch (call.tool) {
                    case "LIVEKIT_TOOL":
                        if (liveKitTool[call.op]) {
                            result = await liveKitTool[call.op](call.params);
                        } else {
                            result = { status: "error", status_code: 400, short_message: "Invalid LiveKit operation" };
                        }
                        break;
                    case "AVATAR_TOOL":
                        if (avatarTool[call.op]) {
                            result = await avatarTool[call.op](call.params);
                        } else {
                            result = { status: "error", status_code: 400, short_message: "Invalid Avatar operation" };
                        }
                        break;
                    case "SUPPORT_TOOL":
                        if (supportTool[call.op]) {
                            result = await supportTool[call.op](call.params);
                        } else {
                            result = { status: "error", status_code: 400, short_message: "Invalid Support operation" };
                        }
                        break;
                    default:
                        result = { status: "error", status_code: 400, short_message: "Unknown tool" };
                }
                
                results.push({
                    tool: call.tool,
                    op: call.op,
                    params: call.params,
                    result
                });
            } catch (error) {
                results.push({
                    tool: call.tool,
                    op: call.op,
                    params: call.params,
                    result: { status: "error", status_code: 500, short_message: error.message }
                });
            }
        }
    }
    
    // Prepare response
    const response = {
        action_id,
        timestamp,
        user_intent: user_intent || "User request",
        spoken_reply,
        visual_reply,
        tool_calls: results,
        result_expected: {
            status: "ok",
            status_code: 200,
            short_message: "Action completed successfully"
        }
    };
    
    // Send human-friendly text + machine-parsable JSON
    res.status(200).json(response);
});

// @desc    Test endpoint for avatar support agent
// @route   POST /api/avatar-support-agent/test
// @access  Public (for testing)
export const testAvatarAction = asyncHandler(async (req, res) => {
    // This is the test case mentioned in the requirements
    const response = {
        action_id: uuidv4(),
        timestamp: new Date().toISOString(),
        user_intent: "test_case",
        spoken_reply: "Starting screen-share session and creating ticket...",
        visual_reply: "Processing your request...",
        tool_calls: [
            {
                tool: "LIVEKIT_TOOL",
                op: "start_session",
                params: {
                    room_id: "test-room",
                    user_name: "test-user",
                    voice_mode: "stereo",
                    record: true
                }
            },
            {
                tool: "SUPPORT_TOOL",
                op: "create_ticket",
                params: {
                    user_id: "test-user-id",
                    subject: "Test Ticket",
                    description: "This is a test ticket",
                    priority: "medium"
                }
            }
        ],
        result_expected: {
            status: "ok",
            status_code: 200,
            short_message: "Action completed successfully"
        }
    };
    
    res.status(200).json(response);
});