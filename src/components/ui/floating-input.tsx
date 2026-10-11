"use client";

import { useState, useRef, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

function renderLabel(text: string) {
  if (!text.includes("*")) return text;
  const parts = text.split("*");
  return <>{parts[0]}<span className="text-[1.2em] font-bold leading-none align-middle">*</span>{parts.slice(1).join("*")}</>;
}

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  value: string;
  accentColor?: string;
  compact?: boolean;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, id, value, className, onFocus, onBlur, type, accentColor = "#84AAA6", compact = false, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [autofilled, setAutofilled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showLastChar, setShowLastChar] = useState(false);
    const lastCharTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const floated = focused || String(value).length > 0 || autofilled;

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword || showLastChar ? "text" : "password") : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(e);
      if (isPassword && !showPassword) {
        if (lastCharTimer.current) clearTimeout(lastCharTimer.current);
        setShowLastChar(true);
        lastCharTimer.current = setTimeout(() => setShowLastChar(false), 800);
      }
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          value={value}
          type={inputType}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          onAnimationStart={(e) => {
            if (e.animationName === "autofill-start") setAutofilled(true);
            if (e.animationName === "autofill-cancel") setAutofilled(false);
          }}
          onChange={handleChange}
          className={cn(
            "ios-glass-field w-full rounded-xl px-4 outline-none",
            /* A címke a mezőn belül, felül ül (iOS-stílus), ezért a szöveg
               lejjebb kezdődik. */
            compact ? "h-12 text-sm pt-3.5" : "h-14 text-base pt-4",
            isPassword && "pr-11",
            className
          )}
          placeholder=""
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute left-4 pointer-events-none transition-all duration-150",
            compact
              ? floated ? `top-1.5 text-[11px] ${focused ? "" : "text-[#84AAA6]"}` : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              : floated ? `top-2 text-xs ${focused ? "" : "text-[#84AAA6]"}` : "top-1/2 -translate-y-1/2 text-base text-gray-400"
          )}
          style={{ color: focused ? accentColor : undefined }}
        >
          {renderLabel(label)}
        </label>
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
          >
            {showPassword
              ? <EyeOff className="h-5 w-5" strokeWidth={1.75} />
              : <Eye className="h-5 w-5" strokeWidth={1.75} />
            }
          </button>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

interface FloatingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  value: string;
  accentColor?: string;
  compact?: boolean;
}

const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, id, value, className, onFocus, onBlur, accentColor = "#84AAA6", compact = false, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const floated = focused || String(value).length > 0;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          value={value}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className={cn(
            "ios-glass-field w-full rounded-xl px-4 outline-none resize-none",
            compact ? "pt-5 pb-2 text-sm" : "pt-6 pb-2 text-base",
            className
          )}
          placeholder=""
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute left-4 pointer-events-none transition-all duration-150",
            compact
              ? floated ? `top-1.5 text-[10px] ${focused ? "" : "text-[#84AAA6]"}` : "top-3.5 text-sm text-gray-400"
              : floated ? `top-2 text-xs ${focused ? "" : "text-[#84AAA6]"}` : "top-4 text-base text-gray-400"
          )}
          style={{ color: focused ? accentColor : undefined }}
        >
          {renderLabel(label)}
        </label>
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingInput, FloatingTextarea };
