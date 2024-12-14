"use client";

import { Button } from "@/components/button";
import { ArrowLeftCircle, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/input-otp";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [otp, setOTP] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const handleVerify = () => {
    if (otp === process.env.NEXT_PUBLIC_SECRET_PASSWORD) {
      window.sessionStorage.setItem("verified", "true");
      setIsVerified(true);
    } else {
      setIsWrong(true);
    }
  };

  useEffect(() => {
    const verified = window.sessionStorage.getItem("verified") === "true";
    setIsVerified(verified);
  }, []);

  if (!isVerified) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="flex flex-col">
          <span className="text-base font-semibold mb-1">Password</span>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOTP(value);
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <span
            className={`text-base font-normal mt-2 ${
              isWrong && "text-destructive"
            }`}
          >
            {isWrong
              ? "Wrong password, please try again"
              : "Please enter the password to verify"}
          </span>
          <Button size={"lg"} className="mt-4" onClick={handleVerify}>
            Verify
          </Button>
        </div>
      </div>
    );
  }

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
            router.push("/admin");
          }}
        >
          <Calendar size={24} />
          <span className="font-medium">Go back to schedule list</span>
        </Button>
      </div>
      <div className="w-full h-[calc(100%-80px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
