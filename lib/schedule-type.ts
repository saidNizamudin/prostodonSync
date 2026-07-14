import { ScheduleTypeEnum } from "@/lib/types";

export const SCHEDULE_TYPE_SLUGS = ["prosthodontist", "maksilofasial"] as const;
export type ScheduleTypeSlug = (typeof SCHEDULE_TYPE_SLUGS)[number];

export function isScheduleTypeSlug(value: string): value is ScheduleTypeSlug {
  return SCHEDULE_TYPE_SLUGS.includes(value as ScheduleTypeSlug);
}

export function slugToType(slug: ScheduleTypeSlug): ScheduleTypeEnum {
  return slug === "prosthodontist"
    ? ScheduleTypeEnum.PROSTHODONTIST
    : ScheduleTypeEnum.MAKSILOFASIAL;
}

export function typeToSlug(type: ScheduleTypeEnum): ScheduleTypeSlug {
  return type === ScheduleTypeEnum.PROSTHODONTIST
    ? "prosthodontist"
    : "maksilofasial";
}

export function getTypeLabel(type: ScheduleTypeEnum): string {
  return type === ScheduleTypeEnum.PROSTHODONTIST
    ? "Prostodonsia"
    : "Bedah Mulut";
}

export function parseScheduleTypeParam(
  value: string | null,
): ScheduleTypeEnum | null {
  if (!value) return null;

  const normalized = value.toUpperCase();
  if (normalized === ScheduleTypeEnum.PROSTHODONTIST) {
    return ScheduleTypeEnum.PROSTHODONTIST;
  }
  if (normalized === ScheduleTypeEnum.MAKSILOFASIAL) {
    return ScheduleTypeEnum.MAKSILOFASIAL;
  }

  if (isScheduleTypeSlug(value.toLowerCase())) {
    return slugToType(value.toLowerCase() as ScheduleTypeSlug);
  }

  return null;
}
