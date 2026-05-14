"use client";

import { useState } from "react";
import { X } from "lucide-react";
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
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <X className="h-7 w-7" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl select-none"
          />
        </div>
      )}
    </>
  );
}
