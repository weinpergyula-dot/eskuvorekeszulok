"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathname = useRef(pathname);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (ticker.current) clearInterval(ticker.current);
    setVisible(true);
    setProgress(10);
    ticker.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 80) { clearInterval(ticker.current!); return p; }
        return p + Math.random() * 12;
      });
    }, 180);
  };

  const complete = () => {
    if (ticker.current) clearInterval(ticker.current);
    setProgress(100);
    completeTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 350);
  };

  // Intercept link clicks to start the bar
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http") ||
        anchor.getAttribute("target") === "_blank"
      ) return;
      if (href === pathname) return;
      start();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  // Complete when route changes
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      complete();
    }
  }, [pathname]);

  useEffect(() => () => {
    if (ticker.current) clearInterval(ticker.current);
    if (completeTimer.current) clearTimeout(completeTimer.current);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
      <div
        className="h-full bg-[#84AAA6] shadow-[0_0_8px_rgba(132,170,166,0.7)] transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
