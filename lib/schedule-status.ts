import { ScheduleStatusEnum } from "@prisma/client";

export type ScheduleMode = "automatic" | "manual_active" | "manual_closed";

export type ScheduleInactiveReason =
  | "manual_closed"
  | "not_yet_open"
  | "registration_ended";

export function getScheduleMode(
  status: ScheduleStatusEnum | null,
): ScheduleMode {
  if (status === ScheduleStatusEnum.ACTIVE) return "manual_active";
  if (status === ScheduleStatusEnum.CLOSED) return "manual_closed";
  return "automatic";
}

export function getIsActive(
  status: ScheduleStatusEnum | null,
  open: Date,
  closed: Date,
  now = new Date(),
): boolean {
  if (status === ScheduleStatusEnum.ACTIVE) return true;
  if (status === ScheduleStatusEnum.CLOSED) return false;
  return now > open && now < closed;
}

export function getInactiveReason(
  status: ScheduleStatusEnum | null,
  open: Date,
  closed: Date,
  now = new Date(),
): ScheduleInactiveReason | null {
  if (getIsActive(status, open, closed, now)) return null;
  if (status === ScheduleStatusEnum.CLOSED) return "manual_closed";
  if (now < open) return "not_yet_open";
  return "registration_ended";
}

export function getScheduleModeLabel(mode: ScheduleMode): string {
  switch (mode) {
    case "manual_active":
      return "Currently forced open";
    case "manual_closed":
      return "Currently forced closed";
    default:
      return "Automatically scheduled";
  }
}

export function getInactiveBadgeLabel(
  reason: ScheduleInactiveReason,
): string {
  switch (reason) {
    case "manual_closed":
      return "Manually closed";
    case "not_yet_open":
      return "Opens soon";
    case "registration_ended":
      return "Registration ended";
  }
}
