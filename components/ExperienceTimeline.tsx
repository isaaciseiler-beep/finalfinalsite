// components/ExperienceTimeline.tsx — unchanged, for compatibility
"use client";

import ExperienceDeck from "@/components/ExperienceDeck";

export default function ExperienceTimeline({
  fanOutKey,
  activeYear,
  onActiveYearChange,
}: {
  fanOutKey: string;
  activeYear?: string;
  onActiveYearChange?: (year: string) => void;
}) {
  return (
    <ExperienceDeck
      mode="timeline"
      fanOutKey={fanOutKey}
      activeYear={activeYear}
      onActiveYearChange={onActiveYearChange}
    />
  );
}
