import { logError } from "@/lib/log-error";

/**
 * Kik tudnak egyáltalán ajánlatkérést fogadni?
 *
 * A quote_request_recipients.provider_user_id mezőn idegenkulcs ül, ezért
 * olyan szolgáltatóhoz, akinek nincs meg a felhasználói profilja, a címzett
 * sora nem hozható létre: a beszúrás elhasal, és az ajánlatkérés utána sehol
 * nem látszik – sem a küldőnél, sem a szolgáltatónál. Az ilyen sorokat ezért
 * a címzettválasztó sem kínálja fel, és a küldés is kihagyja őket.
 *
 * A profil hiánya adathiba, nem szokásos állapot, ezért naplózzuk: így
 * kiderül, melyik szolgáltatói sort kell rendbe tenni.
 */
export async function filterReachableProviders<
  T extends { id: string; user_id: string | null; full_name?: string | null },
>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  providers: T[],
  source: string,
  /* A címzettválasztó minden kategória- és megyeváltásnál lekérdez, ezért
     onnan nem naplózunk: ugyanaz a hiányzó profil percenként újra beesne.
     A küldésnél viszont fontos, hogy nyoma maradjon. */
  logUnreachable = true,
): Promise<T[]> {
  const userIds = [...new Set(providers.map((p) => p.user_id).filter(Boolean))] as string[];
  if (userIds.length === 0) return [];

  const { data: rows, error } = await admin
    .from("profiles")
    .select("user_id")
    .in("user_id", userIds);

  /* Ha maga az ellenőrzés hal el, ne tüntessük el emiatt az összes
     szolgáltatót – menjen tovább a régi úton, a hibának pedig maradjon nyoma. */
  if (error) {
    await logError(source, `a szolgáltatók profil-ellenőrzése sikertelen: ${error.message}`, { providers: providers.length });
    return providers;
  }

  const known = new Set((rows ?? []).map((r: { user_id: string }) => r.user_id));
  const isReachable = (p: T) => !!p.user_id && known.has(p.user_id);

  const unreachable = providers.filter((p) => !isReachable(p));
  if (unreachable.length > 0 && logUnreachable) {
    await logError(
      source,
      `profil nélküli szolgáltató(k), nem kaphatnak ajánlatkérést: ${unreachable.map((p) => `${p.full_name ?? "?"} (${p.id})`).join(", ")}`,
      { count: unreachable.length, providerIds: unreachable.map((p) => p.id) },
    );
  }

  return providers.filter(isReachable);
}
