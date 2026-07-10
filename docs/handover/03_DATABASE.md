# 03 — Database Documentation

All collections use MongoDB via Mongoose ODM.
Backend: `Mr5-School-API-main/src/models/`

---

## Core User Collections

### User
**File:** `src/models/User.js`
**Purpose:** Central user record for all roles.

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required, trimmed |
| email | String | Unique, lowercase, required |
| password | String | Bcrypt hashed, select: false |
| googleId | String | Unique sparse (OAuth users) |
| role | String | enum: student, AI-TEACHER, instructor, employer, partner_school, admin |
| adminRole | String | enum: super_admin, power_leader, content_admin, teacher_manager, course_creator, reviewer, analytics_viewer |
| status | String | enum: pending, approved, rejected. Default: approved |
| mr5Uid | String | Unique sparse uppercase ID (MR5-...) |
| certificationId | String | Unique sparse. Format: MR5-2026-SL-000001 |
| country | String | ISO 3166-1 alpha-2 (max 2 chars) |
| countryName | String | Full country name |
| profileImage | String | URL |
| avatarUrl | String | URL |
| avatarPreset | String | Preset key |
| coverImageUrl | String | URL |
| onboardingCompleted | Boolean | Default: false |
| welcomeChatCompleted | Boolean | Default: false |
| age | Number | 5-120 |
| educationLevel | String | enum: High School, Bachelor's Degree, etc. |
| language | String | Default: English |
| timezone | String | Default: UTC |
| gradingSystem | String | Default: Standard (A-F) |
| regionalPreferences | Object | schoolHours, academicCalendar, holidays |
| isActive | Boolean | Default: true |
| resetPasswordToken | String | For password reset flow |
| resetPasswordExpire | Date | Token expiry |
| trialUsed | Boolean | Free trial tracking |
| trialStartedAt/ExpiresAt | Date | Trial window |
| activeTeacherAvatar | String | Default: teacher_default |
| purchasedTeacherAvatars | [String] | Array of owned avatar keys |
| ownedClassroomItems | [String] | Shop items |
| ownedAudioPacks | [String] | Shop items |
| ownedExercisePacks | [String] | Shop items |
| ownedTransportItems | [String] | Shop items |
| equippedClock/Fan/Bell/Music/Transport/ActivityPack/ClassroomPack | String | Equipped item keys |
| welcomeMessage | String | Max 80 chars |
| coursesEnrolled | [ObjectId] | Ref: Course |
| studentProfile | ObjectId | Ref: StudentProfile (future) |
| teacherProfile | ObjectId | Ref: Teacher |

**Indexes:** email (unique), googleId (unique sparse), mr5Uid (unique sparse), certificationId (unique sparse), role, status, createdAt (desc), name (text search)

**Pre-save hook:** bcrypt password hashing (10 rounds)

---

### RefreshToken
**File:** `src/models/RefreshToken.js`
**Purpose:** Stores refresh tokens for JWT rotation.

| Field | Type | Notes |
|-------|------|-------|
| token | String | Hashed refresh token |
| user | ObjectId | Ref: User |
| expiresAt | Date | TTL expiry |
| isRevoked | Boolean | Revocation flag |

---

### LoginAttempt
**File:** `src/models/LoginAttempt.js`
**Purpose:** Tracks failed login attempts for brute-force detection.

| Field | Type | Notes |
|-------|------|-------|
| email | String | Login email |
| ip | String | Client IP |
| attemptedAt | Date | Timestamp |
| success | Boolean | Outcome |

---

### RegistrationRequest
**File:** `src/models/RegistrationRequest.js`
**Purpose:** Pending teacher/partner registration requests.

| Field | Type | Notes |
|-------|------|-------|
| name | String | Applicant name |
| email | String | Contact email |
| role | String | Requested role |
| message | String | Application message |
| status | String | enum: pending, approved, rejected |

---

## Course Collections

### Course
**File:** `src/models/Course.js`
**Purpose:** Course catalog entries.

| Field | Type | Notes |
|-------|------|-------|
| title | String | Required |
| description | String | Required |
| category | String | Subject category |
| level | String | Beginner, Intermediate, Advanced |
| language | String | Default: English |
| teacher | ObjectId | Ref: User |
| price | Number | 0 = free |
| thumbnail | String | Cloudinary URL |
| isApproved | Boolean | Admin approval flag |
| publishStatus | String | draft, pending_review, approved, published |
| modules | [Object] | Embedded module structure |
| tags | [String] | Search tags |
| certificateRules | Object | Auto-cert conditions |

---

### Lesson
**File:** `src/models/Lesson.js`
**Purpose:** Individual lesson within a course.

| Field | Type | Notes |
|-------|------|-------|
| course | ObjectId | Ref: Course, required |
| title | String | Required |
| content | String | Lesson body text |
| videoUrl | String | External video link |
| duration | Number | Minutes |
| order | Number | Sequence position |
| publishStatus | String | draft, pending_review, approved, published |
| subtopics | [Object] | Sub-sections |

---

### Enrollment
**File:** `src/models/Enrollment.js`
**Purpose:** Student-course enrollment record.

| Field | Type | Notes |
|-------|------|-------|
| student | ObjectId | Ref: User, required |
| course | ObjectId | Ref: Course, required |
| progress | Number | 0-100 % |
| startedAt | Date | Enrollment date |
| completedAt | Date | Completion date |
| paymentId | ObjectId | Ref: Payment |

**Index:** student + course (compound unique)

---

### LessonProgress
**File:** `src/models/LessonProgress.js`
**Purpose:** Per-lesson completion tracking.

| Field | Type | Notes |
|-------|------|-------|
| student | ObjectId | Ref: User |
| lesson | ObjectId | Ref: Lesson |
| course | ObjectId | Ref: Course |
| completed | Boolean | Completion flag |
| completedAt | Date | Timestamp |
| timeSpentSeconds | Number | Time tracking |

---

### Assignment
**File:** `src/models/Assignment.js`
**Purpose:** Course assignments.

| Field | Type | Notes |
|-------|------|-------|
| course | ObjectId | Ref: Course |
| title | String | Required |
| description | String | |
| dueDate | Date | |
| maxScore | Number | |

---

### Submission
**File:** `src/models/Submission.js`
**Purpose:** Student assignment submissions.

| Field | Type | Notes |
|-------|------|-------|
| assignment | ObjectId | Ref: Assignment |
| student | ObjectId | Ref: User |
| content | String | Submission text |
| score | Number | Graded score |
| feedback | String | Instructor feedback |
| submittedAt | Date | |

---

### Transcript
**File:** `src/models/Transcript.js`
**Purpose:** Academic transcript per student.

| Field | Type | Notes |
|-------|------|-------|
| student | ObjectId | Ref: User |
| courses | [Object] | Per-course grades, status |
| gpa | Number | Calculated GPA |
| totalCredits | Number | |
| issuedAt | Date | |

---

### CourseGenerationJob
**File:** `src/models/CourseGenerationJob.js`
**Purpose:** Tracks AI course generation jobs.

| Field | Type | Notes |
|-------|------|-------|
| topic | String | Input topic |
| status | String | pending, running, completed, failed |
| result | Object | Generated course structure |
| error | String | Error message if failed |
| createdBy | ObjectId | Ref: User |

---

## Payment Collections

### Payment
**File:** `src/models/Payment.js`
**Purpose:** Stripe payment records.

| Field | Type | Notes |
|-------|------|-------|
| student | ObjectId | Ref: User |
| course | ObjectId | Ref: Course |
| stripeSessionId | String | Stripe checkout session ID |
| amount | Number | Amount in cents |
| currency | String | Default: usd |
| status | String | pending, completed, failed, refunded |

---

### PricingRule
**File:** `src/models/PricingRule.js`
**Purpose:** Dynamic pricing configurations.

| Field | Type | Notes |
|-------|------|-------|
| name | String | Rule name |
| discountPercent | Number | |
| applicableTo | [ObjectId] | Courses |
| validFrom/Until | Date | |
| isActive | Boolean | |

---

## Certification Collections

### Certificate
**File:** `src/models/Certificate.js`
**Purpose:** Full certification record with blockchain-style verification.

| Field | Type | Notes |
|-------|------|-------|
| certificateId | String | Unique. Format: MR5-CERT-2026-SL-000001 |
| certificationId | String | Student permanent ID |
| student | ObjectId | Ref: User |
| course | ObjectId | Ref: Course |
| instructor | ObjectId | Ref: User |
| title | String | e.g. "Certificate of Completion" |
| courseName | String | Denormalized for PDF |
| instructorName | String | Denormalized |
| studentName | String | Denormalized |
| institution | String | Default: MR5 Academy |
| country | String | |
| finalScore | Number | 0-100 |
| grade | String | enum: A+, A, B+, B, C, D, F, Pass, Distinction, Pending |
| completionDate | Date | Required |
| durationHours | Number | |
| status | String | pending_instructor, pending_admin, issued, rejected, revoked, expired |
| instructorApprovedAt/By | Date/ObjectId | |
| adminApprovedAt/By | Date/ObjectId | |
| issuedAt | Date | When status became "issued" |
| rejectionReason | String | |
| revokedAt/Reason | Date/String | |
| expiresAt | Date | null = never expires |
| verificationHash | String | Unique. Format: MR5-HASH-[8hex] |
| blockchainRecord | Object | verificationHash, previousHash, timestamp, nonce, blockIndex |
| pdfUrl | String | Cloudinary URL |
| qrCodeUrl | String | |
| qrCodeData | String | URL encoded in QR |
| certificateType | String | completion, achievement, ai_specialist, professional, partner |
| isPublic | Boolean | Default: true |
| verificationCount | Number | How many times verified |

**Static methods:**
- `generateCertificateId(country, year, sequence)` — MR5-CERT-2026-SL-000001
- `generateVerificationHash(data)` — MR5-HASH-[8hex]

---

### CertificationProfile
**File:** `src/models/CertificationProfile.js`
**Purpose:** Extended certification identity for the student.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| certificationId | String | MR5 cert ID |
| sequence | Number | Global counter |
| country | String | |
| issuedCertCount | Number | |
| lastCertIssuedAt | Date | |

---

### UserCertificate
**File:** `src/models/UserCertificate.js`
**Purpose:** Thin legacy reference model (predates Certificate.js — retained for backward compatibility).

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| certificate | ObjectId | Ref: Certificate |
| earnedAt | Date | |

---

### VerificationLog
**File:** `src/models/VerificationLog.js`
**Purpose:** Audit trail for certificate verification attempts.

| Field | Type | Notes |
|-------|------|-------|
| certificateId | String | Certificate being verified |
| verificationHash | String | |
| verifiedAt | Date | |
| verifierIp | String | |
| verifierUserAgent | String | |
| result | String | success, not_found, revoked, expired |

---

## Teacher / Classroom Collections

### Teacher
**File:** `src/models/Teacher.js`
**Purpose:** AI teacher profile with 3D studio configuration.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| displayName | String | |
| bio | String | |
| subjects | [String] | |
| studio | Object | 3D avatar config, voice, tone, speed |
| avatarType | String | procedural, ganesha, custom |
| voiceId | String | Azure TTS voice |
| tone | String | friendly, formal, encouraging |
| isPublished | Boolean | |

---

### Classroom
**File:** `src/models/Classroom.js`
**Purpose:** Virtual classroom configuration.

| Field | Type | Notes |
|-------|------|-------|
| course | ObjectId | Ref: Course |
| teacher | ObjectId | Ref: Teacher |
| name | String | |
| theme | String | Color/environment theme |
| mode | String | normal, demo, discussion, quiz, exam, revision, live_interaction |
| panels | [Object] | Configurable UI panels |
| isActive | Boolean | |

---

## Admin / Audit Collections

### ContentApproval
**File:** `src/models/ContentApproval.js`
**Purpose:** Content review pipeline for courses and lessons.

| Field | Type | Notes |
|-------|------|-------|
| contentType | String | course, lesson |
| contentId | ObjectId | Polymorphic ref |
| submittedBy | ObjectId | Ref: User |
| reviewedBy | ObjectId | Ref: User |
| status | String | draft, pending_review, approved, published, rejected, archived |
| comments | [Object] | Reviewer comments |
| rejectionReason | String | |

---

### ContentVersion
**File:** `src/models/ContentVersion.js`
**Purpose:** Version history for courses and lessons.

| Field | Type | Notes |
|-------|------|-------|
| contentType | String | course, lesson |
| contentId | ObjectId | |
| version | Number | |
| snapshot | Object | Full content snapshot |
| createdBy | ObjectId | Ref: User |

---

### ActivityLog
**File:** `src/models/ActivityLog.js`
**Purpose:** Audit trail for admin actions.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| action | String | e.g. "teacher.create" |
| targetType | String | e.g. "Teacher" |
| targetId | ObjectId | |
| metadata | Object | Additional context |
| timestamp | Date | |

---

### AnalyticsEvent
**File:** `src/models/AnalyticsEvent.js`
**Purpose:** Engagement and performance analytics.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| event | String | Event type |
| data | Object | Event payload |
| sessionId | String | |
| timestamp | Date | |

---

## AI / Chat Collections

### ChatMemory
**File:** `src/models/ChatMemory.js`
**Purpose:** Persistent AI conversation history per user.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| messages | [Object] | role, content pairs |
| context | String | System prompt context |
| updatedAt | Date | |

---

### ai-assistant-interaction.model.js
**Purpose:** Logs AI assistant interactions for analytics.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| input | String | User message |
| output | String | AI response |
| provider | String | gemini, openai, ollama |
| timestamp | Date | |

---

## Legal Collections (src/models/legal/)

### LegalDocument
**Purpose:** Legal document definitions (Terms, Privacy Policy).

| Field | Type | Notes |
|-------|------|-------|
| key | String | Unique identifier (e.g. terms_of_service) |
| title | String | |
| type | String | terms, privacy, consent |
| isMandatory | Boolean | |

### LegalDocumentVersion
**Purpose:** Versioned content for each legal document.

| Field | Type | Notes |
|-------|------|-------|
| document | ObjectId | Ref: LegalDocument |
| version | String | Semver or date |
| content | String | HTML or Markdown |
| effectiveDate | Date | |
| isActive | Boolean | Current version |

### LegalAcceptance
**Purpose:** Records that a user accepted a specific document version.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| documentVersion | ObjectId | Ref: LegalDocumentVersion |
| acceptedAt | Date | |
| acceptanceMethod | String | api, checkbox, inline |
| locale | String | |

### ConsentAuditLog
**Purpose:** GDPR-grade audit trail of all consent actions.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| action | String | accepted, revoked, updated |
| documentVersion | ObjectId | |
| ipHash | String | Hashed IP (privacy preserving) |
| timestamp | Date | |

### UserConsentPreferences
**Purpose:** Per-user consent preference store.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| marketing | Boolean | |
| analytics | Boolean | |
| thirdParty | Boolean | |

### SpatialInteractionLog
**Purpose:** Logs user interactions within 3D classroom for analytics.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| room | String | Room identifier |
| interactionType | String | |
| coordinates | Object | x, y, z |
| timestamp | Date | |

---

## Shop Collections

### ShopItem
**File:** `src/models/ShopItem.js`
**Purpose:** Virtual goods catalog.

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| description | String | |
| type | String | hat, shirt, accessory, book, teacher_avatar, audio_pack, etc. |
| priceCents | Number | Price in cents |
| imageUrl | String | |
| teacherSlug / itemSlug | String | Unique identifiers for OwnStore |
| isActive | Boolean | |

### ShopOrder
**File:** `src/models/ShopOrder.js`
**Purpose:** Purchase orders for virtual shop.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| items | [ObjectId] | Ref: ShopItem |
| totalCents | Number | |
| status | String | pending, completed |

### UserInventory
**File:** `src/models/UserInventory.js`
**Purpose:** User's owned virtual items.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| items | [ObjectId] | Ref: ShopItem |

---

## Gamification Collections

### Badge
**File:** `src/models/Badge.js`
**Purpose:** Badge definitions for achievements.

| Field | Type | Notes |
|-------|------|-------|
| key | String | Unique badge identifier |
| name | String | |
| description | String | |
| imageUrl | String | |
| criteria | Object | Conditions to earn badge |

### UserBadge
**File:** `src/models/UserBadge.js`
**Purpose:** Awarded badges per user.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| badge | ObjectId | Ref: Badge |
| earnedAt | Date | |

### UserLearningStats
**File:** `src/models/UserLearningStats.js`
**Purpose:** Aggregated learning metrics per user.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| totalXP | Number | |
| currentLevel | Number | |
| currentStreak | Number | Days |
| longestStreak | Number | |
| lastActiveDate | Date | |

---

## Identity Collections

### IdentityFriend
**File:** `src/models/IdentityFriend.js`
**Purpose:** Friend/connection relationships.

| Field | Type | Notes |
|-------|------|-------|
| requester | ObjectId | Ref: User |
| recipient | ObjectId | Ref: User |
| status | String | pending, accepted, blocked |

### IdentityNotification
**File:** `src/models/IdentityNotification.js`
**Purpose:** User notifications.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| type | String | friend_request, certificate, etc. |
| message | String | |
| isRead | Boolean | |
| createdAt | Date | |

### LocationContext
**File:** `src/models/LocationContext.js`
**Purpose:** User's detected location for regional personalization.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| country | String | |
| city | String | |
| timezone | String | |
| detectedAt | Date | |

---

## Misc Collections

### UserPrivacySettings
**File:** `src/models/UserPrivacySettings.js`
**Purpose:** Privacy preferences.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| profileVisibility | String | public, friends, private |
| showOnLeaderboard | Boolean | |

### ContentSource
**File:** `src/models/ContentSource.js`
**Purpose:** External content source references.

| Field | Type | Notes |
|-------|------|-------|
| url | String | Source URL |
| type | String | video, article, etc. |
| title | String | |
| addedBy | ObjectId | Ref: User |
