export type ProductTourPlacement = "top" | "bottom" | "left" | "right" | "center";

export type ProductTourStep = {
  id: string;
  title: string;
  body: string;
  action: string;
  tip?: string;
  tamilHint?: string;
  targetId?: string;
  placement?: ProductTourPlacement;
};

export const PRODUCT_TOUR_STORAGE_KEY = "mr5_product_tour_completed_v1";

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    id: "welcome",
    title: "Welcome to MR5 School",
    targetId: "tour-hero",
    placement: "bottom",
    body:
      "This is your home screen. From here you can explore courses, meet your AI teacher, and enter the 3D classroom.",
    action: "Click Next to start a quick tour.",
    tip: "You will only see this tour once.",
  },
  {
    id: "learning-hub",
    title: "Your Learning Hub",
    targetId: "tour-main-bento",
    placement: "top",
    body:
      "This main panel shows your greeting, progress, and quick actions. Think of it as your personal study desk.",
    action: "Look at the large card — that is where your daily learning starts.",
    tamilHint: "இதுதான் உங்கள் main learning panel",
  },
  {
    id: "ai-teacher",
    title: "AI Teacher Assistant",
    targetId: "tour-ai-avatar",
    placement: "left",
    body:
      "Your AI teacher lives here. Tap the avatar or chat button to ask questions, get lesson help, or practice speaking.",
    action: "Try clicking the avatar after the tour.",
    tip: "Example: “Explain photosynthesis in simple words.”",
    tamilHint: "இங்குதான் AI teacher உதவும்",
  },
  {
    id: "search",
    title: "Quick Search",
    targetId: "tour-nav-search|tour-home-search",
    placement: "bottom",
    body:
      "Search courses, teachers, or MR5 student IDs from anywhere. On desktop, press Ctrl+K (or ⌘K on Mac) to jump here fast.",
    action: "Click the search bar once to see suggestions.",
    tamilHint: "பாடங்கள், பெயர்கள், MR5 UID — எல்லாம் இங்கே தேடலாம்",
  },
  {
    id: "library",
    title: "Course Library",
    targetId: "tour-nav-library",
    placement: "bottom",
    body:
      "All your courses live in Library. Open a course, pick a lesson, and step into the 3D classroom when you are ready.",
    action: "Click Library in the top menu when you want to browse courses.",
    tamilHint: "இதுதான் course library — உங்கள் பாடங்கள் இங்கே",
  },
  {
    id: "get-started",
    title: "Enter a Class",
    targetId: "tour-get-started|tour-signup",
    placement: "top",
    body:
      "Use Get Started to create your account, or Sign In if you already have one. Then you can join live 3D lessons.",
    action: "Click Get Started when you are ready to begin.",
    tip: "Demo login: student@mr5school.com",
  },
  {
    id: "workflow",
    title: "Simple Learning Flow",
    targetId: "tour-home-search",
    placement: "bottom",
    body:
      "Here is the basic flow: find a course → open a lesson → ask the AI teacher → practice in the 3D room.",
    action: "Search a course name, open it, then chat with your AI teacher.",
    tip: "You can explore advanced settings later — start with one lesson first.",
  },
  {
    id: "finish",
    title: "You Are Ready to Learn",
    placement: "center",
    body:
      "You now know the home screen, AI teacher, search, course library, and how to get started. Explore at your own pace.",
    action: "Click Finish to close the tour and start learning.",
    tip: "Press Esc anytime to skip remaining steps.",
  },
];
