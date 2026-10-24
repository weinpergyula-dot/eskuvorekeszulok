"use client";

/* A szolgáltató weboldal-linkje. Instagram- és Facebook-címnél az URL
   helyett a közösségi oldal neve látszik. Telefonon ezek ugyanabban a
   lapban nyílnak meg: az instagram.com / facebook.com linkeket az iOS és
   az Android így adja át a telepített alkalmazásnak (új lapban sokszor a
   böngészőben maradnak). */

const SOCIAL: { label: string; hosts: RegExp }[] = [
  { label: "Instagram", hosts: /(^|\.)(instagram\.com|instagr\.am)$/i },
  { label: "Facebook", hosts: /(^|\.)(facebook\.com|fb\.com|fb\.me)$/i },
];

export function websiteHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** „Instagram” / „Facebook”, ha a cím ilyen oldalra mutat, különben null. */
export function socialLabel(value: string): string | null {
  try {
    const host = new URL(websiteHref(value.trim())).hostname;
    return SOCIAL.find((s) => s.hosts.test(host))?.label ?? null;
  } catch {
    return null;
  }
}

export function WebsiteLink({ value, className }: { value: string; className?: string }) {
  const href = websiteHref(value.trim());
  const social = socialLabel(value);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={social ? value : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (social && window.matchMedia("(pointer: coarse)").matches) {
          e.preventDefault();
          window.location.href = href;
        }
      }}
      className={className}
    >
      {social ?? value}
    </a>
  );
}
