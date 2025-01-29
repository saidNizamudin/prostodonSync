"use client";

import { Button } from "@/components/button";
import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-[calc(100%+40px)] flex justify-start gap-5 items-center px-5 h-20 -mx-5 -mt-5 border-b border-input">
        <Button
          className="flex items-center"
          onClick={() => {
            router.push("/");
          }}
        >
          <ArrowLeftCircle size={24} />
          <span className="font-medium">Go back to home</span>
        </Button>
        <span className="ml-auto">
          Created by{" "}
          <Link
            className="underline"
            href="https://said-nizamudin.netlify.app/"
          >
            @Bingbong
          </Link>
        </span>
      </div>
      <div className="w-[calc(100%+40px)] -mx-5 h-full -mb-5 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
