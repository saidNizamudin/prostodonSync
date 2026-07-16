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
import { Skeleton } from "@/components/skeleton";
import { Button } from "./button";
import { useState } from "react";
import toast from "react-hot-toast";
import type { CategoryWithParticipants, Participant } from "@/lib/types";

type CategoryType = CategoryWithParticipants;

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

function SectionDivider({
  label,
  action,
}: {
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="-mx-1 flex items-center justify-between gap-2 border-t border-slate-200 px-1 pt-2">
      <p className="text-[11px] font-medium leading-none text-destructive">
        {label}
      </p>
      {action}
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
  onSoftDelete,
  onHardDelete,
  onBringBack,
  isDeleted = false,
}: {
  participant: Participant;
  isAdmin: boolean;
  deletingIds: string[];
  onSoftDelete: (peopleId: string, name: string) => void;
  onHardDelete: (peopleId: string, name: string) => void;
  onBringBack: (peopleId: string, name: string) => void;
  isDeleted?: boolean;
}) {
  const isDeleting = deletingIds.includes(participant.id);

  return (
    <div className="flex items-center justify-between gap-2 px-3">
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
        <div className="flex shrink-0 items-center gap-0.5">
          {isDeleting ? (
            <Loader size={14} className="animate-spin text-slate-400" />
          ) : isDeleted ? (
            <>
              <button
                type="button"
                aria-label={`Bring back ${participant.name}`}
                className="rounded-full p-1 text-emerald-600 transition-colors hover:bg-emerald-100"
                onClick={() => onBringBack(participant.id, participant.name)}
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                aria-label={`Permanently delete ${participant.name}`}
                className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-100"
                onClick={() => {
                  if (
                    confirm(
                      `Permanently delete ${participant.name}? This cannot be undone.`,
                    )
                  ) {
                    onHardDelete(participant.id, participant.name);
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              aria-label={`Delete ${participant.name}`}
              className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-100"
              onClick={() => onSoftDelete(participant.id, participant.name)}
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
  onSoftDelete,
  onHardDelete,
  onBringBack,
  isDeleted = false,
}: {
  participants: Participant[];
  isAdmin: boolean;
  deletingIds: string[];
  onSoftDelete: (peopleId: string, name: string) => void;
  onHardDelete: (peopleId: string, name: string) => void;
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
            onSoftDelete={onSoftDelete}
            onHardDelete={onHardDelete}
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
  onSoftDelete,
  onHardDelete,
  onBringBack,
  isDeleted = false,
}: {
  participants: Participant[];
  isAdmin: boolean;
  deletingIds: string[];
  onSoftDelete: (peopleId: string, name: string) => void;
  onHardDelete: (peopleId: string, name: string) => void;
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
            onSoftDelete={onSoftDelete}
            onHardDelete={onHardDelete}
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
              onSoftDelete={onSoftDelete}
              onHardDelete={onHardDelete}
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

function ParticipantListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-1" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-gray-50/60 px-3 py-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
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
  mutate: () => void | Promise<unknown>;
  isAdmin?: boolean;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isHardDeletingAll, setIsHardDeletingAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeParticipants = category.participants?.filter(
    (participant) => !participant.deletedAt,
  );
  const deletedParticipants = category.participants?.filter(
    (participant) => !!participant.deletedAt,
  );

  const refreshParticipants = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSoftDelete = async (peopleId: string, name: string) => {
    const toastId = toast.loading(`Deleting ${name}`);
    try {
      setDeletingIds((prev) => [...prev, peopleId]);
      await axios.post("/api/register/delete", {
        peopleId,
        type: "delete",
      });

      toast.success(`Successfully deleted ${name}`, { id: toastId });
      await refreshParticipants();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete ${name}`, { id: toastId });
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== peopleId));
    }
  };

  const handleHardDelete = async (peopleId: string, name: string) => {
    const toastId = toast.loading(`Permanently deleting ${name}`);
    try {
      setDeletingIds((prev) => [...prev, peopleId]);
      await axios.post("/api/register/delete", {
        peopleId,
        type: "hard-delete",
      });

      toast.success(`Permanently deleted ${name}`, { id: toastId });
      await refreshParticipants();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to permanently delete ${name}`, { id: toastId });
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== peopleId));
    }
  };

  const handleHardDeleteAll = async () => {
    const ids = deletedParticipants?.map((participant) => participant.id) ?? [];
    if (ids.length === 0) return;

    if (
      !confirm(
        `Permanently delete all ${ids.length} soft-deleted participant(s)? This cannot be undone.`,
      )
    ) {
      return;
    }

    const toastId = toast.loading("Permanently deleting all...");
    try {
      setIsHardDeletingAll(true);
      setDeletingIds((prev) => [...new Set([...prev, ...ids])]);

      // Sequential to avoid couple-delete races
      for (const peopleId of ids) {
        await axios.post("/api/register/delete", {
          peopleId,
          type: "hard-delete",
        });
      }

      toast.success("Permanently deleted all soft-deleted participants", {
        id: toastId,
      });
      await refreshParticipants();
    } catch (error) {
      console.error(error);
      toast.error("Failed to permanently delete all", { id: toastId });
    } finally {
      setIsHardDeletingAll(false);
      setDeletingIds((prev) => prev.filter((id) => !ids.includes(id)));
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
      await refreshParticipants();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to bring back ${name}`, { id: toastId });
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== peopleId));
    }
  };

  const confirmedParticipants = activeParticipants?.slice(0, category.slot);
  const waitingListParticipants =
    activeParticipants && category.slot
      ? activeParticipants.slice(category.slot)
      : [];

  const skeletonCount = Math.max(
    1,
    Math.min(category.participants?.length ?? 3, 5),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Keep dialog mounted/open while refetching after mutations
        if (isRefreshing && !nextOpen) return;
        setOpen(nextOpen);
      }}
    >
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
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <PanelHeader
          title="Participants"
          description={category.title}
          closeButton={
            <DialogClose
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isRefreshing}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          }
        />
        <PanelBody>
          {isRefreshing ? (
            <ParticipantListSkeleton count={skeletonCount} />
          ) : category.participants?.length ? (
            <div className="flex flex-col gap-2">
              <ParticipantList
                participants={confirmedParticipants ?? []}
                isAdmin={isAdmin}
                deletingIds={deletingIds}
                onSoftDelete={handleSoftDelete}
                onHardDelete={handleHardDelete}
                onBringBack={handleBringBack}
              />

              {waitingListParticipants.length > 0 && (
                <>
                  <SectionDivider label="more participant(s) on waiting list" />
                  <ParticipantList
                    participants={waitingListParticipants}
                    isAdmin={isAdmin}
                    deletingIds={deletingIds}
                    onSoftDelete={handleSoftDelete}
                    onHardDelete={handleHardDelete}
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
                    action={
                      isAdmin ? (
                        <button
                          type="button"
                          disabled={isHardDeletingAll || isRefreshing}
                          className="shrink-0 rounded bg-red-500 px-1.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                          onClick={handleHardDeleteAll}
                        >
                          {isHardDeletingAll
                            ? "Deleting..."
                            : "Delete all permanently"}
                        </button>
                      ) : undefined
                    }
                  />
                  <ParticipantList
                    participants={deletedParticipants}
                    isAdmin={isAdmin}
                    deletingIds={deletingIds}
                    onSoftDelete={handleSoftDelete}
                    onHardDelete={handleHardDelete}
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
