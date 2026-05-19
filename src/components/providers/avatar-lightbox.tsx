"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarLightboxProps {
  src: string | null | undefined;
  name: string;
  size?: string;
}

export function AvatarLightbox({ src, name, size = "w-28 h-28" }: AvatarLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          size,
          "rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center shrink-0",
          src && "cursor-zoom-in"
        )}
        onClick={() => src && setOpen(true)}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-bold text-gray-900">{name.charAt(0)}</span>
        )}
      </div>

      {open && src && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl select-none cursor-zoom-out"
          />
        </div>
      )}
    </>
  );
}
