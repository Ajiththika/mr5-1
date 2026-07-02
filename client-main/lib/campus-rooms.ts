import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  UtensilsCrossed,
  Gamepad2,
  Bath,
} from "lucide-react";

export type CampusRoomId = "classroom" | "mensa" | "principal" | "bathroom";

export interface CampusRoom {
  id: CampusRoomId;
  label: string;
  shortLabel: string;
  path: CampusRoomId;
  icon: LucideIcon;
}

export const CAMPUS_ROOMS: CampusRoom[] = [
  {
    id: "classroom",
    label: "Classroom",
    shortLabel: "Class",
    path: "classroom",
    icon: GraduationCap,
  },
  {
    id: "mensa",
    label: "Cafeteria",
    shortLabel: "Café",
    path: "mensa",
    icon: UtensilsCrossed,
  },
  {
    id: "principal",
    label: "Gaming Lounge",
    shortLabel: "Gaming",
    path: "principal",
    icon: Gamepad2,
  },
  {
    id: "bathroom",
    label: "Restroom",
    shortLabel: "Restroom",
    path: "bathroom",
    icon: Bath,
  },
];
