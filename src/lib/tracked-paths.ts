/**
 * Amelyik oldalak látogatottságát mérjük. A lista zárt: a rögzítő végpont
 * csak ezeket fogadja el, az admin felület pedig ezekből rakja ki a
 * lapfüleket.
 */
export const TRACKED_PAGES = [
  { path: "/", label: "Főoldal" },
  { path: "/meghivo", label: "Meghívók" },
] as const;

export type TrackedPath = (typeof TRACKED_PAGES)[number]["path"];

export const TRACKED_PATHS: readonly string[] = TRACKED_PAGES.map((p) => p.path);

export const DEFAULT_TRACKED_PATH: TrackedPath = "/";

export function trackedPageLabel(path: string): string {
  return TRACKED_PAGES.find((p) => p.path === path)?.label ?? path;
}
