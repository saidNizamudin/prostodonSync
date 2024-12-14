"use client";

import { Button } from "@/components/button";
import { ArrowLeftCircle, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full flex justify-start gap-5 items-center px-5 h-20 border-b">
        <Button
          className="flex items-center"
          onClick={() => {
            router.push("/");
          }}
        >
          <ArrowLeftCircle size={24} />
          <span className="font-medium">Go back to home</span>
        </Button>
        <Button
          className="flex items-center"
          onClick={() => {
            router.push("/schedule");
          }}
        >
          <Calendar size={24} />
          <span className="font-medium">Go back to schedule</span>
        </Button>
      </div>
      <div className="w-full h-[calc(100%-80px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
