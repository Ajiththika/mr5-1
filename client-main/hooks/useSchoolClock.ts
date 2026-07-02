"use client";

import { useClassroomEnvironment } from "@/contexts/ClassroomEnvironmentContext";

export type SchoolClockAngles = {
  hour: number;
  minute: number;
  second: number;
};

export function getSchoolTimeParts(timezone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  return {
    hour: Number(parts.find((p) => p.type === "hour")?.value ?? 0),
    minute: Number(parts.find((p) => p.type === "minute")?.value ?? 0),
    second: Number(parts.find((p) => p.type === "second")?.value ?? 0),
  };
}

export function getSchoolClockAngles(timezone: string, date = new Date()): SchoolClockAngles {
  const { hour, minute, second } = getSchoolTimeParts(timezone, date);
  return {
    second: (second / 60) * Math.PI * 2,
    minute: (minute / 60) * Math.PI * 2 + (second / 3600) * Math.PI * 2,
    hour: ((hour % 12) / 12) * Math.PI * 2 + (minute / 720) * Math.PI * 2,
  };
}

export function useSchoolClockAngles(date = new Date()): SchoolClockAngles {
  const { timezone } = useClassroomEnvironment();
  return getSchoolClockAngles(timezone, date);
}
