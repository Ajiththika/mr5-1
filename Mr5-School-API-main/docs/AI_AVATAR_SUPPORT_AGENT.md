# AI Avatar Support Agent

## Overview

The AI Avatar Support Agent is an intelligent assistant that combines voice interaction, visual representation, and real-time support tools. It can see user screens, unblock users, send support ticket emails, and provide both audio and visual cues while performing actions.

## Features

- **AI Voice Agent**: Built with LiveKit for natural voice interaction
- **Screen Sharing**: The agent can see user shared screens in real time
- **Support Ticket Emails**: Automatically generate and send support ticket information
- **User Management**: Unblock or manage users directly from the interface
- **Audio Cues**: Typing sounds play while the agent performs actions
- **Visual Cues**: On-screen notifications confirm successful operations
- **AI Avatar**: Realistic visual representation powered by Beyond Presence tools

## API Endpoints

### Avatar Support Agent Actions

**POST** `/api/avatar-support-agent/action`
Execute avatar actions with specified tool calls.

Request Body:
```json
{
  "user_intent": "string",
  "tool_calls": [
    {
      "tool": "LIVEKIT_TOOL|AVATAR_TOOL|SUPPORT_TOOL",
      "op": "operation_name",
      "params": {}
    }
  ]
}
```

**POST** `/api/avatar-support-agent/test`
Run the test case for avatar action (used for unit testing).

### LiveKit Integration

**POST** `/api/livekit/avatar-token`
Create a LiveKit token specifically for avatar agents.

**GET** `/api/livekit/room/:roomName`
Get information about a specific room.

## Tool Operations

### LIVEKIT_TOOL

- `start_session`: Start a new voice session
  - Params: `room_id`, `user_name`, `voice_mode`, `record`
- `join_session`: Join an existing session
  - Params: `room_id`, `participant_id`
- `leave_session`: Leave a session
  - Params: `room_id`, `participant_id`

### AVATAR_TOOL

- `set_pose`: Set avatar pose
  - Params: `pose` (idle, listening, speaking, typing)
- `lip_sync`: Initiate lip synchronization
  - Params: `text`
- `show_notification`: Display on-screen notification
  - Params: `text`, `duration_ms`

### SUPPORT_TOOL

- `create_ticket`: Create a support ticket
  - Params: `user_id`, `subject`, `description`, `priority`
- `send_email`: Send support email
  - Params: `to`, `subject`, `body`, `attachments`
- `manage_user`: Manage user account
  - Params: `user_id`, `action` (block, unblock, reset_password)

## Response Format

All avatar actions return a standardized response format:

```json
{
  "action_id": "uuid-v4",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "user_intent": "short intent phrase",
  "spoken_reply": "what the avatar should say out loud",
  "visual_reply": "short on-screen notification text",
  "tool_calls": [
    {
      "tool": "TOOL_NAME",
      "op": "operation_name",
      "params": {},
      "result": {
        "status": "ok|error",
        "status_code": 200,
        "short_message": "one-line summary"
      }
    }
  ],
  "result_expected": {
    "status": "ok|error",
    "status_code": 200,
    "short_message": "one-line summary"
  }
}
```

## Frontend Integration

The avatar support agent is available in the frontend at `/ai-assistant/avatar-support`. Users can:

1. Specify their intent
2. Configure multiple tool calls
3. Execute actions and see results
4. Run test cases

## Testing

For unit tests, when given the single test prompt, the agent outputs:
1. A one-line spoken_reply string: "Starting screen-share session and creating ticket..."
2. An ACTION_SCHEMA JSON with a tool_calls array containing first a LIVEKIT_TOOL.start_session and then a SUPPORT_TOOL.create_ticket
3. result_expected.status must be "ok" and status_code 200

## Safety

The agent has built-in safeguards:
- Refuses destructive actions outside support scope
- Requires explicit confirmation for PII or payment requests
- Logs all attempts for security monitoring