import type { LocaleCode } from "./config";

export type MessageKey =
  | "footer.tagline"
  | "footer.home"
  | "footer.courses"
  | "footer.pricing"
  | "footer.instructors"
  | "footer.manifesto"
  | "footer.connect"
  | "footer.avatarStudio"
  | "footer.support"
  | "footer.demo"
  | "footer.language"
  | "footer.rights"
  | "footer.terms"
  | "footer.privacy"
  | "footer.accessibility"
  | "nav.courses"
  | "nav.library"
  | "nav.pricing"
  | "nav.about"
  | "nav.manifesto"
  | "nav.connect"
  | "nav.home"
  | "nav.menu"
  | "nav.tagline"
  | "nav.avatarStudio"
  | "nav.signIn"
  | "nav.startLearning"
  | "nav.profile"
  | "nav.logout"
  | "homepage.title"
  | "homepage.subtitle"
  | "homepage.chatShortcut"
  | "homepage.chatAria"
  | "homepage.searchPlaceholder"
  | "classroom.title"
  | "classroom.studentView"
  | "classroom.teacherView"
  | "classroom.back"
  | "classroom.backShort"
  | "classroom.loading"
  | "classroom.studentHint"
  | "classroom.teacherHint"
  | "classroom.whiteboard"
  | "classroom.startLesson"
  | "classroom.aiTeacher"
  | "classroom.playtime"
  | "classroom.challenges"
  | "classroom.exit"
  | "classroom.wall.fan"
  | "classroom.wall.fanOn"
  | "classroom.wall.fanOff"
  | "classroom.wall.teacher"
  | "classroom.wall.student"
  | "classroom.wall.panel"
  | "classroom.controls.title"
  | "env.roomAtmosphere"
  | "env.comfort";

type MessageTable = Record<MessageKey, string>;

const en: MessageTable = {
  "footer.tagline": "Smart Way to Grow.",
  "footer.home": "Home",
  "footer.courses": "Courses",
  "footer.pricing": "Pricing",
  "footer.instructors": "Instructors",
  "footer.manifesto": "Manifesto",
  "footer.connect": "Connect",
  "footer.avatarStudio": "Avatar Studio",
  "footer.support": "Support",
  "footer.demo": "Get a demo",
  "footer.language": "Language",
  "footer.rights": "All rights reserved.",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.accessibility": "Accessibility",
  "nav.courses": "Courses",
  "nav.library": "Library",
  "nav.pricing": "Pricing",
  "nav.about": "About",
  "nav.manifesto": "Manifesto",
  "nav.connect": "Connect",
  "nav.home": "Home",
  "nav.menu": "Menu",
  "nav.tagline": "Smart Way to Grow",
  "nav.avatarStudio": "Avatar Studio",
  "nav.signIn": "Sign In",
  "nav.startLearning": "Start Learning",
  "nav.profile": "Profile settings",
  "nav.logout": "Log out",
  "homepage.title": "3D Virtual Classroom",
  "homepage.subtitle": "Learn with AI Teachers",
  "homepage.chatShortcut": "Chat with AI",
  "homepage.chatAria": "Open AI study assistant",
  "homepage.searchPlaceholder": "Search courses, lessons, topics...",
  "classroom.title": "Classroom",
  "classroom.studentView": "Student Desk View",
  "classroom.teacherView": "Teacher View",
  "classroom.back": "Back to Campus",
  "classroom.backShort": "Back",
  "classroom.loading": "Loading classroom…",
  "classroom.studentHint": "Seated at your desk · drag to look around",
  "classroom.teacherHint": "Teacher perspective · drag to scan the class",
  "classroom.whiteboard": "Whiteboard",
  "classroom.startLesson": "Start Lesson",
  "classroom.aiTeacher": "AI Teacher",
  "classroom.playtime": "Playtime",
  "classroom.challenges": "Challenges",
  "classroom.exit": "Exit Room",
  "classroom.wall.fan": "Fan",
  "classroom.wall.fanOn": "On",
  "classroom.wall.fanOff": "Off",
  "classroom.wall.teacher": "Teacher",
  "classroom.wall.student": "Student",
  "classroom.wall.panel": "Classroom controls",
  "classroom.controls.title": "Room Controls",
  "env.roomAtmosphere": "Room Atmosphere",
  "env.comfort": "Comfort",
};

const si: MessageTable = {
  ...en,
  "footer.tagline": "ඉගෙනීමේ ස්මාර්ට් මාර්ගය.",
  "footer.home": "මුල් පිටුව",
  "footer.courses": "පාඨමාලා",
  "footer.pricing": "මිල",
  "footer.instructors": "ආචාර්යවරු",
  "footer.manifesto": "ප්‍රකටිපත්‍රය",
  "footer.connect": "සම්බන්ධ වන්න",
  "footer.avatarStudio": "අවතාර ස්ටුඩියෝ",
  "footer.support": "සහාය",
  "footer.demo": "ඩෙමෝ ඉල්ලන්න",
  "footer.language": "භාෂාව",
  "footer.rights": "සියලුම හිමිකම් ඇවිරිණි.",
  "footer.terms": "කොන්දේසි",
  "footer.privacy": "පෞද්ගලිකත්වය",
  "footer.accessibility": "ප්‍රවේශය",
  "nav.library": "පුස්තකාලය",
  "nav.manifesto": "ප්‍රකටිපත්‍රය",
  "nav.connect": "සම්බන්ධ වන්න",
  "nav.home": "මුල් පිටුව",
  "nav.menu": "මෙනුව",
  "nav.tagline": "ඉගෙනීමේ ස්මාර්ට් මාර්ගය",
  "nav.avatarStudio": "අවතාර ස්ටුඩියෝ",
  "nav.profile": "පැතිකඩ සැකසුම්",
  "nav.logout": "පිටවන්න",
  "nav.signIn": "පිවිසෙන්න",
  "nav.startLearning": "ඉගෙනීම ආරම්භ කරන්න",
  "nav.courses": "පාඨමාලා",
  "nav.pricing": "මිල",
  "nav.about": "අප ගැන",
  "homepage.title": "3D අතථ්‍ය පන්ති කාමරය",
  "homepage.subtitle": "AI ගුරුවරුන් සමඟ ඉගෙන ගන්න",
  "homepage.chatShortcut": "AI සමඟ කතා කරන්න",
  "homepage.chatAria": "AI අධ්‍යයන සහායකය විවෘත කරන්න",
  "homepage.searchPlaceholder": "පාඨමාලා, පාඩම්, මාතෘකා සොයන්න...",
  "classroom.title": "පන්ති කාමරය",
  "classroom.studentView": "ශිෂ්‍ය මේස දර්ශනය",
  "classroom.teacherView": "ගුරු දර්ශනය",
  "classroom.back": "කැම්පස් වෙත ආපසු",
  "classroom.backShort": "ආපසු",
  "classroom.loading": "පන්ති කාමරය පූරණය වෙමින්…",
  "classroom.studentHint": "ඔබේ මේසයේ · බලන්න අදින් ඇද දමන්න",
  "classroom.teacherHint": "ගුරු දෘෂ්ටිකෝණය · පන්තිය සොයා බලන්න",
  "classroom.whiteboard": "සුදු පුවරුව",
  "classroom.startLesson": "පාඩම ආරම්භ කරන්න",
  "classroom.aiTeacher": "AI ගුරු",
  "classroom.playtime": "විනෝද වේලාව",
  "classroom.challenges": "අභියෝග",
  "classroom.exit": "කාමරයෙන් පිටවන්න",
  "classroom.wall.fan": "විදුලි පංකාව",
  "classroom.wall.fanOn": "ක්‍රියාත්මක",
  "classroom.wall.fanOff": "නිවා",
  "classroom.wall.teacher": "ගුරු",
  "classroom.wall.student": "ශිෂ්‍ය",
  "classroom.wall.panel": "පන්ති පාලන",
  "classroom.controls.title": "කාමර පාලන",
  "env.roomAtmosphere": "කාමර වාතාවරණය",
  "env.comfort": "සුවපහසුව",
};

const ta: MessageTable = {
  ...en,
  "footer.tagline": "வளர்ச்சிக்கான ஸ்மார்ட் வழி.",
  "footer.home": "முகப்பு",
  "footer.courses": "பாடநெறிகள்",
  "footer.pricing": "விலை",
  "footer.instructors": "ஆசிரியர்கள்",
  "footer.manifesto": "கொள்கை",
  "footer.connect": "தொடர்பு",
  "footer.avatarStudio": "அவதார் ஸ்டுடியோ",
  "footer.support": "ஆதரவு",
  "footer.demo": "டெமோ கோருங்கள்",
  "footer.language": "மொழி",
  "footer.rights": "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
  "footer.terms": "விதிமுறைகள்",
  "footer.privacy": "தனியுரிமை",
  "footer.accessibility": "அணுகல்",
  "nav.library": "நூலகம்",
  "nav.manifesto": "கொள்கை",
  "nav.connect": "தொடர்பு",
  "nav.home": "முகப்பு",
  "nav.menu": "மெனு",
  "nav.tagline": "வளர்ச்சிக்கான ஸ்மார்ட் வழி",
  "nav.avatarStudio": "அவதார் ஸ்டுடியோ",
  "nav.profile": "சுயவிவர அமைப்புகள்",
  "nav.logout": "வெளியேறு",
  "nav.signIn": "உள்நுழை",
  "nav.startLearning": "கற்றலைத் தொடங்கு",
  "nav.courses": "பாடநெறிகள்",
  "nav.pricing": "விலை",
  "nav.about": "எங்களைப் பற்றி",
  "homepage.title": "3D மெய்நிகர் வகுப்பறை",
  "homepage.subtitle": "AI ஆசிரியர்களுடன் கற்றுக்கொள்ளுங்கள்",
  "homepage.chatShortcut": "AI உடன் அரட்டை",
  "homepage.chatAria": "AI படிப்பு உதவியாளரைத் திறக்கவும்",
  "homepage.searchPlaceholder": "பாடங்கள், பாடங்கள், தலைப்புகளைத் தேடுங்கள்...",
  "classroom.title": "வகுப்பறை",
  "classroom.studentView": "மாணவர் மேசை காட்சி",
  "classroom.teacherView": "ஆசிரியர் காட்சி",
  "classroom.back": "வளாகத்திற்குத் திரும்பு",
  "classroom.backShort": "திரும்பு",
  "classroom.loading": "வகுப்பறை ஏற்றுகிறது…",
  "classroom.studentHint": "உங்கள் மேசையில் · சுற்றிப் பார்க்க இழுக்கவும்",
  "classroom.teacherHint": "ஆசிரியர் கண்ணோட்டம் · வகுப்பைப் பாருங்கள்",
  "classroom.whiteboard": "வெள்ளைப்பலகை",
  "classroom.startLesson": "பாடத்தைத் தொடங்கு",
  "classroom.aiTeacher": "AI ஆசிரியர்",
  "classroom.playtime": "விளையாட்டு நேரம்",
  "classroom.challenges": "சவால்கள்",
  "classroom.exit": "வெளியேறு",
  "classroom.wall.fan": "விசிறி",
  "classroom.wall.fanOn": "ஆன்",
  "classroom.wall.fanOff": "ஆஃப்",
  "classroom.wall.teacher": "ஆசிரியர்",
  "classroom.wall.student": "மாணவர்",
  "classroom.wall.panel": "வகுப்பறை கட்டுப்பாடுகள்",
  "classroom.controls.title": "அறை கட்டுப்பாடுகள்",
  "env.roomAtmosphere": "அறை சூழல்",
  "env.comfort": "வசதி",
};

const de: MessageTable = {
  ...en,
  "footer.tagline": "Der smarte Weg zum Wachsen.",
  "footer.home": "Start",
  "footer.courses": "Kurse",
  "footer.pricing": "Preise",
  "footer.instructors": "Dozenten",
  "footer.support": "Support",
  "footer.demo": "Demo anfragen",
  "footer.language": "Sprache",
  "footer.rights": "Alle Rechte vorbehalten.",
  "footer.terms": "AGB",
  "footer.privacy": "Datenschutz",
  "footer.accessibility": "Barrierefreiheit",
  "nav.library": "Bibliothek",
  "nav.manifesto": "Manifest",
  "nav.connect": "Kontakt",
  "nav.home": "Start",
  "nav.menu": "Menü",
  "nav.tagline": "Der smarte Weg zum Wachsen",
  "nav.avatarStudio": "Avatar-Studio",
  "nav.profile": "Profileinstellungen",
  "nav.logout": "Abmelden",
  "nav.signIn": "Anmelden",
  "nav.startLearning": "Lernen starten",
  "nav.courses": "Kurse",
  "nav.pricing": "Preise",
  "nav.about": "Über uns",
  "homepage.title": "3D-Virtuelles Klassenzimmer",
  "homepage.subtitle": "Lernen mit KI-Lehrern",
  "homepage.chatShortcut": "Mit KI chatten",
  "homepage.chatAria": "KI-Lernassistent öffnen",
  "homepage.searchPlaceholder": "Kurse, Lektionen, Themen suchen...",
  "classroom.title": "Klassenzimmer",
  "classroom.studentView": "Schüler-Schreibtischansicht",
  "classroom.teacherView": "Lehreransicht",
  "classroom.back": "Zurück zum Campus",
  "classroom.backShort": "Zurück",
  "classroom.loading": "Klassenzimmer wird geladen…",
  "classroom.studentHint": "Am Schreibtisch · ziehen zum Umschauen",
  "classroom.teacherHint": "Lehrerperspektive · Klasse überblicken",
  "classroom.whiteboard": "Whiteboard",
  "classroom.startLesson": "Lektion starten",
  "classroom.aiTeacher": "KI-Lehrer",
  "classroom.playtime": "Spielzeit",
  "classroom.challenges": "Herausforderungen",
  "classroom.exit": "Raum verlassen",
  "classroom.wall.fan": "Ventilator",
  "classroom.wall.fanOn": "An",
  "classroom.wall.fanOff": "Aus",
  "classroom.wall.teacher": "Lehrer",
  "classroom.wall.student": "Schüler",
  "classroom.wall.panel": "Klassensteuerung",
  "classroom.controls.title": "Raumsteuerung",
  "env.roomAtmosphere": "Raumatmosphäre",
  "env.comfort": "Komfort",
};

const nl: MessageTable = {
  ...en,
  "footer.tagline": "De slimme weg om te groeien.",
  "footer.home": "Home",
  "footer.courses": "Cursussen",
  "footer.pricing": "Prijzen",
  "footer.instructors": "Docenten",
  "footer.support": "Support",
  "footer.demo": "Demo aanvragen",
  "footer.language": "Taal",
  "footer.rights": "Alle rechten voorbehouden.",
  "footer.terms": "Voorwaarden",
  "footer.privacy": "Privacy",
  "footer.accessibility": "Toegankelijkheid",
  "nav.library": "Bibliotheek",
  "nav.manifesto": "Manifest",
  "nav.connect": "Contact",
  "nav.home": "Home",
  "nav.menu": "Menu",
  "nav.tagline": "De slimme weg om te groeien",
  "nav.avatarStudio": "Avatar Studio",
  "nav.profile": "Profielinstellingen",
  "nav.logout": "Uitloggen",
  "nav.signIn": "Inloggen",
  "nav.startLearning": "Start met leren",
  "nav.courses": "Cursussen",
  "nav.pricing": "Prijzen",
  "nav.about": "Over ons",
  "homepage.title": "3D Virtueel Klaslokaal",
  "homepage.subtitle": "Leren met AI-docenten",
  "homepage.chatShortcut": "Chat met AI",
  "homepage.chatAria": "Open AI-studieassistent",
  "homepage.searchPlaceholder": "Zoek cursussen, lessen, onderwerpen...",
  "classroom.title": "Klaslokaal",
  "classroom.studentView": "Leerling bureauweergave",
  "classroom.teacherView": "Docentweergave",
  "classroom.back": "Terug naar campus",
  "classroom.backShort": "Terug",
  "classroom.loading": "Klaslokaal laden…",
  "classroom.studentHint": "Aan je bureau · sleep om rond te kijken",
  "classroom.teacherHint": "Docentperspectief · scan de klas",
  "classroom.whiteboard": "Whiteboard",
  "classroom.startLesson": "Les starten",
  "classroom.aiTeacher": "AI-docent",
  "classroom.playtime": "Speeltijd",
  "classroom.challenges": "Uitdagingen",
  "classroom.exit": "Ruimte verlaten",
  "classroom.wall.fan": "Ventilator",
  "classroom.wall.fanOn": "Aan",
  "classroom.wall.fanOff": "Uit",
  "classroom.wall.teacher": "Docent",
  "classroom.wall.student": "Leerling",
  "classroom.wall.panel": "Klasbesturing",
  "classroom.controls.title": "Ruimtebediening",
  "env.roomAtmosphere": "Ruimsfeer",
  "env.comfort": "Comfort",
};

export const messages: Record<LocaleCode, MessageTable> = { en, si, ta, de, nl };

export function translate(locale: LocaleCode, key: MessageKey): string {
  return messages[locale]?.[key] ?? messages.en[key] ?? key;
}
