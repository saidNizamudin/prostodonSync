"use client";

import { format } from "date-fns";
import axios from "axios";
import {
  Check,
  HeartHandshake,
  Lightbulb,
  Loader,
  StickyNote,
  Trash2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Button } from "./button";
import { useMediaQuery } from "react-responsive";
import { useState } from "react";
import toast from "react-hot-toast";

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

const ParticipantNotes = ({ notes }: { notes: string }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <StickyNote size={14} color="grey" />
        </TooltipTrigger>
        <TooltipContent>{notes}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ParticipantCouple = ({
  couple,
}: {
  couple: { members: { id: string; name: string }[] };
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <HeartHandshake size={16} color="red" />
        </TooltipTrigger>
        <TooltipContent>
          Couple:{" "}
          {couple.members
            .filter((member) => member.id !== couple.members[0].id)
            .map((member) => member.name)
            .join(", ")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function ParticipantPopover({
  category,
  mutate,
  isAdmin = false,
}: {
  category: CategoryType;
  mutate: () => void;
  isAdmin?: boolean;
}) {
  const isMobile = useMediaQuery({ query: "(max-width: 550px)" });
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const activeParticipants = category.participants?.filter(
    (participant) => !participant.deletedAt
  );
  const deletedParticipants = category.participants?.filter(
    (participant) => !!participant.deletedAt
  );

  const handleDelete = async (peopleId: string, name: string) => {
    const toastId = toast.loading(`Deleting ${name}`);
    try {
      setDeletingIds((prev) => [...prev, peopleId]);
      await axios.post("/api/register/delete", {
        peopleId,
        type: "delete",
      });

      toast.success(`Successfully deleted ${name}`, {
        id: toastId,
      });
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete ${name}`, { id: toastId });
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== peopleId));
      mutate();
    }
  };

  const handleBringBack = async (peopleId: string, name: string) => {
    const toastId = toast.loading(`Bringing back ${name}`);
    try {
      setDeletingIds((prev) => [...prev, peopleId]);
      await axios.post("/api/register/delete", {
        peopleId,
        type: "bring-back",
      });

      toast.success(`Successfully brought back ${name}`, {
        id: toastId,
      });
    } catch (error) {
      console.error(error);
      toast.error(`Failed to bring back ${name}`, { id: toastId });
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== peopleId));
      mutate();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"}>
          <Lightbulb size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-max max-w-[400px] p-5 max-h-[400px] overflow-y-auto"
        align="end"
      >
        {category.participants?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">Participants</span>
            <div className="flex flex-col gap-3">
              {activeParticipants
                ?.slice(0, category.slot)
                .map((participant) => (
                  <div
                    className="flex items-center justify-between gap-5"
                    key={participant.id}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-preety break-all">
                        {participant.name}
                      </span>
                      {participant.notes && !isMobile && (
                        <ParticipantNotes notes={participant.notes} />
                      )}
                      {!!participant.couple && !isMobile && (
                        <ParticipantCouple couple={participant.couple} />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-nowrap text-black/60">
                        {format(
                          new Date(participant.createdAt),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
                      </span>
                      {isAdmin ? (
                        deletingIds.includes(participant.id) ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Trash2
                            size={16}
                            color="red"
                            className="cursor-pointer"
                            onClick={() =>
                              handleDelete(participant.id, participant.name)
                            }
                          />
                        )
                      ) : null}
                    </div>
                  </div>
                ))}
              {activeParticipants &&
              category.slot &&
              activeParticipants.length > category.slot ? (
                <div>
                  <hr
                    className="my-2 h-2 border-black"
                    style={{
                      marginInline: -20,
                    }}
                  />
                  <p className="text-xs text-destructive leading-none w-full mb-2">
                    * more participant(s) on waiting list
                  </p>
                  <div className="flex flex-col gap-3">
                    {category.participants
                      .filter((participant) => !participant.deletedAt)
                      .slice(category.slot)
                      .map((participant) => (
                        <div
                          className="flex items-center justify-between gap-5"
                          key={participant.id}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-pretty break-all">
                              {participant.name}
                            </span>
                            {participant.notes && !isMobile && (
                              <ParticipantNotes notes={participant.notes} />
                            )}
                            {!!participant.couple && !isMobile && (
                              <ParticipantCouple couple={participant.couple} />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-nowrap text-black/60">
                              {format(
                                new Date(participant.createdAt),
                                "dd/MM/yyyy HH:mm:ss"
                              )}
                            </span>
                            {isAdmin ? (
                              deletingIds.includes(participant.id) ? (
                                <Loader size={16} className="animate-spin" />
                              ) : (
                                <Trash2
                                  size={16}
                                  color="red"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleDelete(
                                      participant.id,
                                      participant.name
                                    )
                                  }
                                />
                              )
                            ) : null}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
              {deletedParticipants && deletedParticipants.length ? (
                <div>
                  <hr
                    className="my-2 h-2 border-black"
                    style={{
                      marginInline: -20,
                    }}
                  />
                  <p className="text-xs text-destructive leading-none w-full mb-2">
                    {isAdmin
                      ? "* more participant(s) that have been deleted"
                      : "* more participant(s) that have been deleted, ask admin to bring them back"}
                  </p>
                  <div className="flex flex-col gap-3">
                    {deletedParticipants.map((participant) => (
                      <div
                        className="flex items-center justify-between gap-5"
                        key={participant.id}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-pretty break-all">
                            {participant.name}
                          </span>
                          {participant.notes && !isMobile && (
                            <ParticipantNotes notes={participant.notes} />
                          )}
                          {!!participant.couple && !isMobile && (
                            <ParticipantCouple couple={participant.couple} />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-nowrap text-black/60">
                            {format(
                              new Date(participant.createdAt),
                              "dd/MM/yyyy HH:mm:ss"
                            )}
                          </span>
                          {isAdmin ? (
                            deletingIds.includes(participant.id) ? (
                              <Loader size={16} className="animate-spin" />
                            ) : (
                              <Check
                                size={16}
                                color="green"
                                className="cursor-pointer"
                                onClick={() =>
                                  handleBringBack(
                                    participant.id,
                                    participant.name
                                  )
                                }
                              />
                            )
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <span className="text-lg font-semibold">No participants yet</span>
        )}
      </PopoverContent>
    </Popover>
  );
}
