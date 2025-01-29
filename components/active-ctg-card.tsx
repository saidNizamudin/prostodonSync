"use client";

import { Badge } from "./badge";
import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/button";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import toast from "react-hot-toast";
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

export default function ActiveCategoryCard({
  category,
  mutate,
}: {
  category: CategoryType;
  mutate: () => void;
}) {
  const isMobile = useMediaQuery({ query: "(max-width: 550px)" });

  const [formData, setFormData] = useState<{
    [key: string]: { name1: string; name2?: string; notes?: string };
  }>({});
  const [registerIds, setRegisterIds] = useState<string[]>([]);

  const activeParticipants = category.participants?.filter(
    (participant) => !participant.deletedAt
  );
  const slotLeft = (category.slot ?? 0) - (activeParticipants?.length || 0);

  const handleRegister = async (payload: {
    name1: string;
    name2?: string;
    notes?: string;
    category: string;
  }) => {
    const toastId = toast.loading("Registering...");
    setFormData((prev) => ({
      ...prev,
      [payload.category]: {
        name1: "",
        name2: "",
        notes: "",
      },
    }));
    try {
      setRegisterIds((prev) => [...prev, payload.category]);
      const { name1, name2, notes, category: categoryId } = payload;
      await axios.post("/api/register", {
        categoryId: categoryId,
        payload: {
          name1,
          name2,
          notes,
        },
      });

      toast.success(`Successfully registered to ${category.title ?? "this"}!`, {
        id: toastId,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to register", { id: toastId });
    } finally {
      setRegisterIds((prev) => prev.filter((id) => id !== payload.category));
      mutate();
    }
  };

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
        } h-[550px]`}
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
        <hr
          className="my-5 h-2 border-black"
          style={{
            marginInline: -20,
          }}
        />
        <div className="flex items-end gap-2">
          <div className="w-full space-y-2">
            <div className="w-full">
              <Label className="text-nowrap">Name 1</Label>
              <Input
                value={formData[category.id]?.name1 || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [category.id as string]: {
                      ...formData[category.id as string],
                      name1: e.target.value,
                    },
                  })
                }
                placeholder="Your name - Description"
              />
            </div>
            <div className="w-full">
              <Label className="text-nowrap">Name 2</Label>
              <Input
                value={formData[category.id]?.name2 || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [category.id as string]: {
                      ...formData[category.id as string],
                      name2: e.target.value,
                    },
                  })
                }
                placeholder="Your name - Description"
              />
            </div>
            <div className="w-full">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={formData[category.id]?.notes || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [category.id as string]: {
                      ...formData[category.id as string],
                      notes: e.target.value,
                    },
                  })
                }
                rows={3}
                placeholder="Your notes (if any)"
                style={{ resize: "none" }}
              />
            </div>
          </div>
          <Button
            onClick={() => {
              if (!category.id) return;
              handleRegister({
                name1: formData[category.id]?.name1?.trim() || "",
                name2: formData[category.id]?.name2?.trim() || "",
                notes: formData[category.id]?.notes?.trim() || "",
                category: category.id,
              });
            }}
            className="w-[100px]"
            variant={"success"}
            disabled={
              registerIds.includes(category.id) || !formData[category.id]?.name1
            }
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
