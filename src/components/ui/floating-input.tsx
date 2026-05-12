"use client";

import { useState, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
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
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, id, value, className, onFocus, onBlur, type, accentColor = "#84AAA6", ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [autofilled, setAutofilled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const floated = focused || String(value).length > 0 || autofilled;

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

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
          className={cn(
            "w-full h-14 border rounded-xl px-4 text-base outline-none transition-colors bg-white",
            isPassword && "pr-11",
            isPassword && !showPassword && "text-xl tracking-[0.2em]",
            !focused && "border-gray-300",
            className
          )}
          style={{ borderColor: focused ? accentColor : undefined }}
          placeholder=""
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute left-4 pointer-events-none transition-all duration-150 bg-white -translate-y-1/2",
            floated ? `top-0 text-sm px-1 ${focused ? "" : "text-[#84AAA6]"}` : "top-1/2 text-base text-gray-400"
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
}

const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, id, value, className, onFocus, onBlur, accentColor = "#84AAA6", ...props }, ref) => {
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
            "w-full border rounded-xl px-4 pt-6 pb-2 text-base outline-none transition-colors bg-white resize-none",
            !focused && "border-gray-300",
            className
          )}
          style={{ borderColor: focused ? accentColor : undefined }}
          placeholder=""
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute left-4 pointer-events-none transition-all duration-150 bg-white",
            floated ? `-top-2.5 text-xs px-1 ${focused ? "" : "text-[#84AAA6]"}` : "top-4 text-base text-gray-400"
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
