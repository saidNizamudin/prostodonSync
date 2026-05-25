"use client";

import AppCard, { CategorySlotMeta } from "./app-card";
import axios from "axios";
import { FormEvent, useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/button";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import toast from "react-hot-toast";
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

const compactInputClass = "h-8 px-2 py-1 text-xs";

export default function ActiveCategoryCard({
  category,
  mutate,
}: {
  category: CategoryType;
  mutate: () => void;
}) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [notes, setNotes] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const activeParticipants = category.participants?.filter(
    (participant) => !participant.deletedAt,
  );
  const slotLeft = (category.slot ?? 0) - (activeParticipants?.length || 0);
  const isFull = slotLeft <= 0;

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (!category.id) return;

    const trimmedName1 = name1.trim();
    if (!trimmedName1) return;

    const toastId = toast.loading("Registering...");
    setIsRegistering(true);

    try {
      await axios.post("/api/register", {
        categoryId: category.id,
        payload: {
          name1: trimmedName1,
          name2: name2.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });

      setName1("");
      setName2("");
      setNotes("");
      toast.success(
        `Successfully registered to ${category.title ?? "this category"}!`,
        { id: toastId },
      );
      mutate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to register", { id: toastId });
    } finally {
      setIsRegistering(false);
    }
  };

  if (
    !category ||
    !category.id ||
    !category.title ||
    !category.instructor ||
    !category.slot
  ) {
    return <AppCard error="Something went wrong with this category" />;
  }

  const formId = `register-${category.id}`;

  return (
    <AppCard
      contentClassName="flex flex-col gap-3"
      ribbonLabel={isFull ? "Full" : "Open"}
      ribbonVariant={isFull ? "full" : "open"}
      title={category.title}
      subtitle={category.instructor}
      description={category.desc ?? undefined}
      footer={
        <div className="flex flex-col gap-2">
          <form
            id={formId}
            onSubmit={handleRegister}
            className="flex flex-col gap-2"
            noValidate
          >
            <div className="flex flex-col gap-1">
              <Label
                htmlFor={`${formId}-name1`}
                className="text-xs text-nowrap"
              >
                Name 1
              </Label>
              <Input
                id={`${formId}-name1`}
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="Your name - Description"
                className={compactInputClass}
                autoComplete="name"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label
                htmlFor={`${formId}-name2`}
                className="text-xs text-nowrap"
              >
                Name 2
              </Label>
              <Input
                id={`${formId}-name2`}
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="Your name - Description"
                className={compactInputClass}
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor={`${formId}-notes`} className="text-xs">
                Notes (Optional)
              </Label>
              <Textarea
                id={`${formId}-notes`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Your notes (if any)"
                className="min-h-0 resize-none px-2 py-1 text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="success"
              disabled={isRegistering || !name1.trim()}
              className="h-9 w-full gap-2 text-xs"
            >
              {isRegistering ? (
                <>
                  <Loader className="size-3.5 animate-spin" />
                  Registering…
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </div>
      }
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
