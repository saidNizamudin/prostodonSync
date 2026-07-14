export enum ScheduleStatusEnum {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export enum ScheduleTypeEnum {
  PROSTHODONTIST = "PROSTHODONTIST",
  MAKSILOFASIAL = "MAKSILOFASIAL",
}

export interface Schedule {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  date: string;
  desc: string | null;
  status: ScheduleStatusEnum | null;
  open: string;
  closed: string;
  type: ScheduleTypeEnum;
}

export interface Category {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  instructor: string;
  slot: number;
  desc: string | null;
  scheduleId: string;
}

export interface People {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  notes: string | null;
  categoryId: string;
  coupleId: string | null;
}

export interface Couple {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Instructor {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  type: ScheduleTypeEnum;
}

export interface ScheduleWithMeta extends Schedule {
  isActive: boolean;
  _count?: {
    categories: number;
  };
}

export interface Participant {
  id: string;
  name: string;
  notes?: string | null;
  couple?: {
    members: {
      id: string;
      name: string;
    }[];
  };
  createdAt: string;
  deletedAt?: string | null;
}

export interface CategoryWithParticipants extends Category {
  participants?: Participant[];
}
