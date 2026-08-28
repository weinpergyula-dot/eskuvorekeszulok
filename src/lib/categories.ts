import { CATEGORY_LABELS, type ServiceCategory } from "./types";

/**
 * Kategóriákkal kapcsolatos közös szabályok, hogy a csempék, a legördülők,
 * a lábléc és a listázás ugyanazt a sorrendet és darabszámot mutassa.
 */

/** A saját digitális meghívónk kategóriája. */
export const HOUSE_CATEGORY: ServiceCategory = "meghivo";

/**
 * A Meghívók között a saját meghívó-szolgáltatásunk is ott van (a lista élén
 * álló kiemelt sávként), ezért regisztrációtól függetlenül eggyel többet
 * mutatunk, mint ahány szolgáltató regisztrált.
 */
export const HOUSE_OFFER_COUNT = 1;

/** A látogatónak mutatott darabszám egy kategóriában. */
export function displayCount(category: string, counts: Record<string, number>) {
  return (counts[category] ?? 0) + (category === HOUSE_CATEGORY ? HOUSE_OFFER_COUNT : 0);
}

/**
 * A kategóriák megjelenítési sorrendje: a Meghívók áll az élen, utána a
 * többi csökkenő szolgáltatószám szerint.
 */
export function orderedCategories(counts: Record<string, number>): ServiceCategory[] {
  return (Object.keys(CATEGORY_LABELS) as ServiceCategory[]).sort((a, b) => {
    if (a === b) return 0;
    if (a === HOUSE_CATEGORY) return -1;
    if (b === HOUSE_CATEGORY) return 1;
    return displayCount(b, counts) - displayCount(a, counts);
  });
}
