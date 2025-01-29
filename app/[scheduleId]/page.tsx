/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ActiveCategoryPage from "./active-content";
import ClosedCategoryPage from "./closed-content";
import { format } from "date-fns";

export default function CategoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [openTime, setOpenTime] = useState<Date | null>(null);
  const [shouldSchedule, setShouldSchedule] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { scheduleId } = useParams();

  useEffect(() => {
    async function getStatus() {
      try {
        const { data } = await axios.get(`/api/schedule/${scheduleId}`);

        if (data) {
          const now = new Date();
          setIsActive(data.isActive);
          setShouldSchedule(
            data.status === null &&
              !data.isActive &&
              now.getTime() < new Date(data.open).getTime()
          );
          setOpenTime(new Date(data.open));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    getStatus();
  }, [scheduleId]);

  useEffect(() => {
    if (!shouldSchedule || !openTime) {
      return;
    }

    const now = new Date();
    const timeToOpen = openTime.getTime() - now.getTime();

    const updateCountdown = () => {
      const now = new Date();
      const timeToOpen = openTime.getTime() - now.getTime();
      if (timeToOpen > 0) {
        setTimeLeft(Math.ceil(timeToOpen / 1000));
      } else {
        setTimeLeft(0);
        window.location.reload();
      }
    };

    // Initial update
    updateCountdown();

    // Update countdown every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [openTime, shouldSchedule]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="w-full h-full flex flex-col items-center pt-10">
        {shouldSchedule && timeLeft !== null && (
          <>
            <span className="mb-2">
              Opening on{" "}
              {openTime ? format(openTime, "dd MMMM, yyyy - hh:mm a") : ""}
            </span>
            <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
              <div className="flex flex-col">
                <span className="countdown font-mono text-5xl">
                  <span
                    style={
                      {
                        "--value": Math.floor(timeLeft / 86400),
                      } as React.CSSProperties
                    }
                  />
                </span>
                days
              </div>
              <div className="flex flex-col">
                <span className="countdown font-mono text-5xl">
                  <span
                    style={
                      {
                        "--value": Math.floor((timeLeft % 86400) / 3600),
                      } as React.CSSProperties
                    }
                  />
                </span>
                hours
              </div>
              <div className="flex flex-col">
                <span className="countdown font-mono text-5xl">
                  <span
                    style={
                      {
                        "--value": Math.floor((timeLeft % 3600) / 60),
                      } as React.CSSProperties
                    }
                  />
                </span>
                min
              </div>
              <div className="flex flex-col">
                <span className="countdown font-mono text-5xl">
                  <span
                    style={
                      {
                        "--value": Math.floor(timeLeft % 60),
                      } as React.CSSProperties
                    }
                  />
                </span>
                sec
              </div>
            </div>
          </>
        )}
        <ClosedCategoryPage />
      </div>
    );
  }

  return <ActiveCategoryPage />;
}
