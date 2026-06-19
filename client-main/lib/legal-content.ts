export interface PolicySection {
  id: string;
  title: string;
  summary?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PolicyDocument {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  sections: PolicySection[];
}

export const TERMS_OF_SERVICE: PolicyDocument = {
  slug: "terms",
  badge: "Terms of Service",
  title: "Platform Terms & Conditions",
  subtitle:
    "Rules for using MR5 School's 3D learning platform, AI features, and educational services.",
  version: "1.0.0",
  lastUpdated: "June 15, 2025",
  sections: [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      summary: "Using MR5 School means you agree to these terms.",
      paragraphs: [
        "By creating an account, accessing courses, or entering our 3D virtual campus, you agree to these Terms of Service and our Privacy Policy.",
        "If you do not agree, do not use the platform. We may update these terms; continued use after notice constitutes acceptance of the revised version.",
      ],
    },
    {
      id: "accounts",
      title: "Accounts & Eligibility",
      paragraphs: [
        "You must provide accurate registration information and keep your credentials secure. You are responsible for activity under your account.",
        "Users under the age required by local law must obtain parental or guardian consent before using MR5 School. Additional child-safety rules may apply.",
      ],
      bullets: [
        "One person per account unless using an approved team or school license",
        "Notify us immediately of unauthorized access",
        "Administrators may suspend accounts that violate these terms",
      ],
    },
    {
      id: "platform-use",
      title: "Platform Use & 3D Experiences",
      paragraphs: [
        "MR5 School provides online courses, assignments, progress tracking, and optional immersive 3D classrooms. Core learning content remains available outside 3D mode where technically feasible.",
        "You agree not to misuse the platform, attempt unauthorized access, scrape assets, reverse-engineer software, or interfere with other learners.",
      ],
      bullets: [
        "3D environments may cause discomfort for some users — use the 2D lesson fallback when needed",
        "Network latency and device performance may affect real-time features",
        "Virtual campus assets are licensed for personal learning use only",
      ],
    },
    {
      id: "ai-features",
      title: "AI Teachers & Automated Tools",
      paragraphs: [
        "AI tutoring, voice interaction, and automated feedback are assistive tools — not a substitute for professional instruction, medical advice, or legal counsel.",
        "AI outputs may be inaccurate. Verify important information independently. Enable AI features only after reviewing the applicable consent disclosures.",
      ],
    },
    {
      id: "payments",
      title: "Payments, Subscriptions & Refunds",
      paragraphs: [
        "Paid plans, course purchases, and shop items are billed according to the pricing shown at checkout. Taxes may apply based on your region.",
        "Refund eligibility is described in our Refund Policy. Subscriptions renew unless cancelled before the renewal date.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      paragraphs: [
        "MR5 School owns or licenses the platform, course materials, 3D models, branding, and software. You receive a limited, non-transferable license to access content for personal or enrolled educational use.",
        "You retain ownership of content you submit, but grant MR5 School a license to host, display, and process it as needed to operate the service.",
      ],
    },
    {
      id: "termination",
      title: "Suspension & Termination",
      paragraphs: [
        "We may suspend or terminate access for violations, fraud, abuse, or legal requirements. You may close your account at any time through profile settings or by contacting support.",
        "Upon termination, certain records may be retained as required by law, billing, or security obligations.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers & Limitation of Liability",
      paragraphs: [
        "The platform is provided on an \"as is\" and \"as available\" basis. We do not guarantee uninterrupted service, error-free AI responses, or compatibility with every device.",
        "To the fullest extent permitted by law, MR5 School is not liable for indirect, incidental, or consequential damages arising from platform use, including 3D rendering issues, motion discomfort, or connectivity interruptions.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Questions about these Terms: legal@mr5school.com",
        "General support: support@mr5school.com or the Contact page.",
      ],
    },
  ],
};

export const PRIVACY_POLICY: PolicyDocument = {
  slug: "privacy",
  badge: "Privacy Policy",
  title: "Your Privacy, Explained",
  subtitle:
    "How MR5 School collects, uses, and protects your data across our LMS and 3D learning experiences.",
  version: "1.0.0",
  lastUpdated: "June 15, 2025",
  sections: [
    {
      id: "overview",
      title: "Overview",
      paragraphs: [
        "MR5 School is built with privacy-by-design principles. We collect only what we need to deliver courses, AI tutoring, progress tracking, and optional immersive features.",
        "This policy describes what we collect, why we collect it, and the choices available to you.",
      ],
    },
    {
      id: "data-collected",
      title: "Information We Collect",
      paragraphs: ["Depending on how you use MR5 School, we may process:"],
      bullets: [
        "Account details: name, email, role, profile preferences",
        "Learning data: enrollments, lesson progress, assignments, grades",
        "Payment metadata: transaction IDs and billing status (card data handled by payment processors)",
        "Technical data: device type, browser, approximate region, security logs",
        "AI interactions: questions and responses when AI features are enabled",
        "Optional 3D telemetry: movement or room events only with explicit opt-in",
        "Voice/audio: processed only when you enable microphone features",
      ],
    },
    {
      id: "how-we-use",
      title: "How We Use Information",
      paragraphs: ["We use personal data to:"],
      bullets: [
        "Authenticate users and protect accounts",
        "Deliver courses, certificates, and personalized learning paths",
        "Operate AI tutors and improve educational quality",
        "Process payments and prevent fraud",
        "Send service notifications and, with consent, marketing messages",
        "Maintain security, audit logs, and legal compliance",
      ],
    },
    {
      id: "cookies",
      title: "Cookies & Similar Technologies",
      paragraphs: [
        "Essential cookies power login sessions and security. Optional analytics or preference cookies are used only with appropriate notice and, where required, consent.",
        "You can manage browser cookie settings; disabling essential cookies may limit platform functionality.",
      ],
    },
    {
      id: "sharing",
      title: "When We Share Data",
      paragraphs: [
        "We do not sell personal information. We share data with trusted processors — hosting, email, payments, AI infrastructure — under contractual safeguards and only as needed to operate the service.",
        "We may disclose information when required by law or to protect users, rights, and platform integrity.",
      ],
    },
    {
      id: "rights",
      title: "Your Rights & Choices",
      paragraphs: [
        "Depending on your location, you may have rights to access, correct, delete, export, or restrict processing of your personal data.",
        "Manage feature consents in profile settings: AI features, spatial telemetry, and marketing preferences can be toggled independently where available.",
      ],
      bullets: [
        "Request a data export via support@mr5school.com",
        "Update profile and privacy preferences in your account",
        "Withdraw consent for optional features without losing core LMS access",
      ],
    },
    {
      id: "children",
      title: "Children's Privacy",
      paragraphs: [
        "MR5 School may be used by learners of various ages. Where required by law, parental consent is needed before collecting personal information from children.",
        "We minimize data collection for young learners and disable optional tracking features by default for child accounts.",
      ],
    },
    {
      id: "retention",
      title: "Retention & Security",
      paragraphs: [
        "We retain data only as long as needed for education delivery, legal obligations, dispute resolution, and security.",
        "We apply encryption in transit, access controls, and monitoring appropriate to a production LMS environment.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Privacy inquiries: privacy@mr5school.com",
        "Accessibility barriers: accessibility@mr5school.com",
      ],
    },
  ],
};

export const ACCESSIBILITY_STATEMENT: PolicyDocument = {
  slug: "accessibility",
  badge: "Accessibility",
  title: "Inclusive Learning for Everyone",
  subtitle:
    "MR5 School is committed to accessible design across 2D lessons, dashboards, and optional 3D experiences.",
  version: "1.0.0",
  lastUpdated: "June 15, 2025",
  sections: [
    {
      id: "commitment",
      title: "Our Commitment",
      paragraphs: [
        "We aim to meet WCAG 2.1 Level AA principles across primary user journeys: registration, course discovery, lesson playback, assignments, and account management.",
        "Accessibility is an ongoing effort. We welcome feedback from students, educators, and assistive-technology users.",
      ],
    },
    {
      id: "keyboard",
      title: "Keyboard Navigation",
      paragraphs: [
        "Primary flows support keyboard focus and activation. Use Tab to move between controls and Enter or Space to activate buttons and links.",
        "Skip links and logical focus order are provided on major pages. Modal dialogs trap focus until dismissed.",
      ],
    },
    {
      id: "screen-readers",
      title: "Screen Readers & Semantics",
      paragraphs: [
        "We use semantic HTML, ARIA labels where appropriate, and descriptive headings to support screen reader users.",
        "Form fields include associated labels and error messages. Status updates in dynamic areas use live regions where feasible.",
      ],
    },
    {
      id: "display",
      title: "Display Preferences",
      paragraphs: [
        "Adjust theme, font size, contrast, and layout density from profile and UI preference panels.",
        "Dark mode and reduced visual effects help users with light sensitivity or cognitive preferences.",
      ],
      bullets: [
        "Theme toggle in the footer and navbar",
        "High-contrast focus rings on interactive elements",
        "Responsive layouts for mobile, tablet, and desktop",
      ],
    },
    {
      id: "motion-3d",
      title: "Reduced Motion & 3D Fallback",
      paragraphs: [
        "3D campus and classroom views are optional. Core lessons remain accessible without WebGL.",
        "If 3D content fails to load or causes discomfort, use the standard lesson player from your enrolled courses.",
        "We respect prefers-reduced-motion settings and provide 2D alternatives for essential learning tasks.",
      ],
    },
    {
      id: "voice-ai",
      title: "Voice, AI & Captions",
      paragraphs: [
        "Voice-enabled AI features are optional and require explicit consent. Text-based alternatives are available for AI tutoring interactions.",
        "We continue to improve captioning, transcript availability, and non-voice input methods across the platform.",
      ],
    },
    {
      id: "reporting",
      title: "Report a Barrier",
      paragraphs: [
        "Encounter an accessibility issue? Email accessibility@mr5school.com with the page URL, device/browser, and a description of the barrier.",
        "We aim to acknowledge reports within 5 business days and provide remediation timelines when possible.",
      ],
    },
  ],
};

export const RELATED_POLICY_LINKS = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Contact Support", href: "/contact" },
];
