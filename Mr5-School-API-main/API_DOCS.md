# MR5 AI-Powered LMS API Documentation

Version: 1.0.0

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Courses](#courses)
- [Enrollments](#enrollments)
- [Lessons](#lessons)
- [Progress](#progress)
- [AI Tutor](#ai-tutor)
- [Payments](#payments)
- [Admin](#admin)
- [Error Codes](#error-codes)

## Authentication

### POST /api/auth/signup
Register a new user

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "student|teacher|admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "createdAt": "date"
    },
    "token": "jwt_token"
  }
}
```

### POST /api/auth/login
Login with existing credentials

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "jwt_token"
  }
}
```

### POST /api/auth/logout
Logout current user

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Users

### GET /api/users/profile
Get current user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "avatar": {
      "id": "string",
      "settings": {}
    },
    "subscription": {
      "planId": "string",
      "status": "string",
      "expiresAt": "date"
    },
    "createdAt": "date",
    "lastActive": "date"
  }
}
```

### PUT /api/users/profile
Update user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "avatar": {
    "id": "string",
    "settings": {}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

### GET /api/users/:id
Get user by ID (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

## Courses

### GET /api/courses
List all courses

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `category` (string) - Filter by category
- `difficulty` (string) - Filter by difficulty
- `search` (string) - Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "teacherId": "string",
        "category": "string",
        "difficulty": "string",
        "price": "number",
        "thumbnail": "string",
        "published": "boolean",
        "createdAt": "date",
        "updatedAt": "date",
        "modulesCount": "number",
        "lessonsCount": "number"
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number",
      "totalItems": "number"
    }
  }
}
```

### POST /api/courses
Create a new course (teacher/admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "beginner|intermediate|advanced",
  "price": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {}
  }
}
```

### GET /api/courses/:id
Get course by ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "string",
      "title": "string",
      "description": "string",
      "teacher": {
        "id": "string",
        "name": "string"
      },
      "category": "string",
      "difficulty": "string",
      "price": "number",
      "thumbnail": "string",
      "published": "boolean",
      "modules": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "order": "number",
          "lessons": [
            {
              "id": "string",
              "title": "string",
              "type": "string",
              "content": "string|object",
              "order": "number",
              "duration": "number"
            }
          ]
        }
      ],
      "enrolled": "boolean",
      "progress": "number"
    }
  }
}
```

### PUT /api/courses/:id
Update course (teacher/admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "string",
  "price": "number",
  "published": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {}
  }
}
```

### DELETE /api/courses/:id
Delete course (teacher/admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

## Enrollments

### POST /api/enrollments
Enroll in a course

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "string",
      "userId": "string",
      "courseId": "string",
      "enrolledAt": "date",
      "status": "string"
    }
  }
}
```

### GET /api/enrollments/my-courses
Get user's enrolled courses

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "string",
        "courseId": "string",
        "course": {
          "id": "string",
          "title": "string",
          "description": "string",
          "thumbnail": "string",
          "teacher": {
            "name": "string"
          }
        },
        "enrolledAt": "date",
        "progress": "number"
      }
    ]
  }
}
```

### GET /api/enrollments/:courseId
Get enrollment status for a course

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrolled": "boolean",
    "enrollment": {}
  }
}
```

## Lessons

### GET /api/lessons/:courseId
Get lessons for a course

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "order": "number",
        "lessons": [
          {
            "id": "string",
            "title": "string",
            "type": "string",
            "content": "string|object",
            "order": "number",
            "duration": "number",
            "completed": "boolean"
          }
        ]
      }
    ]
  }
}
```

### POST /api/lessons
Create a lesson (teacher/admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": "string",
  "moduleId": "string",
  "title": "string",
  "type": "text|video|interactive|quiz",
  "content": "string|object",
  "order": "number",
  "duration": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lesson": {}
  }
}
```

### PUT /api/lessons/:id
Update lesson (teacher/admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "type": "string",
  "content": "string|object",
  "order": "number",
  "duration": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lesson": {}
  }
}
```

## Progress

### POST /api/progress
Update lesson progress

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "lessonId": "string",
  "status": "not_started|in_progress|completed",
  "timeSpent": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": {}
  }
}
```

### GET /api/progress/:courseId
Get progress for a course

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": {
      "overall": "number",
      "modules": [
        {
          "moduleId": "string",
          "progress": "number",
          "lessons": [
            {
              "lessonId": "string",
              "status": "string",
              "timeSpent": "number"
            }
          ]
        }
      ]
    }
  }
}
```

### GET /api/progress/dashboard
Get dashboard progress summary

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrolledCourses": "number",
    "completedCourses": "number",
    "currentStreak": "number",
    "totalStudyTime": "number",
    "recentActivity": [
      {
        "courseId": "string",
        "courseTitle": "string",
        "lessonTitle": "string",
        "completedAt": "date"
      }
    ]
  }
}
```

## AI Tutor

### POST /api/ai/chat
Chat with AI tutor

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "system|user|assistant",
      "content": "string"
    }
  ],
  "options": {
    "provider": "openai|gemini|ollama",
    "model": "string",
    "temperature": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "string"
        }
      }
    ]
  }
}
```

### POST /api/ai/ollama
Chat directly with Ollama

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "system|user|assistant",
      "content": "string"
    }
  ],
  "options": {
    "model": "string",
    "temperature": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "string"
        }
      }
    ]
  }
}
```

### POST /api/ai/summary
Generate course summary (teacher/admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "string",
    "keyTakeaways": ["string"],
    "quiz": [
      {
        "question": "string",
        "options": ["string"],
        "correctOption": "number"
      }
    ]
  }
}
```

## Payments

### POST /api/payments/checkout
Create Stripe checkout session

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": "string",
  "planType": "one_time|subscription"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "url": "string"
  }
}
```

### POST /api/payments/webhook
Handle Stripe webhooks

**Headers:**
```
Stripe-Signature: "string"
```

**Request Body:**
```json
{
  "type": "string",
  "data": {}
}
```

**Response:**
```json
{
  "success": true
}
```

## Admin

### GET /api/admin/users
List all users (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `role` (string) - Filter by role
- `search` (string) - Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "subscription": {
          "planId": "string",
          "status": "string"
        },
        "createdAt": "date",
        "lastActive": "date"
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number",
      "totalItems": "number"
    }
  }
}
```

### PUT /api/admin/users/:id
Update user (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "string",
  "subscription": {
    "planId": "string",
    "status": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

### DELETE /api/admin/users/:id
Delete user (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### GET /api/admin/analytics
Get system analytics (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": "number",
      "active": "number",
      "byRole": {
        "student": "number",
        "teacher": "number",
        "admin": "number"
      }
    },
    "courses": {
      "total": "number",
      "published": "number",
      "byCategory": {}
    },
    "enrollments": {
      "total": "number",
      "byCourse": []
    },
    "revenue": {
      "total": "number",
      "byPlan": {}
    }
  }
}
```

## Error Codes

All API responses follow a consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error
- `CONFLICT` - Resource conflict