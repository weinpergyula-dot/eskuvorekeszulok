"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lebegő elem, ami csak akkor csúszik be, amikor a látogató először lefelé
 * görget – onnantól (felfelé görgetéskor is) végig látható marad.
 */
export function RevealOnScrollDown({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [shown, setShown] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (shown) return;
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current + 8) setShown(true);
      else lastY.current = Math.min(lastY.current, y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shown]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0",
        className
      )}
      aria-hidden={!shown}
    >
      {children}
    </div>
  );
}
