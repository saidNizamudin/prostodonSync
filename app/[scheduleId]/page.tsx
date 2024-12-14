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
  const { scheduleId } = useParams();

  useEffect(() => {
    async function getStatus() {
      try {
        const { data } = await axios.get(`/api/schedule/${scheduleId}`);

        if (data) {
          setIsActive(data.status === "ACTIVE");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    getStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!isActive) {
    return <ClosedCategoryPage />;
  }

  return <ActiveCategoryPage />;
}
