"use client";

import { Badge } from "./badge";
import ParticipantPopover from "./participant-popover";
import { useMediaQuery } from "react-responsive";

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
  const isMobile = useMediaQuery({ query: "(max-width: 550px)" });
  const activeParticipants = category.participants?.filter(
    (participant) => !participant.deletedAt
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
      <div
        key={category.id}
        className={`flex border border-gray-300 rounded-md p-5 ${
          isMobile ? "w-full" : "w-[500px]"
        } h-[200px] justify-center items-center cursor-not-allowed`}
      >
        <span className="text-xl font-semibold leading-tight">
          Something went wrong with this category
        </span>
      </div>
    );
  }
  return (
    <div key={category.id} className={`flex flex-col ${isMobile && "w-full"}`}>
      {slotLeft <= 0 ? (
        <span className="text-xs text-center text-destructive leading-none w-full">
          {isMobile
            ? "* Eventhough its full, you can still register"
            : "* Eventhough its full, you can still register and you will be added to the waiting list."}
        </span>
      ) : (
        <span className="text-xs leading-none text-white">.</span>
      )}
      <div
        className={`flex flex-col border border-input rounded-md p-5 ${
          isMobile ? "w-full" : "w-[500px]"
        } h-[220px]`}
      >
        <span className="text-xl font-semibold leading-tight">
          {category.title}
        </span>
        <span className="flex items-center gap-2 text-base font-semibold leading-none">
          {`INSTRUKTUR: ${category.instructor}`}
        </span>
        <span
          className={`text-sm text-black/80 mb-auto overflow-hidden text-ellipsis mt-2 ${
            isMobile ? "line-clamp-2" : "line-clamp-4"
          }`}
        >
          {category.desc}
        </span>
        <div className="flex justify-between mt-5 items-end gap-2">
          <div className="flex flex-col gap-2">
            <Badge className="w-max mt-auto">{category.slot} slots open</Badge>
            <Badge
              className="w-max mt-auto"
              variant={slotLeft > 0 ? "success" : "destructive"}
            >
              {slotLeft > 0 ? `${slotLeft} slots left` : "Full"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <ParticipantPopover category={category} mutate={mutate} />
          </div>
        </div>
      </div>
    </div>
  );
}
