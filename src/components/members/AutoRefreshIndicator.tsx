"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefreshIndicator() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          router.refresh();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-brand-dark/90 backdrop-blur border border-brand-gray rounded-full px-3 py-1.5 text-xs text-gray-400">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      Auto Refresh: {secondsLeft}s
    </div>
  );
}
