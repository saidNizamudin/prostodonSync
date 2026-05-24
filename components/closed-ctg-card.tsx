"use client";

import AppCard, { CategorySlotMeta } from "./app-card";
import ParticipantDialog from "./participant-dialog";

interface CategoryType {
  id?: string;
  title?: string;
  instructor?: string;
  slot?: number;
  desc?: string;
  scheduleId?: string;
  participants?: {
    id: string;
    name: string;
    notes?: string;
    couple?: {
      members: {
        id: string;
        name: string;
      }[];
    };
    createdAt: string;
    deletedAt?: string;
  }[];
}

export default function ClosedCategoryCard({
  category,
  mutate,
}: {
  category: CategoryType;
  mutate: () => void;
}) {
  const activeParticipants = category.participants?.filter(
    (participant) => !participant.deletedAt,
  );
  const slotLeft = (category.slot ?? 0) - (activeParticipants?.length || 0);

  if (
    !category ||
    !category.id ||
    !category.title ||
    !category.instructor ||
    !category.slot
  ) {
    return (
      <AppCard error="Something went wrong with this category" />
    );
  }

  return (
    <AppCard
      ribbonLabel="Registration closed"
      ribbonVariant="closed"
      title={category.title}
      subtitle={category.instructor}
      description={category.desc ?? undefined}
      actions={
        <ParticipantDialog
          category={category}
          mutate={mutate}
          triggerClassName="min-w-0 flex-1 rounded-none"
        />
      }
    >
      <CategorySlotMeta slotLeft={slotLeft} slot={category.slot} />
    </AppCard>
  );
}
