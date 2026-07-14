"use client";

import { Button } from "@/components/button";
import { useCallback, useEffect, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/input-otp";
import { useMediaQuery } from "react-responsive";
import { Skeleton } from "@/components/skeleton";
import {
  ensureAdminCookie,
  readAdminVerifiedFromStorage,
  setAdminVerified,
} from "@/lib/admin-auth";

const headerBoxClass =
  "w-full max-w-sm rounded-xl border border-gray-300 bg-white p-4 shadow-md";

const otpSlotClass = "h-12 w-12 text-lg sm:h-14 sm:w-14";

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const [otp, setOTP] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isWrong, setIsWrong] = useState(false);

  const handleVerify = useCallback((value: string) => {
    if (value === process.env.NEXT_PUBLIC_SECRET_PASSWORD) {
      setAdminVerified();
      setIsVerified(true);
      setIsWrong(false);
    } else {
      setIsWrong(true);
      setOTP("");
    }
  }, []);

  useEffect(() => {
    const verified = readAdminVerifiedFromStorage();
    if (verified) {
      ensureAdminCookie();
    }
    setIsVerified(verified);
  }, []);

  if (isVerified === null) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className={headerBoxClass}>
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="mb-6 h-4 w-full max-w-xs" />
          <Skeleton className="mb-4 h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className={headerBoxClass}>
          <div className="border-b border-gray-200 pb-3">
            <h1 className="text-lg font-semibold text-gray-900">
              Admin access
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Enter your 6-digit PIN to continue
            </p>
          </div>

          <div className="flex flex-col gap-4 py-4">
            <InputOTP
              maxLength={6}
              value={otp}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(value) => {
                setOTP(value);
                if (isWrong) setIsWrong(false);
              }}
              onComplete={handleVerify}
            >
              <InputOTPGroup className="w-full justify-center gap-0">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={
                      isMobile ? `${otpSlotClass} !h-11 !w-11` : otpSlotClass
                    }
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <p
              className={`text-center text-sm ${
                isWrong ? "text-destructive" : "text-gray-500"
              }`}
            >
              {isWrong
                ? "Wrong PIN, please try again"
                : "Enter all 6 digits to continue"}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => handleVerify(otp)}
              disabled={otp.length < 6}
            >
              Verify
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
