/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ActiveCategoryPage from "./active-content";
import ClosedCategoryPage from "./closed-content";

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
          setIsActive(data.isActive);
          setShouldSchedule(data.status === null && !data.isActive);
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
      <div className="w-full h-full flex flex-col items-center pt-5">
        {shouldSchedule && timeLeft !== null && (
          <div className="text-center">
            <p>Opening in {timeLeft} seconds...</p>
          </div>
        )}
        <ClosedCategoryPage />
      </div>
    );
  }

  return <ActiveCategoryPage />;
}
