"use client";

import { useState, useRef, useEffect } from "react";

const COUNTRY_CODES = [
  { code: "+36", flag: "🇭🇺", name: "HU" },
  { code: "+43", flag: "🇦🇹", name: "AT" },
  { code: "+40", flag: "🇷🇴", name: "RO" },
  { code: "+421", flag: "🇸🇰", name: "SK" },
  { code: "+385", flag: "🇭🇷", name: "HR" },
  { code: "+381", flag: "🇷🇸", name: "RS" },
  { code: "+49", flag: "🇩🇪", name: "DE" },
  { code: "+44", flag: "🇬🇧", name: "GB" },
];

export function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [countryCode, setCountryCode] = useState("+36");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const p1Ref = useRef<HTMLInputElement>(null);
  const p2Ref = useRef<HTMLInputElement>(null);
  const p3Ref = useRef<HTMLInputElement>(null);
  const parsedRef = useRef(false);

  // Parse incoming value on initial load (e.g. when editing a saved profile)
  useEffect(() => {
    if (parsedRef.current || !value) return;
    const parts = value.trim().split(/\s+/);
    if (parts.length >= 2) {
      const code = COUNTRY_CODES.find((c) => c.code === parts[0]);
      if (code) {
        parsedRef.current = true;
        setCountryCode(parts[0]);
        setP1(parts[1] ?? "");
        setP2(parts[2] ?? "");
        setP3(parts[3] ?? "");
      }
    }
  }, [value]);

  const update = (code: string, a: string, b: string, c: string) => {
    const full = a || b || c ? `${code} ${a} ${b} ${c}`.trimEnd() : "";
    onChange(full);
  };

  const handleP1 = (v: string) => {
    setP1(v);
    update(countryCode, v, p2, p3);
    if (v.length === 2) p2Ref.current?.focus();
  };
  const handleP2 = (v: string) => {
    setP2(v);
    update(countryCode, p1, v, p3);
    if (v.length === 3) p3Ref.current?.focus();
  };
  const handleP3 = (v: string) => {
    setP3(v);
    update(countryCode, p1, p2, v);
  };
  const handleCountry = (code: string) => {
    setCountryCode(code);
    update(code, p1, p2, p3);
  };

  // keep value prop in sync if cleared externally
  if (!value && (p1 || p2 || p3)) { setP1(""); setP2(""); setP3(""); }

  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 h-14 focus-within:border-[#84AAA6] bg-white transition-colors">
      <select
        value={countryCode}
        onChange={(e) => handleCountry(e.target.value)}
        className="bg-transparent text-base outline-none cursor-pointer shrink-0"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <span className="text-gray-300">|</span>
      <input
        ref={p1Ref}
        type="text"
        inputMode="text"
        placeholder="20"
        value={p1}
        onChange={(e) => handleP1(e.target.value)}
        className="w-8 text-base outline-none bg-transparent text-center"
        maxLength={2}
      />
      <span className="text-gray-400 text-base">–</span>
      <input
        ref={p2Ref}
        type="text"
        inputMode="text"
        placeholder="123"
        value={p2}
        onChange={(e) => handleP2(e.target.value)}
        className="w-10 text-base outline-none bg-transparent text-center"
        maxLength={3}
      />
      <span className="text-gray-400 text-base">–</span>
      <input
        ref={p3Ref}
        type="text"
        inputMode="text"
        placeholder="4567"
        value={p3}
        onChange={(e) => handleP3(e.target.value)}
        className="w-14 text-base outline-none bg-transparent text-center"
        maxLength={4}
      />
    </div>
  );
}
