/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Lightbulb, StickyNote, TriangleAlert } from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import useSWR from "swr";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { useMediaQuery } from "react-responsive";
import ClosedCategoryCard from "@/components/closed-ctg-card";

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

export default function ClosedCategoryPage() {
  const isMobile = useMediaQuery({ query: "(max-width: 500px)" });
  const { scheduleId } = useParams();

  const { data, isLoading, mutate } = useSWR<CategoryType[]>(
    "/api/category",
    async (link: string) => {
      try {
        const { data } = await axios.get(link, {
          params: {
            scheduleId,
          },
        });
        return data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch data");
      }
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col p-5 mx-auto container items-center justify-center gap-5">
        <Alert variant={"destructive"} className="w-full">
          <div className="flex items-center gap-3">
            <TriangleAlert size={24} />
            <div className="flex flex-col w-full">
              <AlertTitle className="text-lg font-semibold leading-none tracking-tight">
                This is a closed schedule
              </AlertTitle>
              <AlertDescription>
                You cannot register for any categories at this time. You can
                still view the categories and participants.
              </AlertDescription>
            </div>
          </div>
        </Alert>
        <div className="flex flex-col w-full gap-5 items-center justify-center">
          {data?.map((category) => {
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
                  className="flex border border-gray-300 rounded-md p-5 w-full h-[200px] justify-center items-center cursor-not-allowed shadow-lg"
                >
                  <span className="text-xl font-semibold leading-tight">
                    Something went wrong with this category
                  </span>
                </div>
              );
            }

            const activeParticipants = category.participants?.filter(
              (participant) => !participant.deletedAt
            );
            const slotLeft = category.slot - (activeParticipants?.length || 0);

            return (
              <div key={category.id} className="flex flex-col w-full">
                <div className="flex flex-col border border-gray-300 rounded-md p-5 w-full h-[220px] shadow-lg">
                  <span className="text-xl font-semibold leading-tight">
                    {category.title}
                  </span>
                  <span className="flex items-center gap-2 text-base font-semibold leading-none">
                    {`INSTRUKTUR: ${category.instructor}`}
                  </span>
                  <span className="text-sm text-black/80 mb-auto overflow-hidden text-ellipsis line-clamp-2 mt-2">
                    {category.desc}
                  </span>
                  <div className="flex justify-between mt-5 items-end gap-2">
                    <div className="flex flex-col gap-2">
                      <Badge className="w-max mt-auto">
                        {category.slot} slots open
                      </Badge>
                      <Badge
                        className="w-max mt-auto"
                        variant={slotLeft > 0 ? "success" : "destructive"}
                      >
                        {slotLeft > 0 ? `${slotLeft} slots left` : "Full"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size={"icon"}>
                            <Lightbulb size={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[250px] p-5 max-h-[400px] overflow-y-auto"
                          align="end"
                        >
                          {category.participants?.length ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-lg font-semibold">
                                Participants
                              </span>
                              <div className="flex flex-col gap-2">
                                {category.participants
                                  .slice(0, category.slot)
                                  .map((participant) => (
                                    <div
                                      className="flex flex-col items-start"
                                      key={participant.id}
                                    >
                                      <span className="text-sm">
                                        {participant.name}
                                      </span>
                                      <span className="text-xs text-black/60">
                                        {format(
                                          new Date(participant.createdAt),
                                          "dd/MM/yyyy HH:mm:ss"
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                {category.participants.length >
                                  category.slot && (
                                  <>
                                    <hr
                                      className="my-2 h-2 border-black"
                                      style={{
                                        marginInline: -20,
                                      }}
                                    />
                                    <span className="text-xs text-destructive leading-none w-full">
                                      * more participant(s) on waiting list
                                    </span>
                                    {category.participants
                                      .slice(category.slot)
                                      .map((participant) => (
                                        <div
                                          className="flex flex-col items-start"
                                          key={participant.id}
                                        >
                                          <span className="text-sm">
                                            {participant.name}
                                          </span>
                                          <span className="text-xs text-black/60">
                                            {format(
                                              new Date(participant.createdAt),
                                              "dd/MM/yyyy HH:mm:ss"
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-lg font-semibold">
                              No participants yet
                            </span>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 mx-auto container items-center justify-center gap-5">
      <Alert variant={"destructive"} className="w-full max-w-max">
        <div className="flex items-center gap-3">
          <TriangleAlert size={24} />
          <div className="flex flex-col">
            <AlertTitle className="text-lg font-semibold leading-none tracking-tight">
              This is a closed schedule
            </AlertTitle>
            <AlertDescription>
              You cannot register for any categories at this time. You can still
              view the categories and participants.
            </AlertDescription>
          </div>
        </div>
      </Alert>
      <div className="flex flex-wrap w-full overflow-auto gap-5 items-center justify-center">
        {data?.map((category) => {
          return (
            <ClosedCategoryCard
              key={category.id}
              category={category}
              mutate={mutate}
            />
          );
        })}
      </div>
    </div>
  );
}
