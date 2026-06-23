import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  UtensilsCrossed,
  Building2,
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
    label: "Principal Office",
    shortLabel: "Office",
    path: "principal",
    icon: Building2,
  },
  {
    id: "bathroom",
    label: "Restroom",
    shortLabel: "Restroom",
    path: "bathroom",
    icon: Bath,
  },
];
