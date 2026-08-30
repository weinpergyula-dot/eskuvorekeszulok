"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Mobilon összecsukható blokk: a fejléc kattintható, a tartalom alapból zárva
 * van és legördülővel bontható ki. sm-től felfelé a tartalom mindig látszik és
 * a fejléc nem interaktív.
 */
export function MobileCollapsible({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 text-left cursor-pointer sm:cursor-default sm:pointer-events-none"
      >
        {title}
        <ChevronDown
          className={`h-6 w-6 shrink-0 text-white/80 transition-transform duration-200 sm:hidden ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      <div className={open ? undefined : "hidden sm:block"}>{children}</div>
    </>
  );
}
