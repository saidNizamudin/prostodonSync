"use client";

import { format } from "date-fns";
import axios from "axios";
import {
  Check,
  HeartHandshake,
  Lightbulb,
  Loader,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/dialog";
import { PanelBody, PanelHeader } from "@/components/panel-chrome";
import { Button } from "./button";
import { useState } from "react";
import toast from "react-hot-toast";

interface Participant {
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
}

interface CategoryType {
  id?: string;
  title?: string;
  instructor?: string;
  slot?: number;
  desc?: string;
  scheduleId?: string;
  participants?: Participant[];
}

type DisplayItem =
  | { type: "solo"; participant: Participant }
  | { type: "couple"; participants: Participant[] };

function getCoupleKey(participant: Participant) {
  if (!participant.couple?.members?.length) return null;
  return participant.couple.members
    .map((member) => member.id)
    .sort()
    .join(":");
}

function groupParticipantsForDisplay(
  participants: Participant[],
): DisplayItem[] {
  const renderedCoupleKeys = new Set<string>();
  const items: DisplayItem[] = [];

  for (const participant of participants) {
    const coupleKey = getCoupleKey(participant);

    if (coupleKey) {
      if (renderedCoupleKeys.has(coupleKey)) continue;
      renderedCoupleKeys.add(coupleKey);

      items.push({
        type: "couple",
        participants: participants.filter(
          (entry) => getCoupleKey(entry) === coupleKey,
        ),
      });
      continue;
    }

    items.push({ type: "solo", participant });
  }

  return items;
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="-mx-1 border-t border-slate-200 px-1 pt-2">
      <p className="text-[11px] font-medium leading-none text-destructive">
        {label}
      </p>
    </div>
  );
}

function getSharedNotes(participants: Participant[]) {
  for (const participant of participants) {
    const trimmed = participant.notes?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

function ParticipantNotes({
  notes,
  isDeleted = false,
}: {
  notes: string;
  isDeleted?: boolean;
}) {
  return (
    <p
      className={`mt-1.5 px-3 border-t border-slate-400 pt-1.5 whitespace-pre-wrap break-words text-xs leading-snug ${
        isDeleted ? "text-slate-400" : "text-slate-700"
      }`}
    >
      {notes}
    </p>
  );
}

function ParticipantItem({
  participant,
  isAdmin,
  deletingIds,
  onDelete,
  onBringBack,
  isDeleted = false,
}: {
  participant: Participant;
  isAdmin: boolean;
  deletingIds: string[];
  onDelete: (peopleId: string, name: string) => void;
  onBringBack: (peopleId: string, name: string) => void;
  isDeleted?: boolean;
}) {
  const isDeleting = deletingIds.includes(participant.id);

  return (
    <div className="flex items-start justify-between gap-2 px-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-px">
          <span
            className={`break-words text-sm font-medium leading-tight ${isDeleted ? "text-slate-400" : "text-slate-900"}`}
          >
            {participant.name}
          </span>
          <time
            dateTime={participant.createdAt}
            className="text-xs tabular-nums leading-tight text-slate-500"
          >
            {format(new Date(participant.createdAt), "dd/MM/yyyy HH:mm:ss")}
          </time>
        </div>
      </div>

      {isAdmin && (
        <div className="flex shrink-0 items-center">
          {isDeleting ? (
            <Loader size={14} className="animate-spin text-slate-400" />
          ) : isDeleted ? (
            <button
              type="button"
              aria-label={`Bring back ${participant.name}`}
              className="rounded p-0.5 text-emerald-600 transition-colors hover:bg-emerald-50"
              onClick={() => onBringBack(participant.id, participant.name)}
            >
              <Check size={16} />
            </button>
          ) : (
            <button
              type="button"
              aria-label={`Delete ${participant.name}`}
              className="rounded p-0.5 text-red-500 transition-colors hover:bg-red-50"
              onClick={() => onDelete(participant.id, participant.name)}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CoupleGroup({
  participants,
  isAdmin,
  deletingIds,
  onDelete,
  onBringBack,
  isDeleted = false,
}: {
  participants: Participant[];
  isAdmin: boolean;
  deletingIds: string[];
  onDelete: (peopleId: string, name: string) => void;
  onBringBack: (peopleId: string, name: string) => void;
  isDeleted?: boolean;
}) {
  const sharedNotes = getSharedNotes(participants);

  return (
    <div
      className={`rounded-lg border py-2 ${
        isDeleted
          ? "border-slate-400 bg-slate-50/80"
          : "border-gray-400 bg-gray-50/60"
      }`}
    >
      <div className="mb-1 flex items-center gap-1 px-3">
        <HeartHandshake className="size-3 shrink-0 text-rose-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-600">
          Couple
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {participants.map((participant) => (
          <ParticipantItem
            key={participant.id}
            participant={participant}
            isAdmin={isAdmin}
            deletingIds={deletingIds}
            onDelete={onDelete}
            onBringBack={onBringBack}
            isDeleted={isDeleted}
          />
        ))}
      </div>

      {sharedNotes && (
        <ParticipantNotes notes={sharedNotes} isDeleted={isDeleted} />
      )}
    </div>
  );
}

function ParticipantList({
  participants,
  isAdmin,
  deletingIds,
  onDelete,
  onBringBack,
  isDeleted = false,
}: {
  participants: Participant[];
  isAdmin: boolean;
  deletingIds: string[];
  onDelete: (peopleId: string, name: string) => void;
  onBringBack: (peopleId: string, name: string) => void;
  isDeleted?: boolean;
}) {
  const items = groupParticipantsForDisplay(participants);

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) =>
        item.type === "couple" ? (
          <CoupleGroup
            key={getCoupleKey(item.participants[0])!}
            participants={item.participants}
            isAdmin={isAdmin}
            deletingIds={deletingIds}
            onDelete={onDelete}
            onBringBack={onBringBack}
            isDeleted={isDeleted}
          />
        ) : (
          <div
            key={item.participant.id}
            className={`rounded-lg border py-2 ${
              isDeleted
                ? "border-slate-400 bg-slate-50/80"
                : "border-gray-400 bg-gray-50/60"
            }`}
          >
            <ParticipantItem
              participant={item.participant}
              isAdmin={isAdmin}
              deletingIds={deletingIds}
              onDelete={onDelete}
              onBringBack={onBringBack}
              isDeleted={isDeleted}
            />
            {item.participant.notes?.trim() && (
              <ParticipantNotes
                notes={item.participant.notes.trim()}
                isDeleted={isDeleted}
              />
            )}
          </div>
        ),
      )}
    </div>
  );
}

export default function ParticipantDialog({
  category,
  mutate,
  isAdmin = false,
  triggerClassName,
}: {
  category: CategoryType;
  mutate: () => void;
  isAdmin?: boolean;
  triggerClassName?: string;
}) {
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const activeParticipants = category.participants?.filter(
    (participant) => !participant.deletedAt,
  );
  const deletedParticipants = category.participants?.filter(
    (participant) => !!participant.deletedAt,
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

  const confirmedParticipants = activeParticipants?.slice(0, category.slot);
  const waitingListParticipants =
    activeParticipants && category.slot
      ? activeParticipants.slice(category.slot)
      : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className={triggerClassName}
          aria-label="View participants"
        >
          <Lightbulb size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent
        hideClose
        className="flex max-h-[min(85dvh,640px)] w-[min(100vw-2rem,28rem)] max-w-none translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl"
      >
        <PanelHeader
          title="Participants"
          description={category.title}
          closeButton={
            <DialogClose className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          }
        />
        <PanelBody>
          {category.participants?.length ? (
            <div className="flex flex-col gap-2">
              <ParticipantList
                participants={confirmedParticipants ?? []}
                isAdmin={isAdmin}
                deletingIds={deletingIds}
                onDelete={handleDelete}
                onBringBack={handleBringBack}
              />

              {waitingListParticipants.length > 0 && (
                <>
                  <SectionDivider label="more participant(s) on waiting list" />
                  <ParticipantList
                    participants={waitingListParticipants}
                    isAdmin={isAdmin}
                    deletingIds={deletingIds}
                    onDelete={handleDelete}
                    onBringBack={handleBringBack}
                  />
                </>
              )}

              {deletedParticipants && deletedParticipants.length > 0 && (
                <>
                  <SectionDivider
                    label={
                      isAdmin
                        ? "more participant(s) that have been deleted"
                        : "more participant(s) that have been deleted, ask admin to bring them back"
                    }
                  />
                  <ParticipantList
                    participants={deletedParticipants}
                    isAdmin={isAdmin}
                    deletingIds={deletingIds}
                    onDelete={handleDelete}
                    onBringBack={handleBringBack}
                    isDeleted
                  />
                </>
              )}
            </div>
          ) : (
            <span className="text-sm font-semibold text-slate-900">
              No participants yet
            </span>
          )}
        </PanelBody>
      </DialogContent>
    </Dialog>
  );
}
